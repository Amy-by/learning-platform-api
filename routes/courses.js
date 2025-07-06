const express = require('express');
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse
} = require('../controllers/courses');
const { verifyToken, isInstructor } = require('../middleware/auth');

const router = express.Router();

// 创建课程 (教师或管理员)
router.post('/', verifyToken, isInstructor, createCourse);

// 获取所有课程
router.get('/', getCourses);

// 获取单个课程
router.get('/:id', getCourseById);

// 更新课程 (教师或管理员)
router.put('/:id', verifyToken, isInstructor, updateCourse);

// 删除课程 (教师或管理员)
router.delete('/:id', verifyToken, isInstructor, deleteCourse);

// 学生注册课程
router.post('/:id/enroll', verifyToken, enrollCourse);

// 学生退出课程
router.post('/:id/unenroll', verifyToken, unenrollCourse);

module.exports = router;