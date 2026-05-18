const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
    action: {
    type: String,
    required: true,
    trim: true,
    },
    project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    },
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    },
    meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    },
},
{ timestamps: true }
);
activitySchema.index({ project: 1, createdAt: -1 });
module.exports = mongoose.model('Activity', activitySchema);