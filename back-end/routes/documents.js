const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');

// File to store documents
function getDocuments() {
  if (!fs.existsSync('documents.json')) return [];
  return JSON.parse(fs.readFileSync('documents.json'));
}
function saveDocuments(docs) {
  fs.writeFileSync('documents.json', JSON.stringify(docs, null, 2));
}

const router = express.Router();

// Tạo tài liệu
router.post('/', (req, res) => {
  const { title, content, creatorId, signers } = req.body;
  if (!title || !content || !creatorId || !Array.isArray(signers) || signers.length === 0) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const doc = {
    id: uuidv4(),
    title,
    content,
    hash,
    creatorId,
    signers,
    signatures: [],
    status: 'pending',
    createdAt: new Date().toISOString()
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
    docs = docs.filter(doc => doc.creatorId === userId || doc.signers.includes(userId));
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

// Ký tài liệu
router.post('/:id/sign', (req, res) => {
  const { id } = req.params;
  const { userId, signature, publicKey } = req.body;
  if (!userId || !signature || !publicKey) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  let docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  if (!doc.signers.includes(userId)) {
    return res.status(403).json({ message: 'User is not allowed to sign this document' });
  }
  if (doc.signatures.find(s => s.userId === userId)) {
    return res.status(409).json({ message: 'User already signed' });
  }
  doc.signatures.push({ userId, signature, publicKey, signedAt: new Date().toISOString() });
  if (doc.signatures.length === doc.signers.length) {
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
