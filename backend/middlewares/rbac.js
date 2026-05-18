// Role-Based Access Control for project operations.

const Project = require('../models/Project');

// Ensures the current user is the project creator.
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

// Ensures the current user is either the project creator or a member.
const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project;
    const project   = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userId   = req.user._id.toString();
    const isCreator = project.creator.toString() === userId;
    const isMember  = project.members.some((m) => m.toString() === userId);

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: 'Forbidden — you are not a member of this project' });
    }

    req.project       = project;
    req.isCreator     = isCreator;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { isProjectCreator, isProjectMember };
