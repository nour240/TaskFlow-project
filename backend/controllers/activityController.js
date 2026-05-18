const Activity = require('../models/Activity');
const getActivities = async (req, res) => {
try {

} catch (err) {
  res.status(500).json({ message: 'Server error', error: err.message });
}
const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);

const limit = Math.min(
  Math.max(parseInt(req.query.limit, 10) || 20, 1),
  100
);

const skip  = (page - 1) * limit;