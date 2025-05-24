const mongoose = require('mongoose');

const signerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['signer', 'viewer'],
    default: 'signer'
  }
}, { _id: false });

const documentSchema = new mongoose.Schema({
  title: String,
  content: String,
  hash: String,
  creatorId: mongoose.Schema.Types.ObjectId,
  signers: [signerSchema],
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
