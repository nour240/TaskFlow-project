// Fields: title, description, deadline, status, creator, members[]
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['actif', 'en pause', 'archivé'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'actif',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

/* ── Cascade delete: remove all tasks when a project is deleted ── */
projectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  const Task = mongoose.model('Task');
  await Task.deleteMany({ project: this._id });
  next();
});

module.exports = mongoose.model('Project', projectSchema);
