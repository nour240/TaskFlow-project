const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

router.use(protect);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;
