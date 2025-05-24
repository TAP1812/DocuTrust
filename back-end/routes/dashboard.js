const express = require('express');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const User = require('../models/User');

const router = express.Router();

// Dashboard - trả về thông tin tổng quan cho user, kèm tên người ký
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    // Helper: lấy tên từ userId/email
    const getName = async (uid, email) => {
      const user = await User.findOne({ $or: [{ _id: uid }, { email: email }] });
      return user ? (user.fullName || user.username || user.email || user._id) : (email || uid);
    };

    // Gắn tên cho từng signer
    const attachSignerNames = async (doc) => {
      const docObj = doc.toObject();
      if (Array.isArray(docObj.signers)) {
        docObj.signers = await Promise.all(docObj.signers.map(async s => ({
          ...s,
          name: await getName(s.userId, s.email)
        })));
      }
      return docObj;
    };

    // Lấy tài liệu và người ký từ MongoDB
    const [createdDocs, needToSign, signedDocs] = await Promise.all([
      // Tài liệu đã tạo
      Document.find({ creatorId: userId }).then(docs => Promise.all(docs.map(attachSignerNames))),
      
      // Tài liệu cần ký
      Document.find({
        'signers.userId': userId,
        'signers.role': 'signer',
        'signatures.userId': { $ne: userId }
      }).then(docs => Promise.all(docs.map(attachSignerNames))),
      
      // Tài liệu đã ký
      Document.find({
        'signatures.userId': userId
      }).then(docs => Promise.all(docs.map(attachSignerNames)))
    ]);

    res.json({
      createdDocuments: createdDocs,
      needToSignDocuments: needToSign,
      signedDocuments: signedDocs
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Không thể tải dữ liệu dashboard' });
  }
});

module.exports = router;
