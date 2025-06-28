const { File } = require('../models')

// POST /api/files
exports.addFile = async (req, res) => {
  try {
    const { fileId, cid, permissions, uploader } = req.body
    const file = await File.create({ fileId, cid, permissions, uploader })
    res.status(201).json({ success: true, file })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// GET all files
exports.getAllFiles = async (req, res) => {
  const files = await File.findAll({ order: [['createdAt', 'DESC']] })
  res.json({ success: true, files })
}

// GET file by ID
exports.getFileById = async (req, res) => {
  const file = await File.findOne({ where: { fileId: req.params.fileId } })
  if (!file) {
    return res.status(404).json({ success: false, message: 'File not found' })
  }
  res.json({ success: true, file })
}
