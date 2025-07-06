const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');

// 创建课程
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, level, modules } = req.body;
    
    const course = new Course({
      title,
      description,
      category,
      level,
      modules,
      instructor: req.user._id
    });
    
    const createdCourse = await course.save();
    
    // 将课程添加到教师的课程列表
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { courses: createdCourse._id } },
      { new: true }
    );
    
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: '创建课程失败', error: error.message });
  }
};

// 获取所有课程
exports.getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.title = { $regex: search, $options: 'i' };
    
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const count = await Course.countDocuments(query);
    
    res.json({
      courses,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: '获取课程列表失败', error: error.message });
  }
};

// 获取单个课程
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('students', 'name avatar');
    
    if (!course) {
      return res.status(404).json({ message: '课程未找到' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: '获取课程失败', error: error.message });
  }
};

// 更新课程
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: '课程未找到' });
    }
    
    // 检查权限
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '权限不足' });
    }
    
    // 更新课程信息
    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    course.category = req.body.category || course.category;
    course.level = req.body.level || course.level;
    course.price = req.body.price || course.price;
    course.thumbnail = req.body.thumbnail || course.thumbnail;
    
    if (req.body.modules) {
      course.modules = req.body.modules;
    }
    
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: '更新课程失败', error: error.message });
  }
};

// 删除课程
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: '课程未找到' });
    }
    
    // 检查权限
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '权限不足' });
    }
    
    // 删除相关学习进度
    await Progress.deleteMany({ course: course._id });
    
    // 从教师的课程列表中移除
    await User.findByIdAndUpdate(
      course.instructor,
      { $pull: { courses: course._id } }
    );
    
    // 从学生的课程列表中移除
    await User.updateMany(
      { courses: course._id },
      { $pull: { courses: course._id } }
    );
    
    await course.remove();
    res.json({ message: '课程已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除课程失败', error: error.message });
  }
};

// 学生注册课程
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: '课程未找到' });
    }
    
    // 检查是否已注册
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: '你已注册该课程' });
    }
    
    // 添加学生到课程
    course.students.push(req.user._id);
    await course.save();
    
    // 添加课程到用户
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { courses: course._id } }
    );
    
    // 创建学习进度记录
    const progress = new Progress({
      user: req.user._id,
      course: course._id
    });
    await progress.save();
    
    res.json({ message: '成功注册课程', course });
  } catch (error) {
    res.status(500).json({ message: '注册课程失败', error: error.message });
  }
};

// 学生退出课程
exports.unenrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: '课程未找到' });
    }
    
    // 检查是否已注册
    if (!course.students.includes(req.user._id)) {
      return res.status(400).json({ message: '你未注册该课程' });
    }
    
    // 从课程中移除学生
    course.students = course.students.filter(student => student.toString() !== req.user._id.toString());
    await course.save();
    
    // 从用户中移除课程
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { courses: course._id } }
    );
    
    // 删除学习进度记录
    await Progress.deleteOne({ user: req.user._id, course: course._id });
    
    res.json({ message: '成功退出课程' });
  } catch (error) {
    res.status(500).json({ message: '退出课程失败', error: error.message });
  }
};