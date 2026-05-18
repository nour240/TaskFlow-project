/**
 * ─── Activity Controller ────────────────────────────────
 * Serve the activity feed for a project.
 */
const Activity = require('../models/Activity');

/**
 * GET /api/projects/:id/activities
 */
const getActivities = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip  = (page - 1) * limit;

    const filter = { project: req.params.id };

    const [data, total] = await Promise.all([
      Activity.find(filter)
        .populate('user', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getActivities };
