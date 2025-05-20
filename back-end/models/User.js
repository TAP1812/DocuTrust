const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  publicKey: { type: String, required: true }
});

// Tránh khai báo lại model nếu đã tồn tại
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
