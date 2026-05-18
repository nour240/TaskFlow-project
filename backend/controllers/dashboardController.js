// Aggregation pipeline for dashboard statistics
const mongoose = require('mongoose');
const Project  = require('../models/Project');
const Task     = require('../models/Task');

// Returns aggregated stats for the current user
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    // Active projects (creator or member, status = actif)
    const activeProjectsAgg = await Project.aggregate([
      {
        $match: {
          status: 'actif',
          $or: [{ creator: userId }, { members: userId }],
        },
      },
      { $count: 'count' },
    ]);
    const activeProjects = activeProjectsAgg[0]?.count ?? 0;

    
    const assignedTasksAgg = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $count: 'count' },
    ]);
    const assignedTasks = assignedTasksAgg[0]?.count ?? 0;

    const completedTasksAgg = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          status: 'terminé',
        },
      },
      { $count: 'count' },
    ]);
    const completedTasks = completedTasksAgg[0]?.count ?? 0;

    const overdueTasksAgg = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          status: { $ne: 'terminé' },
          deadline: { $lt: now, $ne: null },
        },
      },
      { $count: 'count' },
    ]);

    const overdueTasks = overdueTasksAgg[0]?.count ?? 0;

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

    const tasksByPriority = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      activeProjects,
      assignedTasks,
      completedTasks,
      overdueTasks,
      ongoingTasks,
      tasksByStatus,
      tasksByPriority,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboard };