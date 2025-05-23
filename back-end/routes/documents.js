const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Chỉ cho phép upload file PDF, DOC, DOCX
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file PDF, DOC, DOCX'));
    }
  }
});

const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');

// Tạo tài liệu (có thể upload file, nhiều người ký, có role)
router.post('/', upload.single('file'), async (req, res) => {
  var formattedSigners = null;
  try {
    //console.log('Received document request:', req.body);
    const { title, content, creatorId } = req.body;
    let signers = req.body.signers;
    
    // Validate required fields
    if (!title || !content || !creatorId) {
      //console.log('Missing required fields:', { title, content, creatorId });
      return res.status(400).json({ message: 'Thiếu thông tin tài liệu' });
    }    // Parse signers từ JSON string nếu cần
    try {
      if (typeof signers === 'string') {
        signers = JSON.parse(signers);
      }
      if (!Array.isArray(signers)) {
        throw new Error('Signers must be an array');
      }
      // Validate từng phần tử
      for (const s of signers) {
        if (!s.email || typeof s.email !== 'string') {
          throw new Error('Each signer must have a valid email');
        }
      }
      // Tìm user theo email
      const userPromises = signers.map(s => User.findOne({ email: s.email }));
      const users = await Promise.all(userPromises);
      // Đảm bảo userId là ObjectId thực sự (convert nếu là string)
      formattedSigners = signers.map((s, idx) => {
        const user = users[idx];
        if (!user) {
          throw new Error(`User with email ${s.email} not found`);
        }
        // Nếu user._id là string hoặc object lạ, luôn ép về ObjectId bằng new mongoose.Types.ObjectId
        let userId = user._id;
        if (!(userId instanceof mongoose.Types.ObjectId)) {
          userId = new mongoose.Types.ObjectId(userId);
        }
        return {
          userId,
          role: s.role === 'viewer' ? 'viewer' : 'signer'
        };
      });
    } catch (e) {
      console.error('Error processing signers:', e);
      return res.status(400).json({ message: e.message || 'Invalid signers format' });
    }

    // Validate signers
    if (!formattedSigners || formattedSigners.length === 0) {
      return res.status(400).json({ message: 'Thiếu danh sách người ký' });
    }

    for (const s of formattedSigners) {
      if (!s.userId) {
        return res.status(400).json({ message: 'Mỗi người ký phải có userId hoặc email' });
      }
      if (!['signer', 'viewer'].includes(s.role)) {
        return res.status(400).json({ message: 'Role phải là signer hoặc viewer' });
      }
    }

    // Convert creatorId to ObjectId
    const objectId = mongoose.Types.ObjectId.isValid(creatorId) 
      ? creatorId 
      : mongoose.Types.ObjectId(creatorId);

    // Tạo hash từ nội dung
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    //console.log('Type of signers:', typeof formattedSigners);
    // Tạo document mới
    const documentData = {
      title,
      content,
      hash,
      creatorId: objectId,
      signers: formattedSigners,
      signatures: [],
      status: 'pending',
      createdAt: new Date(),
      filePath: req.file ? path.relative(process.cwd(), req.file.path) : null,
      fileName: req.file ? req.file.originalname : null
    };

    //console.log('Creating document with data:', documentData);

    const doc = new Document(documentData);
    await doc.save();

    res.json({ message: 'Document created', document: doc });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Không thể tạo tài liệu' });
  }
});

// Lấy danh sách tài liệu
router.get('/', async (req, res) => {
  try {    const { userId } = req.query;
    let query = {};
    
    if (userId) {
      const userObjectId = mongoose.Types.ObjectId.isValid(userId)
        ? mongoose.Types.ObjectId(userId)
        : null;

      if (!userObjectId) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      query = {
        $or: [
          { creatorId: userObjectId },
          { 'signers.userId': userObjectId }
        ]
      };
    }
    
    const docs = await Document.find(query)
      .populate('creatorId', 'email fullName')
      .populate('signers.userId', 'email fullName');
    res.json({ documents: docs });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách tài liệu' });
  }
});

// Lấy chi tiết tài liệu
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ document: doc });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Không thể lấy thông tin tài liệu' });
  }
});

// Ký tài liệu (chỉ cho phép user có role 'signer')
router.post('/:id/sign', async (req, res) => {
  try {
    const { userId, signature, publicKey } = req.body;
    if (!userId || !signature || !publicKey) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

  // Convert userId to ObjectId if it's not already
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? mongoose.Types.ObjectId(userId)
      : null;
      
    if (!userObjectId) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const signer = doc.signers.find(s => 
      s.userId.equals(userObjectId) && s.role === 'signer'
    );
    
    if (!signer) {
      return res.status(403).json({ message: 'User is not allowed to sign this document' });
    }

    if (doc.signatures.find(s => s.userId.equals(userObjectId))) {
      return res.status(409).json({ message: 'User already signed' });
    }

    doc.signatures.push({ userId, signature, publicKey, signedAt: new Date() });

    // Đánh dấu hoàn thành nếu tất cả signer đã ký
    const allSigned = doc.signers
      .filter(s => s.role === 'signer')
      .every(s => doc.signatures.find(sig => sig.userId === s.userId));

    if (allSigned) {
      doc.status = 'completed';
      doc.completedAt = new Date();
    }

    await doc.save();
    res.json({ message: 'Signed successfully', document: doc });
  } catch (error) {
    console.error('Sign document error:', error);
    res.status(500).json({ message: 'Không thể ký tài liệu' });
  }
});

// Xác minh chữ ký tài liệu
router.post('/:id/verify', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });    // Populate user information for each signature
    await doc.populate('signatures.userId');
    
    const results = doc.signatures.map(sig => {
      try {
        return {
          userId: sig.userId._id, // get the ObjectId
          email: sig.userId.email, // include email for display
          valid: !!sig.signature,
          signedAt: sig.signedAt
        };
      } catch {
        return {
          userId: sig.userId._id,
          email: 'Unknown',
          valid: false,
          signedAt: sig.signedAt
        };
      }
    });

    res.json({ hash: doc.hash, verifyResults: results });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ message: 'Không thể xác minh tài liệu' });
  }
});

module.exports = router;
