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


const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden — only the project creator can update tasks' });
    }

    const { title, description, priority, status, assignedTo, deadline } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (deadline !== undefined) task.deadline = deadline;

    // If assignedTo changed, notify the new assignee
    if (assignedTo !== undefined && assignedTo !== (task.assignedTo?.toString() || null)) {
      task.assignedTo = assignedTo;
      if (assignedTo) {
        await Notification.create({
          recipient: assignedTo,
          type: 'task_assigned',
          message: `You have been assigned the task "${task.title}"`,
          project: task.project,
        });
      }
    }

    await task.save();

    await logActivity({
      action: 'Task updated',
      project: task.project,
      user: req.user._id,
      meta: { taskId: task._id, title: task.title },
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'fullName email')
      .populate('project', 'title');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userId    = req.user._id.toString();
    const isCreator = project.creator.toString() === userId;
    const isAssigned = task.assignedTo?.toString() === userId;

    if (!isCreator && !isAssigned) {
      return res.status(403).json({ message: 'Forbidden — you can only update tasks assigned to you' });
    }

    const oldStatus = task.status;
    task.status = req.body.status;
    await task.save();

    // Activity log
    await logActivity({
      action: `Task status changed from "${oldStatus}" to "${task.status}"`,
      project: task.project,
      user: req.user._id,
      meta: { taskId: task._id, oldStatus, newStatus: task.status },
    });

    // Notify relevant users about status change
    const notifyUsers = new Set();
    if (project.creator.toString() !== userId) notifyUsers.add(project.creator.toString());
    if (task.assignedTo && task.assignedTo.toString() !== userId) notifyUsers.add(task.assignedTo.toString());

    for (const recipientId of notifyUsers) {
      await Notification.create({
        recipient: recipientId,
        type: 'status_changed',
        message: `Task "${task.title}" status changed to "${task.status}"`,
        project: task.project,
      });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'fullName email')
      .populate('project', 'title');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
