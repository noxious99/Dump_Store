const streakService = require('../services/streakService');

/**
 * @desc    Current/longest activity streak (consecutive days with any action)
 * @route   GET /api/v1/streak
 * @access  Private
 */
const getStreakHandler = async (req, res) => {
    try {
        const data = await streakService.getActivityStreak(req.user.id);
        return res.status(200).json(data);
    } catch (error) {
        // The badge is motivational, not critical — degrade to "no streak"
        // rather than failing the dashboard load.
        console.error('Streak error:', error.message);
        return res.status(200).json({ current: 0, longest: 0, loggedToday: false });
    }
};

module.exports = {
    getStreakHandler,
};
