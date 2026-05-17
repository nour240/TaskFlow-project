const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { isProjectCreator, isProjectMember } = require('../middlewares/rbac');
const { addMember, removeMember, getMembers } = require('../controllers/memberController');

router.use(protect);

// GET → creator or member can view the member list
router.get('/:id/members', isProjectMember, getMembers);

// POST → creator only can invite members
router.post('/:id/members', isProjectCreator, addMember);

// DELETE → creator only can remove members
router.delete('/:id/members/:memberId', isProjectCreator, removeMember);

module.exports = router;