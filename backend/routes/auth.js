const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Route protégée
router.get('/me', auth, getMe);

module.exports = router;