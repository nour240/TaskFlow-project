const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  priority: {
    type: String,
    enum: ['basse', 'moyenne', 'haute'],
    required: true
  },
  status: {
    type: String,
    enum: ['à faire', 'en cours', 'terminé'],
    required: true,
    default: 'à faire'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);