const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

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

// File to store documents
function getDocuments() {
  if (!fs.existsSync('documents.json')) return [];
  return JSON.parse(fs.readFileSync('documents.json'));
}
function saveDocuments(docs) {
  fs.writeFileSync('documents.json', JSON.stringify(docs, null, 2));
}

const router = express.Router();

// Tạo tài liệu (có thể upload file, nhiều người ký, có role)
router.post('/', upload.single('file'), (req, res) => {
  const { title, content, creatorId } = req.body;
  let signers = req.body.signers;
  // Hỗ trợ nhận signers là JSON string hoặc array
  if (typeof signers === 'string') {
    try { signers = JSON.parse(signers); } catch { signers = [signers]; }
  }
  // Chuyển đổi từ email sang userId (nếu có email, gán vào userId)
  signers = signers.map(s => {
    if (s.email && !s.userId) return { userId: s.email, role: s.role };
    return s;
  });
  // Đảm bảo signers là mảng các object { userId, role }
  if (!Array.isArray(signers) || signers.length === 0) {
    return res.status(400).json({ message: 'Thiếu danh sách người ký' });
  }
  // Kiểm tra từng signer phải có userId và role
  for (const s of signers) {
    if (!s.userId || !s.role) {
      return res.status(400).json({ message: 'Mỗi người ký phải có userId và role' });
    }
  }
  if (!title || !content || !creatorId) {
    return res.status(400).json({ message: 'Thiếu thông tin tài liệu' });
  }
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const doc = {
    id: uuidv4(),
    title,
    content,
    hash,
    creatorId,
    signers, // [{ userId, role }]
    signatures: [],
    status: 'pending',
    createdAt: new Date().toISOString(),
    filePath: req.file ? path.relative(process.cwd(), req.file.path) : null,
    fileName: req.file ? req.file.originalname : null
  };
  let docs = getDocuments();
  docs.push(doc);
  saveDocuments(docs);
  res.json({ message: 'Document created', document: doc });
});

// Lấy danh sách tài liệu
router.get('/', (req, res) => {
  const { userId } = req.query;
  let docs = getDocuments();
  if (userId) {
    docs = docs.filter(doc => doc.creatorId === userId || doc.signers.some(s => s.userId === userId));
  }
  res.json({ documents: docs });
});

// Lấy chi tiết tài liệu
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  res.json({ document: doc });
});

// Ký tài liệu (chỉ cho phép user có role 'signer')
router.post('/:id/sign', (req, res) => {
  const { id } = req.params;
  const { userId, signature, publicKey } = req.body;
  if (!userId || !signature || !publicKey) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  let docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  const signer = doc.signers.find(s => s.userId === userId && s.role === 'signer');
  if (!signer) {
    return res.status(403).json({ message: 'User is not allowed to sign this document' });
  }
  if (doc.signatures.find(s => s.userId === userId)) {
    return res.status(409).json({ message: 'User already signed' });
  }
  doc.signatures.push({ userId, signature, publicKey, signedAt: new Date().toISOString() });
  // Đánh dấu hoàn thành nếu tất cả signer đã ký
  const allSigned = doc.signers.filter(s => s.role === 'signer').every(s => doc.signatures.find(sig => sig.userId === s.userId));
  if (allSigned) {
    doc.status = 'completed';
    doc.completedAt = new Date().toISOString();
  }
  saveDocuments(docs);
  res.json({ message: 'Signed successfully', document: doc });
});

// Xác minh chữ ký tài liệu
router.post('/:id/verify', (req, res) => {
  const { id } = req.params;
  let docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  const results = doc.signatures.map(sig => {
    try {
      return { userId: sig.userId, valid: !!sig.signature, signedAt: sig.signedAt };
    } catch {
      return { userId: sig.userId, valid: false, signedAt: sig.signedAt };
    }
  });
  res.json({ hash: doc.hash, verifyResults: results });
});

module.exports = router;
