const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const Document = require('../models/Document');
const User = require('../models/User');
const {
  getDocuments,
  getDocument,
  updateDocument,
  shareDocument,
  deleteDocument,
  getDocumentFileContent
} = require('../controllers/documentController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Only allow PDF, DOC, DOCX files
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
      cb(new Error('Only PDF, DOC, DOCX files are allowed'));
    }
  }
});

// Create a new document
router.post('/', auth, upload.single('file'), async (req, res) => {
  var formattedSigners = null;
  try {
    const { title, content, creatorId } = req.body;
    let signers = req.body.signers;
    
    // Validate required fields
    if (!title || !content || !creatorId) {
      return res.status(400).json({ message: 'Missing document information' });
    }    
    
    // Parse signers from JSON string if needed
    try {
      if (typeof signers === 'string') {
        signers = JSON.parse(signers);
      }
      if (!Array.isArray(signers)) {
        throw new Error('Signers must be an array');
      }
      // Validate each element
      for (const s of signers) {
        if (!s.email || typeof s.email !== 'string') {
          throw new Error('Each signer must have a valid email');
        }
      }
      // Find users by email
      const userPromises = signers.map(s => User.findOne({ email: s.email }));
      const users = await Promise.all(userPromises);
      // Ensure userId is a real ObjectId (convert if string)
      formattedSigners = signers.map((s, idx) => {
        const user = users[idx];
        if (!user) {
          throw new Error(`User with email ${s.email} not found`);
        }
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
      return res.status(400).json({ message: 'Missing signers list' });
    }

    for (const s of formattedSigners) {
      if (!s.userId) {
        return res.status(400).json({ message: 'Each signer must have userId or email' });
      }
      if (!['signer', 'viewer'].includes(s.role)) {
        return res.status(400).json({ message: 'Role must be signer or viewer' });
      }
    }

    // Convert creatorId to ObjectId
    const objectId = mongoose.Types.ObjectId.isValid(creatorId) 
      ? creatorId 
      : mongoose.Types.ObjectId(creatorId);

    // Create hash from content
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    // Create new document
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

    const doc = new Document(documentData);
    await doc.save();

    res.json({ message: 'Document created', document: doc });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Cannot create document' });
  }
});

// Get all documents for a user
router.get('/', auth, async (req, res) => {
  try {    
    const { userId } = req.query;
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
    res.status(500).json({ message: 'Cannot get documents list' });
  }
});

// Get a single document
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ document: doc });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Cannot get document information' });
  }
});

// Get file content of a document
router.get('/:id/file-content', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get absolute path to the file
    const filePath = path.resolve(__dirname, '../..', doc.filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Sign a document
router.post('/:id/sign', auth, async (req, res) => {
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

    // Mark as completed if all signers have signed
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
    res.status(500).json({ message: 'Cannot sign document' });
  }
});

// Verify document signatures
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    
    await doc.populate('signatures.userId');
    
    const results = doc.signatures.map(sig => {
      try {
        return {
          userId: sig.userId._id,
          email: sig.userId.email,
          signedAt: sig.signedAt,
          verified: true // Implement actual signature verification here
        };
      } catch (err) {
        return {
          userId: sig.userId._id,
          email: sig.userId.email,
          signedAt: sig.signedAt,
          verified: false,
          error: err.message
        };
      }
    });

    res.json({
      documentId: doc._id,
      documentHash: doc.hash,
      verificationResults: results
    });
  } catch (error) {
    console.error('Verify signatures error:', error);
    res.status(500).json({ message: 'Cannot verify signatures' });
  }
});

module.exports = router; 