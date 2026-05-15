const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { auth } = require('../middleware/auth');


router.get('/projects/:id/tasks', auth, getTasksByProject);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.patch('/:id/status', auth, updateTaskStatus);
router.delete('/:id', auth, deleteTask);

module.exports = router;