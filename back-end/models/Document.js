const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: String,
  content: String,
  hash: String,
  creatorId: mongoose.Schema.Types.ObjectId,
  signers: [{
    userId: String,  // Email hoặc ObjectId string
    role: String     // 'signer' hoặc 'viewer'
  }],
  signatures: [{ 
    userId: String,  // Khớp với signers.userId
    signature: String, 
    publicKey: String, 
    signedAt: Date 
  }],
  status: String,
  createdAt: Date,
  completedAt: Date,
  filePath: String,
  fileName: String
});

// Tránh khai báo lại model nếu đã tồn tại
module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
