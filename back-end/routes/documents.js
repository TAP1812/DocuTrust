const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const { ethers } = require('ethers');

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../uploads');
if (!require('fs').existsSync(uploadDir)) {
  require('fs').mkdirSync(uploadDir);
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
        ? new mongoose.Types.ObjectId(userId)
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

// Get file content of a document
router.get('/:id/file-content', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get absolute path to the file
    const filePath = path.resolve(__dirname, '..', doc.filePath);
    
    // Check if file exists
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Ký tài liệu (CLIENT sẽ cung cấp signature, server chỉ lưu)
router.post('/:id/sign', async (req, res) => {
  try {
    // Thay vì privateKey, nhận signature trực tiếp từ client
    const { userId, signature } = req.body;

    if (!userId || !signature) {
      return res.status(400).json({ message: 'Thiếu userId hoặc signature.' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Tài liệu không tồn tại.' });

    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId)
      : null;
      
    if (!userObjectId) {
      return res.status(400).json({ message: 'Định dạng userId không hợp lệ.' });
    }

    // Kiểm tra xem user có quyền ký tài liệu này không
    const isCreator = doc.creatorId.equals(userObjectId);
    const designatedSignerEntry = doc.signers.find(s => s.userId.equals(userObjectId) && s.role === 'signer');

    if (!isCreator && !designatedSignerEntry) {
      const userEntryInSigners = doc.signers.find(s => s.userId.equals(userObjectId));
      let denyMessage = 'Người dùng không có quyền ký tài liệu này.';

      if (userEntryInSigners) { // User is in the list, but not as a 'signer' (and not creator)
        denyMessage = `Bạn có vai trò '${userEntryInSigners.role}' trong tài liệu này. Chỉ người tạo hoặc người có vai trò 'signer' mới được ký.`;
      } else { // User is not creator AND not in the signers list at all
        denyMessage = 'Bạn không phải là người tạo tài liệu này và cũng không có trong danh sách người được chỉ định để ký.';
      }
      return res.status(403).json({ message: denyMessage });
    }

    // Kiểm tra xem user đã ký chưa
    if (doc.signatures.find(s => s.userId === userObjectId.toString())) {
      return res.status(409).json({ message: 'Người dùng đã ký tài liệu này rồi.' });
    }

    // Thêm chữ ký vào tài liệu (không có publicKey)
    doc.signatures.push({ 
      userId: userObjectId.toString(), 
      signature: signature, // Chữ ký từ client
      signedAt: new Date() 
    });

    // Kiểm tra xem tất cả người ký đã ký chưa để cập nhật status
    const allSignersInDoc = doc.signers.filter(s => s.role === 'signer');
    const allHaveSigned = allSignersInDoc.every(s => 
        doc.signatures.find(sig => sig.userId === s.userId.toString())
    );

    if (allHaveSigned) {
      doc.status = 'completed';
      doc.completedAt = new Date();
    }

    await doc.save();
    res.json({ 
      message: 'Chữ ký từ client đã được lưu thành công.', 
      document: doc 
    });

  } catch (error) {
    console.error('Lỗi khi lưu chữ ký client (vào API /sign):', error);
    res.status(500).json({ message: 'Lỗi server khi lưu chữ ký.', error: error.message });
  }
});

// Xác minh chữ ký tài liệu
router.post('/:id/verify', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('signers.userId', 'email fullName');
    if (!doc) {
      return res.status(404).json({ message: 'Tài liệu không tìm thấy' });
    }

    let fileContentBytes;
    let contentSource = '';

    // Ưu tiên filePath nếu có
    if (doc.filePath) {
      const absoluteFilePath = path.isAbsolute(doc.filePath) ? doc.filePath : path.join(__dirname, '..', doc.filePath);
      try {
        const fileBuffer = await fs.readFile(absoluteFilePath);
        fileContentBytes = ethers.toUtf8Bytes(fileBuffer.toString('utf8'));
        contentSource = `filePath: ${doc.filePath}`;
      } catch (fileError) {
        console.error(`Lỗi đọc file từ filePath ${doc.filePath}:`, fileError);
        if (doc.content) {
          fileContentBytes = ethers.toUtf8Bytes(doc.content);
          contentSource = 'doc.content (fallback do lỗi filePath)';
        } else {
          return res.status(500).json({ message: 'Không thể đọc nội dung tài liệu từ filePath và không có content dự phòng.', error: fileError.message });
        }
      }
    } else if (doc.content) {
      fileContentBytes = ethers.toUtf8Bytes(doc.content);
      contentSource = 'doc.content';
    } else {
      return res.status(400).json({ message: 'Không có nội dung tài liệu để xác minh (thiếu cả filePath và content).' });
    }

    if (!fileContentBytes) {
        return res.status(500).json({ message: 'Không thể lấy được nội dung tài liệu để hash.' });
    }

    const documentHashUsedForVerification = ethers.keccak256(fileContentBytes);

    const verificationResults = [];
    if (!doc.signatures || doc.signatures.length === 0) {
      return res.status(200).json({
        message: 'Tài liệu chưa có chữ ký nào để xác minh.',
        documentHashUsedForVerification,
        originalSha256HashInDb: doc.hash,
        verificationResults: [],
        contentSource
      });
    }

    for (const sig of doc.signatures) {
      const verificationDetail = {
        userId: sig.userId,
        signedAt: sig.signedAt,
        signatureUsed: sig.signature,
        verified: false,
        error: null,
        signerInfo: null,
        publicKeyUsed: null
      };

      try {
        const user = await User.findById(sig.userId);
        if (!user) {
          verificationDetail.error = 'Không tìm thấy người dùng với ID này.';
          verificationDetail.signerInfo = { userId: sig.userId, note: 'User not found' }; 
          verificationResults.push(verificationDetail);
          continue; 
        }

        verificationDetail.signerInfo = { 
            email: user.email, 
            fullName: user.fullName 
        };
        verificationDetail.publicKeyUsed = user.publicKey;

        if (!user.publicKey) {
            verificationDetail.error = 'Người dùng này không có publicKey được lưu trữ.';
            verificationResults.push(verificationDetail);
            continue;
        }

        const recoveredAddress = ethers.verifyMessage(documentHashUsedForVerification, sig.signature);
        const expectedAddress = ethers.computeAddress(user.publicKey);

        if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
          verificationDetail.verified = true;
        } else {
          verificationDetail.error = 'Chữ ký không khớp với publicKey của người dùng.';
        }
      } catch (e) {
        console.error(`Lỗi khi xác minh chữ ký cho user ${sig.userId}:`, e);
        verificationDetail.error = `Lỗi trong quá trình xác minh: ${e.message}`;
      }
      verificationResults.push(verificationDetail);
    }

    res.status(200).json({
      message: 'Hoàn tất quá trình xác minh chữ ký.',
      documentHashUsedForVerification,
      originalSha256HashInDb: doc.hash,
      verificationResults,
      contentSource
    });

  } catch (error) {
    console.error('Lỗi trong API xác minh:', error);
    res.status(500).json({ message: 'Lỗi server khi xác minh tài liệu', error: error.message });
  }
});

module.exports = router;
