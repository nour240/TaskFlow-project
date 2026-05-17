const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logActivity } = require('../middlewares/activityLogger');

/* Invite a registered user by email. */
const addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden — only the creator can manage members' });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'No registered user found with this email' });
    }

    if (userToAdd._id.toString() === project.creator.toString()) {
      return res.status(400).json({ message: 'The creator is already part of this project' });
    }

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    await logActivity({
      action: `Member added: ${userToAdd.fullName}`,
      project: project._id,
      user: req.user._id,
      meta: { memberId: userToAdd._id, email },
    });

    await Notification.create({
      recipient: userToAdd._id,
      type: 'member_added',
      message: `You have been added to the project "${project.title}"`,
      project: project._id,
    });

    const populated = await Project.findById(project._id)
      .populate('creator', 'fullName email')
      .populate('members', 'fullName email');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* Remove a member from a project. */
const removeMember = async (req, res) => {

  try {

    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.creator.toString() !== req.user._id.toString()) {

      return res.status(403).json({ message: 'Forbidden — only the creator can manage members' });

    }

    const { memberId } = req.params;

    const memberIndex = project.members.findIndex(

      (m) => m.toString() === memberId

    );

    if (memberIndex === -1) {

      return res.status(404).json({ message: 'Member not found in this project' });

    }

    project.members.splice(memberIndex, 1);

    await project.save();

    await logActivity({

      action: 'Member removed',

      project: project._id,

      user: req.user._id,

      meta: { memberId },

    });

    await Notification.create({

      recipient: memberId,

      type: 'member_removed',

      message: `You have been removed from the project "${project.title}"`,

      project: project._id,

    });

    const populated = await Project.findById(project._id)

      .populate('creator', 'fullName email')

      .populate('members', 'fullName email');

    res.json(populated);

  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });

  }

};


module.exports = { addMember, removeMember };