const express = require('express');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

function getDocuments() {
  if (!fs.existsSync('documents.json')) return [];
  return JSON.parse(fs.readFileSync('documents.json'));
}

// Đọc users từ file users.json
function getUsers() {
  const usersPath = path.join(__dirname, '../users.json');
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath));
}

const router = express.Router();

// Dashboard - trả về thông tin tổng quan cho user, kèm tên người ký
router.get('/', auth, (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });
  const docs = getDocuments();
  const users = getUsers();
  // Helper: lấy tên từ userId/email
  const getName = (uid, email) => {
    const u = users.find(u => u.id === uid || u.email === email);
    return u ? (u.fullName || u.username || u.email || u.id) : (email || uid);
  };
  // Gắn tên cho từng signer
  const attachSignerNames = doc => ({
    ...doc,
    signers: Array.isArray(doc.signers) ? doc.signers.map(s => ({
      ...s,
      name: getName(s.userId, s.email)
    })) : []
  });
  const createdDocs = docs.filter(doc => doc.creatorId === userId).map(attachSignerNames);
  const needToSign = docs.filter(doc =>
    Array.isArray(doc.signers) &&
    doc.signers.some(s => (s.userId === userId || s.email === userEmail) && s.role === 'signer') &&
    !doc.signatures.find(s => s.userId === userId)
  ).map(attachSignerNames);
  const signedDocs = docs.filter(doc => doc.signatures.find(s => s.userId === userId)).map(attachSignerNames);
  res.json({
    createdDocuments: createdDocs,
    needToSignDocuments: needToSign,
    signedDocuments: signedDocs
  });
});

module.exports = router;
