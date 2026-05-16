const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },
    priority: {
      type: String,
      enum: {
        values: ['basse', 'moyenne', 'haute'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'moyenne',
    },
    status: {
      type: String,
      enum: {
        values: ['à faire', 'en cours', 'terminé'],
        message: '{VALUE} is not a valid task status',
      },
      default: 'à faire',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'A task must belong to a project'],
    },
    //ajout de assignedTo
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);