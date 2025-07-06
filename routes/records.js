const express = require('express');
const {
  getLearningRecords,
  getCourseProgress,
  updateCourseProgress
} = require('../controllers/records');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 获取用户学习记录
router.get('/', verifyToken, getLearningRecords);

// 获取特定课程的学习进度
router.get('/courses/:courseId', verifyToken, getCourseProgress);

// 更新学习进度
router.put('/courses/:courseId', verifyToken, updateCourseProgress);

module.exports = router;