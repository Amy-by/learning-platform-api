const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const User = require('../models/User');

// 创建讨论
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // 检查课程是否存在
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: '课程未找到' });
    }
    
    // 检查用户是否已注册该课程或为教师
    if (
      !course.students.includes(req.user._id) && 
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: '必须先注册课程才能发表讨论' });
    }
    
    // 创建讨论
    const discussion = new Discussion({
      title,
      content,
      user: req.user._id,
      course: req.params.courseId
    });
    
    const savedDiscussion = await discussion.save();
    res.status(201).json(savedDiscussion);
  } catch (error) {
    res.status(500).json({ message: '创建讨论失败', error: error.message });
  }
};

// 获取课程讨论列表
exports.getCourseDiscussions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort } = req.query;
    
    const sortOptions = {};
    if (sort === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sort === 'popular') {
      sortOptions.views = -1;
    } else if (sort === 'hot') {
      sortOptions.likes = -1;
    }
    
    const discussions = await Discussion.find({ course: req.params.courseId })
      .populate('user', 'name avatar')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const count = await Discussion.countDocuments({ course: req.params.courseId });
    
    res.json({
      discussions,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: '获取讨论列表失败', error: error.message });
  }
};

// 获取单个讨论
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      });
    
    if (!discussion) {
      return res.status(404).json({ message: '讨论未找到' });
    }
    
    // 增加浏览量
    discussion.views += 1;
    await discussion.save();
    
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: '获取讨论失败', error: error.message });
  }
};

// 添加评论
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论未找到' });
    }
    
    // 检查用户是否已注册该课程或为教师
    const course = await Course.findById(discussion.course);
    if (
      !course.students.includes(req.user._id) && 
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: '必须先注册课程才能发表评论' });
    }
    
    // 添加评论
    discussion.comments.push({
      user: req.user._id,
      content
    });
    
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: '添加评论失败', error: error.message });
  }
};

// 点赞/取消点赞讨论
exports.toggleLikeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论未找到' });
    }
    
    // 检查用户是否已点赞
    const likedIndex = discussion.likes.indexOf(req.user._id);
    
    if (likedIndex === -1) {
      // 添加点赞
      discussion.likes.push(req.user._id);
    } else {
      // 取消点赞
      discussion.likes.splice(likedIndex, 1);
    }
    
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: '操作失败', error: error.message });
  }
};

// 置顶讨论（教师/管理员）
exports.stickyDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论未找到' });
    }
    
    // 检查权限
    const course = await Course.findById(discussion.course);
    if (
      course.instructor.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: '权限不足' });
    }
    
    // 切换置顶状态
    discussion.isSticky = !discussion.isSticky;
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: '操作失败', error: error.message });
  }
};

// 锁定讨论（教师/管理员）
exports.lockDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论未找到' });
    }
    
    // 检查权限
    const course = await Course.findById(discussion.course);
    if (
      course.instructor.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: '权限不足' });
    }
    
    // 切换锁定状态
    discussion.isLocked = !discussion.isLocked;
    const updatedDiscussion = await discussion.save();
    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: '操作失败', error: error.message });
  }
};

// 删除讨论（教师/管理员）
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论未找到' });
    }
    
    // 检查权限
    const course = await Course.findById(discussion.course);
    if (
      course.instructor.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: '权限不足' });
    }
    
    await discussion.remove();
    res.json({ message: '讨论已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
};