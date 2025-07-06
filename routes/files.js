const express = require('express');
const { uploadFile, downloadFile } = require('../controllers/files');
const upload = require('../config/multer');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 上传文件
router.post('/', verifyToken, upload.single('file'), uploadFile);

// 下载文件
router.get('/:uuid', downloadFile);

module.exports = router;