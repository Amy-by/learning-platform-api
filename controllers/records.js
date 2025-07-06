const Progress = require('../models/Progress');
const Course = require('../models/Course');

// 获取用户学习记录
exports.getLearningRecords = async (req, res) => {
  try {
    const records = await Progress.find({ user: req.user._id })
      .populate('course', 'title thumbnail instructor')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .sort({ lastUpdated: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: '获取学习记录失败', error: error.message });
  }
};

// 获取特定课程的学习进度
exports.getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    })
      .populate('course', 'title modules');
    
    if (progress) {
      res.json(progress);
    } else {
      // 如果记录不存在，创建一个新的
      const course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: '课程未找到' });
      }
      
      const newProgress = new Progress({
        user: req.user._id,
        course: req.params.courseId
      });
      
      await newProgress.save();
      res.status(201).json(newProgress);
    }
  } catch (error) {
    res.status(500).json({ message: '获取学习进度失败', error: error.message });
  }
};

// 更新学习进度
exports.updateCourseProgress = async (req, res) => {
  try {
    const { currentModule, currentLesson, completedLessons } = req.body;
    
    // 查找课程以计算完成率
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: '课程未找到' });
    }
    
    // 计算总课时
    const totalLessons = course.modules.reduce((total, module) => {
      return total + module.lessons.length;
    }, 0);
    
    // 计算完成率
    const completionRate = (completedLessons.length / totalLessons) * 100;
    
    // 更新进度
    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, course: req.params.courseId },
      {
        currentModule,
        currentLesson,
        completedLessons,
        completionRate,
        lastUpdated: Date.now()
      },
      { new: true, upsert: true }
    );
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: '更新学习进度失败', error: error.message });
  }
};