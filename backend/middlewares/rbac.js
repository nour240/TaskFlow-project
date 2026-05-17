const Project = require('../models/Project');

const isProjectCreator = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project   = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden — only the project creator can perform this action' });
    }

    req.project = project;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};