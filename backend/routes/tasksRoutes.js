const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { validateTask, validateTaskStatus } = require('../middlewares/validate');
const {
  createTask, getTasks, getTask, updateTask, updateTaskStatus, deleteTask,
} = require('../controllers/taskController');
router.use(protect);