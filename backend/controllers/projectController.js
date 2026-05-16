const Project  = require('../models/Project');
const { logActivity } = require('../middlewares/activityLogger');

const createProject = async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    const project = await Project.create({
      title,
      description,
      deadline: deadline || null,
      status: status || 'actif',
      creator: req.user._id,
      members: [],
    });

    await logActivity({
      action: 'Project created',
      project: project._id,
      user: req.user._id,
      meta: { title },
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip  = (page - 1) * limit;

    const filter = {
      $or: [
        { creator: req.user._id },
        { members: req.user._id },
      ],
    };

    const [data, total] = await Promise.all([
      Project.find(filter)
        .populate('creator', 'fullName email')
        .populate('members', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
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

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'fullName email')
      .populate('members', 'fullName email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userId = req.user._id.toString();
    const isAllowed =
      project.creator._id.toString() === userId ||
      project.members.some((m) => m._id.toString() === userId);

    if (!isAllowed) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden — only the creator can edit this project' });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (deadline !== undefined) project.deadline = deadline;
    if (status !== undefined) project.status = status;

    await project.save();

    await logActivity({
      action: 'Project updated',
      project: project._id,
      user: req.user._id,
      meta: { title: project.title },
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden — only the creator can delete this project' });
    }

    await project.deleteOne(); // triggers pre('deleteOne') cascade
    res.json({ message: 'Project and associated tasks deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};