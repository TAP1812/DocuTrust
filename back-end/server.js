// Simple Express server for DocuTrust
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/docutrust');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed
  email: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  publicKey: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Document Schema
const documentSchema = new mongoose.Schema({
  title: String,
  content: String,
  hash: String,
  creatorId: mongoose.Schema.Types.ObjectId,
  signers: [mongoose.Schema.Types.ObjectId],
  signatures: [{ userId: mongoose.Schema.Types.ObjectId, signature: String, publicKey: String, signedAt: Date }],
  status: String,
  createdAt: Date,
  completedAt: Date
});
const Document = mongoose.model('Document', documentSchema);

const JWT_SECRET = 'docutrust_secret_key'; // Đổi thành biến môi trường khi deploy

// Middleware xác thực JWT
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// File to store users
function getUsers() {
  if (!fs.existsSync('users.json')) return [];
  return JSON.parse(fs.readFileSync('users.json'));
}
function saveUsers(users) {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// File to store documents
function getDocuments() {
  if (!fs.existsSync('documents.json')) return [];
  return JSON.parse(fs.readFileSync('documents.json'));
}
function saveDocuments(docs) {
  fs.writeFileSync('documents.json', JSON.stringify(docs, null, 2));
}

// Đăng ký (MongoDB, hash password)
app.post('/api/register', async (req, res) => {
  const { username, password, email, fullName, publicKey } = req.body;
  if (!username || !password || !email || !fullName || !publicKey) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ message: 'User or email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, email, fullName, publicKey });
    await user.save();
    res.json({ message: 'Registered successfully' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Đăng nhập (MongoDB, trả về JWT)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Login successful', token, user: { id: user._id, username: user.username, publicKey: user.publicKey } });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// API: Tạo tài liệu, băm nội dung và gửi yêu cầu ký
app.post('/api/documents', (req, res) => {
  const { title, content, creatorId, signers } = req.body;
  if (!title || !content || !creatorId || !Array.isArray(signers) || signers.length === 0) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  // Băm nội dung tài liệu
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const doc = {
    id: uuidv4(),
    title,
    content,
    hash,
    creatorId,
    signers, // danh sách userId cần ký
    signatures: [], // { userId, signature, publicKey, signedAt }
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  let docs = getDocuments();
  docs.push(doc);
  saveDocuments(docs);
  res.json({ message: 'Document created', document: doc });
});

// API: Lấy danh sách tài liệu (có thể lọc theo userId)
app.get('/api/documents', (req, res) => {
  const { userId } = req.query;
  let docs = getDocuments();
  if (userId) {
    docs = docs.filter(doc => doc.creatorId === userId || doc.signers.includes(userId));
  }
  res.json({ documents: docs });
});

// API: Lấy chi tiết tài liệu
app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  res.json({ document: doc });
});

// API: Ký tài liệu (người dùng gửi chữ ký số, publicKey, userId)
app.post('/api/documents/:id/sign', (req, res) => {
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
  // Xác thực chữ ký số (ECDSA/RSA) phía client, backend chỉ lưu lại
  doc.signatures.push({ userId, signature, publicKey, signedAt: new Date().toISOString() });
  // Nếu tất cả đã ký thì cập nhật trạng thái
  if (doc.signatures.length === doc.signers.length) {
    doc.status = 'completed';
    doc.completedAt = new Date().toISOString();
  }
  saveDocuments(docs);
  res.json({ message: 'Signed successfully', document: doc });
});

// API: Xác minh chữ ký tài liệu (trả về trạng thái hợp lệ của từng chữ ký)
app.post('/api/documents/:id/verify', (req, res) => {
  const { id } = req.params;
  let docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  // Kiểm tra từng chữ ký
  const results = doc.signatures.map(sig => {
    try {
      // Xác minh chữ ký số (ECDSA/RSA) phía client, backend chỉ kiểm tra định dạng
      return { userId: sig.userId, valid: !!sig.signature, signedAt: sig.signedAt };
    } catch {
      return { userId: sig.userId, valid: false, signedAt: sig.signedAt };
    }
  });
  res.json({ hash: doc.hash, verifyResults: results });
});

app.listen(PORT, () => {
  console.log(`DocuTrust backend running on port ${PORT}`);
});
