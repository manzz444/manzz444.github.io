// routes/games.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Get all games
router.get('/', gameController.getAllGames);

// Get game by ID
router.get('/:id', gameController.getGameById);

// Create new game
router.post('/', gameController.createGame);

// Update game
router.put('/:id', gameController.updateGame);

// Delete game
router.delete('/:id', gameController.deleteGame);

module.exports = router;