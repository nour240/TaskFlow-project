const Task = require('../models/Task');
const Project = require('../models/Project');


exports.getTasksByProject = async (req, res) => {
  const { id: projectId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const { id: userId } = req.user;

  try {
    const skip = (page - 1) * limit;

    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this project'
      });
    }

    const tasks = await Task.find({ project: projectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'fullName email');

    const total = await Task.countDocuments({ project: projectId });

    res.status(200).json({
      success: true,
      data: tasks,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task retrieval'
    });
  }
};


exports.createTask = async (req, res) => {
  const { title, priority, status, project, assignedTo } = req.body;
  const { id: userId } = req.user;

  try {
    
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (projectDoc.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add tasks to this project'
      });
    }

    const task = await Task.create({
      title,
      priority,
      status,
      project,
      assignedTo: assignedTo || null
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task creation'
    });
  }
};


exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, priority, status, assignedTo } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    
    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this task'
      });
    }

    task.title = title || task.title;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.assignedTo = assignedTo || task.assignedTo;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task update'
    });
  }
};


exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    
    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task'
      });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update'
    });
  }
};


exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    
    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task deletion'
    });
  }
};