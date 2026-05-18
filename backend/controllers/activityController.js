const Activity = require('../models/Activity');
const getActivities = async (req, res) => {
try {

} catch (err) {
  res.status(500).json({ message: 'Server error', error: err.message });
}