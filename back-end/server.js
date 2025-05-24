// Simple Express server for DocuTrust
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
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

const JWT_SECRET = 'docutrust_secret_key'; // Đổi thành biến môi trường khi deploy

// Middleware xác thực JWT chỉ cho các route API
app.use((req, res, next) => {
  // Chỉ áp dụng cho các route bắt đầu bằng /api
  if (!req.path.startsWith('/api')) {
    return next();
  }
  // Bỏ qua các route public như /api/login, /api/register
  if (
    req.path.startsWith('/api/login') ||
    req.path.startsWith('/api/register')
  ) {
    return next();
  }
  // Lấy token từ cookie hoặc header
  const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const dashboardRoutes = require('./routes/dashboard');

// Use routes
app.use('/api', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware xử lý các request không khớp route hoặc không có JWT
app.use((req, res) => {
  // Nếu là API request, trả về 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  // Với mọi request khác, redirect về trang login của frontend
  res.redirect('http://localhost:3000/login');
});

app.listen(PORT, () => {
  console.log(`DocuTrust backend running on port ${PORT}`);
});
