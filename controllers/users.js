const User = require('../models/User');
const Course = require('../models/Course');

// 获取所有用户（管理员）
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
};

// 获取单个用户（管理员）
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户失败', error: error.message });
  }
};

// 更新用户（管理员）
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }
    
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(400).json({ message: '更新用户失败', error: error.message });
  }
};

// 删除用户（管理员）
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }
    
    // 从课程中移除用户
    await Course.updateMany(
      { students: user._id },
      { $pull: { students: user._id } }
    );
    
    await user.remove();
    res.json({ message: '用户已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除用户失败', error: error.message });
  }
};

// 获取用户教授的课程（教师）
exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: '获取课程失败', error: error.message });
  }
};