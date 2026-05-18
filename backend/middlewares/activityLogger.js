/**
 * Utility to create activity log entries.
 * Called from controllers after successful operations.
 */
const Activity = require('../models/Activity');

/**
 * Log an activity event.
 * @param {Object} params
 * @param {string} params.action  – Description of the action
 * @param {string} params.project – Project ObjectId
 * @param {string} params.user    – User ObjectId who performed the action
 * @param {Object} [params.meta]  – Optional extra data
 */
const logActivity = async ({ action, project, user, meta = {} }) => {
  try {
    await Activity.create({ action, project, user, meta });
  } catch (err) {
    // Activity logging should never crash the request
    console.error('⚠️  Activity log error:', err.message);
  }
};

module.exports = { logActivity };
