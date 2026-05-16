const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { validateTask, validateTaskStatus } = require('../middlewares/validate');
const {
  createTask, getTasks, getTask, updateTask, updateTaskStatus, deleteTask,
} = require('../controllers/taskController');
// Protection globale des routes tasks
// Toutes les routes ci-dessous nécessitent un token JWT valide
router.use(protect);
router.route('/').get(getTasks).post(validateTask, createTask);
router.route('/:id').get(getTask).put(validateTask, updateTask).delete(deleteTask);
router.patch('/:id/status', validateTaskStatus, updateTaskStatus);
module.exports = router;