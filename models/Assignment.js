const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  files: [String],
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number },
  feedback: String,
  gradedAt: Date,
  grader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  moduleIndex: { type: Number, required: true },
  lessonIndex: { type: Number, required: true },
  dueDate: { type: Date },
  maxPoints: { type: Number, default: 100 },
  submissions: [submissionSchema]
});

module.exports = mongoose.model('Assignment', assignmentSchema);