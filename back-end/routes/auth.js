const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'docutrust_secret_key';
const auth = require('../middleware/auth');

const router = express.Router();

// Đăng ký
router.post('/register', async (req, res) => {
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

// Đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000
    });
    // Trả về JSON, frontend sẽ tự chuyển hướng sang dashboard sau khi đăng nhập thành công
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        publicKey: user.publicKey
      },
      redirect: '/dashboard'
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cập nhật profile (trừ publicKey)
router.put('/profile', auth, async (req, res) => {
  const userId = req.user.id;
  const { fullName, username, email } = req.body;
  if (!fullName || !username || !email) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    // Kiểm tra trùng username/email với user khác
    const existing = await User.findOne({ $or: [
      { username, _id: { $ne: userId } },
      { email, _id: { $ne: userId } }
    ] });
    if (existing) return res.status(409).json({ message: 'Username hoặc email đã tồn tại' });
    const user = await User.findByIdAndUpdate(userId, { fullName, username, email }, { new: true });
    res.json({ message: 'Cập nhật thành công', user: {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      publicKey: user.publicKey
    }});
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
