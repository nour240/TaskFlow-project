const Task         = require('../models/Task');
const Project      = require('../models/Project');
const Notification = require('../models/Notification');
const { logActivity } = require('../middlewares/activityLogger');




const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, project, assignedTo, deadline } = req.body;

    // Verify project exists and user has access
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const userId = req.user._id.toString();
    if (proj.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden — only the project creator can create tasks' });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'moyenne',
      status: status || 'à faire',
      project,
      assignedTo: assignedTo || null,
      deadline: deadline || null,
    });

    // Activity log
    await logActivity({
      action: 'Task created',
      project,
      user: req.user._id,
      meta: { taskId: task._id, title },
    });

    // Notification if assigned
    if (assignedTo) {
      await Notification.create({
        recipient: assignedTo,
        type: 'task_assigned',
        message: `You have been assigned the task "${title}"`,
        project,
      });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'fullName email')
      .populate('project', 'title');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};