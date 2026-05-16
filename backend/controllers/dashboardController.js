const mongoose = require('mongoose');
const Project  = require('../models/Project');
const Task     = require('../models/Task');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    const activeProjects = await Project.countDocuments({
      status: 'actif',
      $or: [{ creator: userId }, { members: userId }],
    });