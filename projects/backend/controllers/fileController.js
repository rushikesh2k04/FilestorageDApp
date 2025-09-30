const { File } = require('../models');

// POST /api/files
exports.addFile = async (req, res) => {
  try {
    const { fileId, cid, permissions, uploader } = req.body;

    // Basic validation
    if (!fileId || !cid || !permissions || !uploader) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const file = await File.create({ fileId, cid, permissions, uploader });
    res.status(201).json({ success: true, data: file });
  } catch (err) {
    console.error('Error adding file:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET all files
exports.getAllFiles = async (req, res) => {
  try {
    const files = await File.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: files });
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET file by ID
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findOne({ where: { fileId: req.params.fileId } });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.json({ success: true, data: file });
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
