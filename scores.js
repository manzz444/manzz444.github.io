// routes/scores.js
const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

// Get top scores
router.get('/top/:gameId', scoreController.getTopScores);

// Get player scores
router.get('/player/:playerName', scoreController.getPlayerScores);

// Submit new score
router.post('/', scoreController.submitScore);

module.exports = router;