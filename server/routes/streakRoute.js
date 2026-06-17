const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const streakController = require('../controller/streakController');

router.get('/', auth, streakController.getStreakHandler);

module.exports = router;
