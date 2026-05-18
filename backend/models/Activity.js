const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema(
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