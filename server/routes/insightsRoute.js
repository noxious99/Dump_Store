const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const insightsController = require('../controller/insightsController');

router.get('/dashboard', auth, insightsController.getDashboardInsightsHandler);

module.exports = router;
