const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dueDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['actif', 'en pause', 'archivé'],
    default: 'actif'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});
projectSchema.pre('deleteOne', async function (next) {
  const projectId = this.getQuery()._id;
  try {
    const Task = mongoose.model('Task');
    await Task.deleteMany({ project: projectId });
    console.log(`✅ All tasks for project ${projectId} deleted`);
    next();
  } catch (error) {
    console.error('Error deleting tasks:', error);
    next(error);
  }
});
module.exports = mongoose.model('Project', projectSchema);