const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/auth');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 用户注册
router.post('/register', registerUser);

// 用户登录
router.post('/login', loginUser);

// 获取用户资料 (需要认证)
router.get('/profile', verifyToken, getUserProfile);

// 更新用户资料 (需要认证)
router.put('/profile', verifyToken, updateUserProfile);

module.exports = router;