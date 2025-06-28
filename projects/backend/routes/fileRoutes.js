const express = require('express')
const router = express.Router()
const { addFile, getAllFiles, getFileById } = require('../controllers/fileController')

router.post('/', addFile)
router.get('/', getAllFiles)
router.get('/:fileId', getFileById)

module.exports = router
