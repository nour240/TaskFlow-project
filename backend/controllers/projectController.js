const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Créer un nouveau projet
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  const { title, description, dueDate } = req.body;
  const owner = req.user.id; // Récupéré par le middleware auth

  try {
    const project = await Project.create({
      title,
      description,
      dueDate: dueDate || null,
      owner
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during project creation'
    });
  }
};

// @desc    Récupérer tous les projets (avec pagination)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { id: userId } = req.user;

  try {
    const skip = (page - 1) * limit;

    const projects = await Project.find({ owner: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'fullName email');

    const total = await Project.countDocuments({ owner: userId });

    res.status(200).json({
      success: true,
      data: projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during project retrieval'
    });
  }
};

// @desc    Mettre à jour un projet
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, status } = req.body;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this project'
      });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.dueDate = dueDate || project.dueDate;
    project.status = status || project.status;

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during project update'
    });
  }
};

// @desc    Supprimer un projet (avec cascade)
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this project'
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during project deletion'
    });
  }
};