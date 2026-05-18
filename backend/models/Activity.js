const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema(
    action: {
  type: String,
  required: true,
  trim: true,
},