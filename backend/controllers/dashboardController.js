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
      {
        $addFields: {
          priorityOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'haute'] }, then: 3 },
                { case: { $eq: ['$priority', 'moyenne'] }, then: 2 },
                { case: { $eq: ['$priority', 'basse'] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityOrder: -1, deadline: 1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          description: 1,
          priority: 1,
          status: 1,
          deadline: 1,
          createdAt: 1,
          'projectInfo.title': 1,
          'projectInfo._id': 1,
        },
      },
    ]);
    
    const tasksByStatus = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);