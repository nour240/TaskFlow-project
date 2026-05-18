const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { validateProject } = require('../middlewares/validate');
const {
  createProject, getProjects, getProject, updateProject, deleteProject,
} = require('../controllers/projectController');

router.use(protect);
router.route('/').get(getProjects).post(validateProject, createProject);
router.route('/:id').get(getProject).put(validateProject, updateProject).delete(deleteProject);

module.exports = router;