const path = require('path');
const File = require('../models/File');
const { v4: uuidv4 } = require('uuid');

// 上传单个文件
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '未上传文件' });
    }
    
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      user: req.user._id,
      uuid: uuidv4()
    });
    
    await file.save();
    
    res.json({
      fileId: file._id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimeType,
      size: file.size,
      downloadUrl: `/api/files/${file.uuid}`
    });
  } catch (error) {
    res.status(500).json({ message: '文件上传失败', error: error.message });
  }
};

// 下载文件
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.status(404).json({ message: '文件未找到' });
    }
    
    const filePath = path.join(__dirname, `../../${file.path}`);
    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: '文件下载失败', error: error.message });
  }
};