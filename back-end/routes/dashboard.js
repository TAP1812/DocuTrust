const express = require('express');
const auth = require('../middleware/auth');
const fs = require('fs');

function getDocuments() {
  if (!fs.existsSync('documents.json')) return [];
  return JSON.parse(fs.readFileSync('documents.json'));
}

const router = express.Router();

// Dashboard - trả về thông tin tổng quan cho user
router.get('/', auth, (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });
  const docs = getDocuments();
  const createdDocs = docs.filter(doc => doc.creatorId === userId);
  const needToSign = docs.filter(doc => doc.signers.includes(userId) && !doc.signatures.find(s => s.userId === userId));
  const signedDocs = docs.filter(doc => doc.signatures.find(s => s.userId === userId));
  res.json({
    createdDocuments: createdDocs,
    needToSignDocuments: needToSign,
    signedDocuments: signedDocs
  });
});

module.exports = router;
