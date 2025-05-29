const Document = require('../models/Document');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Create a new document
const createDocument = async (req, res) => {
  try {
    const { title, content, fileType } = req.body;
    const fileUrl = req.file ? req.file.path : null;

    if (!fileUrl) {
      return res.status(400).json({ message: 'File is required' });
    }

    const document = new Document({
      title,
      content,
      fileUrl,
      fileType,
      owner: req.user._id,
      verificationHash: crypto.createHash('sha256').update(fileUrl).digest('hex'),
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all documents for a user
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id },
      ],
    }).populate('owner', 'username email');

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single document
const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id },
      ],
    }).populate('owner', 'username email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a document
const updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'sharedWith.user': req.user._id,
          'sharedWith.permission': 'write'
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    document.title = title || document.title;
    document.content = content || document.content;
    
    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Share a document
const shareDocument = async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if already shared
    const existingShare = document.sharedWith.find(
      share => share.user.toString() === userId
    );

    if (existingShare) {
      existingShare.permission = permission;
    } else {
      document.sharedWith.push({ user: userId, permission });
    }

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get file content of a document
const getDocumentFileContent = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    // Get absolute path to the file
    const filePath = path.resolve(__dirname, '../../', document.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  shareDocument,
  deleteDocument,
  getDocumentFileContent
}; 