const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { getActivities } = require('../controllers/activityController');

router.get('/:id/activities', protect, getActivities);

module.exports = router;