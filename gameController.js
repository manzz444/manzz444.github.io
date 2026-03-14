// controllers/gameController.js
const db = require('../models/db'); // ✅ PATH DI PERBAIKI

// Get all games
exports.getAllGames = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM games');
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

// Get game by ID
exports.getGameById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create new game
exports.createGame = async (req, res) => {
    const { name, description, max_players } = req.body;
    
    if (!name || !description) {
        return res.status(400).json({
            success: false,
            message: 'Name and description are required'
        });
    }
    
    try {
        const [result] = await db.query(
            'INSERT INTO games (name, description, max_players) VALUES (?, ?, ?)',
            [name, description, max_players || 2]
        );
        
        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            data: { id: result.insertId, name, description }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update game
exports.updateGame = async (req, res) => {
    const { name, description, max_players } = req.body;
    
    try {
        const [result] = await db.query(
            'UPDATE games SET name = ?, description = ?, max_players = ? WHERE id = ?',
            [name, description, max_players, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Game updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete game
exports.deleteGame = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM games WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Game deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};