const router = require('express').Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validateSignup, validateLogin } = require('../middlewares/validate');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

module.exports = router;
