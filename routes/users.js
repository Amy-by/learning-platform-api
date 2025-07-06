const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getInstructorCourses
} = require('../controllers/users');
const { verifyToken, isAdmin, isInstructor } = require('../middleware/auth');

const router = express.Router();

// 获取所有用户（管理员）
router.get('/', verifyToken, isAdmin, getUsers);

// 获取单个用户（管理员）
router.get('/:id', verifyToken, isAdmin, getUserById);

// 更新用户（管理员）
router.put('/:id', verifyToken, isAdmin, updateUser);

// 删除用户（管理员）
router.delete('/:id', verifyToken, isAdmin, deleteUser);

// 获取教师的课程（教师）
router.get('/:id/courses', verifyToken, isInstructor, getInstructorCourses);

module.exports = router;