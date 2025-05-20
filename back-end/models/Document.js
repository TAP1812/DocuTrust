const mongoose = require('mongoose');

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

// Tránh khai báo lại model nếu đã tồn tại
module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
