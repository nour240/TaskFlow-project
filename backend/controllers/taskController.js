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




const getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignedTo, search, page: p, limit: l } = req.query;
    const page  = Math.max(parseInt(p, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(l, 10) || 10, 1), 100);
    const skip  = (page - 1) * limit;

    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Keyword search on title/description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'fullName email')
        .populate('project', 'title')
        .sort({ priority: -1, deadline: 1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .populate('project', 'title');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};