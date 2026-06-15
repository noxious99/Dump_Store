const insightsService = require('../services/insightsService');

// A last-resort payload so the dashboard never renders an empty insights card
// even if snapshot gathering itself blows up.
const SAFE_FALLBACK = [
    { id: 'safe-0', text: 'Log your first expense to start seeing where your money goes.', emoji: '💸', tone: 'neutral', domain: 'expense' },
    { id: 'safe-1', text: 'Set a goal to give your ambitions a deadline — it makes them stick.', emoji: '🎯', tone: 'neutral', domain: 'goals' },
];

/**
 * @desc    AI-generated dashboard insights across expenses, goals and IOUs
 * @route   GET /api/v1/insights/dashboard?refresh=true
 * @access  Private
 */
const getDashboardInsightsHandler = async (req, res) => {
    try {
        const refresh = req.query.refresh === 'true' || req.query.refresh === '1';
        const data = await insightsService.getDashboardInsights(req.user.id, { refresh });
        return res.status(200).json(data);
    } catch (error) {
        // Degrade gracefully — the dashboard should still render something.
        console.error('Dashboard insights error:', error.message);
        return res.status(200).json({ insights: SAFE_FALLBACK, source: 'fallback', cached: false });
    }
};

module.exports = {
    getDashboardInsightsHandler,
};
