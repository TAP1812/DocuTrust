const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  shareDocument,
  deleteDocument,
  getDocumentFileContent
} = require('../controllers/documentController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Document routes
router.post('/', auth, upload.single('file'), createDocument);
router.get('/', auth, getDocuments);
router.get('/:id', auth, getDocument);
router.get('/:id/file-content', auth, getDocumentFileContent);
router.put('/:id', auth, updateDocument);
router.post('/:id/share', auth, shareDocument);
router.delete('/:id', auth, deleteDocument);

module.exports = router; 