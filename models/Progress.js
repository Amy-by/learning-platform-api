const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  currentModule: { type: Number, default: 0 },
  currentLesson: { type: Number, default: 0 },
  completedLessons: [{
    moduleIndex: Number,
    lessonIndex: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  completionRate: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);