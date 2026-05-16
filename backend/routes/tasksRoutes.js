const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { validateTask, validateTaskStatus } = require('../middlewares/validate');