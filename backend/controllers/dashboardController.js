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
    const assignedTasks = await Task.countDocuments({ assignedTo: userId });

    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'terminé',
    });

    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: 'terminé' },
      deadline: { $lt: now, $ne: null },
    });

    const priorityOrder = { haute: 3, moyenne: 2, basse: 1 };
    const ongoingTasks = await Task.aggregate([
        {
            $match: {
                assignedTo: userId,
                status: { $ne: 'terminé' },
            },
        },
    ]);