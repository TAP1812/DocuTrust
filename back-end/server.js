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
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(bodyParser.json());
app.use(cookieParser());

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

// File to store documents
function getDocuments() {
  if (!fs.existsSync('documents.json')) return [];
  return JSON.parse(fs.readFileSync('documents.json'));
}
function saveDocuments(docs) {
  fs.writeFileSync('documents.json', JSON.stringify(docs, null, 2));
}

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const dashboardRoutes = require('./routes/dashboard');

// Use routes
app.use('/api', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`DocuTrust backend running on port ${PORT}`);
});
