// controllers/scoreController.js
const db = require('../models/db');

// Get top scores for a game
exports.getTopScores = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM scores WHERE game_id = ? ORDER BY score DESC LIMIT 10',
            [req.params.gameId]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get scores by player name
exports.getPlayerScores = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT s.*, g.name as game_name FROM scores s JOIN games g ON s.game_id = g.id WHERE s.player_name = ? ORDER BY s.score DESC',
            [req.params.playerName]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Submit new score
exports.submitScore = async (req, res) => {
    const { game_id, player_name, score } = req.body;
    
    if (!game_id || !player_name || score === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Game ID, player name, and score are required'
        });
    }
    
    try {
        const [result] = await db.query(
            'INSERT INTO scores (game_id, player_name, score) VALUES (?, ?, ?)',
            [game_id, player_name, score]
        );
        
        res.status(201).json({
            success: true,
            message: 'Score submitted successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};