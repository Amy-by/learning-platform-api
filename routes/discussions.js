const express = require('express');
const {
  createDiscussion,
  getCourseDiscussions,
  getDiscussionById,
  addComment,
  toggleLikeDiscussion,
  stickyDiscussion,
  lockDiscussion,
  deleteDiscussion
} = require('../controllers/discussions');
const { verifyToken, isInstructor } = require('../middleware/auth');

const router = express.Router();

// 创建讨论
router.post('/courses/:courseId', verifyToken, createDiscussion);

// 获取课程讨论列表
router.get('/courses/:courseId', getCourseDiscussions);

// 获取单个讨论
router.get('/:id', getDiscussionById);

// 添加评论
router.post('/:id/comments', verifyToken, addComment);

// 点赞/取消点赞讨论
router.post('/:id/like', verifyToken, toggleLikeDiscussion);

// 置顶讨论（教师/管理员）
router.post('/:id/sticky', verifyToken, isInstructor, stickyDiscussion);

// 锁定讨论（教师/管理员）
router.post('/:id/lock', verifyToken, isInstructor, lockDiscussion);

// 删除讨论（教师/管理员）
router.delete('/:id', verifyToken, isInstructor, deleteDiscussion);

module.exports = router;