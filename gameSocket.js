// socket/gameSocket.js
const db = require('../models/db');

module.exports = (io) => {
    // Store active game sessions
    const activeSessions = new Map();

    io.on('connection', (socket) => {
        console.log('🟢 New player connected:', socket.id);

        // Send player their ID
        socket.emit('connection-success', { 
            socketId: socket.id,
            message: 'Connected to game server' 
        });

        // Create new game session
        socket.on('create-session', async (data) => {
            try {
                const { gameId, playerName } = data;
                
                if (!gameId || !playerName) {
                    socket.emit('error', { message: 'Game ID and player name required' });
                    return;
                }

                // Generate unique session code
                const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                
                const players = [{ id: socket.id, name: playerName }];
                
                // Save to database
                const [result] = await db.query(
                    'INSERT INTO game_sessions (game_id, session_code, players, status) VALUES (?, ?, ?, ?)',
                    [gameId, sessionCode, JSON.stringify(players), 'waiting']
                );
                
                // Store in memory
                activeSessions.set(sessionCode, {
                    id: result.insertId,
                    gameId,
                    players: players,
                    status: 'waiting'
                });
                
                // Join socket room
                socket.join(sessionCode);
                
                socket.emit('session-created', {
                    sessionCode,
                    message: `Session ${sessionCode} created. Share this code with friends!`
                });
                
                console.log(`📦 Session created: ${sessionCode} by ${playerName}`);
                
            } catch (error) {
                console.error('Error creating session:', error);
                socket.emit('error', { message: 'Failed to create session: ' + error.message });
            }
        });

        // Join existing session
        socket.on('join-session', async (data) => {
            try {
                const { sessionCode, playerName } = data;
                
                if (!sessionCode || !playerName) {
                    socket.emit('error', { message: 'Session code and player name required' });
                    return;
                }
                
                // Check if session exists in memory
                let session = activeSessions.get(sessionCode);
                
                // If not in memory, check database
                if (!session) {
                    const [rows] = await db.query(
                        'SELECT * FROM game_sessions WHERE session_code = ? AND status = "waiting"',
                        [sessionCode]
                    );
                    
                    if (rows.length > 0) {
                        session = {
                            id: rows[0].id,
                            gameId: rows[0].game_id,
                            players: JSON.parse(rows[0].players),
                            status: rows[0].status
                        };
                        activeSessions.set(sessionCode, session);
                    }
                }
                
                if (!session) {
                    socket.emit('error', { message: 'Session not found or already started' });
                    return;
                }
                
                // Add player to session
                session.players.push({ id: socket.id, name: playerName });
                
                // Update in memory
                activeSessions.set(sessionCode, session);
                
                // Update database
                await db.query(
                    'UPDATE game_sessions SET players = ? WHERE session_code = ?',
                    [JSON.stringify(session.players), sessionCode]
                );
                
                // Join socket room
                socket.join(sessionCode);
                
                // Notify all players in session
                io.to(sessionCode).emit('player-joined', {
                    players: session.players,
                    message: `${playerName} joined the game!`
                });
                
                console.log(`👤 ${playerName} joined session ${sessionCode}`);
                
            } catch (error) {
                console.error('Error joining session:', error);
                socket.emit('error', { message: 'Failed to join session: ' + error.message });
            }
        });

        // Start game
        socket.on('start-game', async (data) => {
            try {
                const { sessionCode } = data;
                const session = activeSessions.get(sessionCode);
                
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }
                
                session.status = 'playing';
                activeSessions.set(sessionCode, session);
                
                // Update database
                await db.query(
                    'UPDATE game_sessions SET status = "playing" WHERE session_code = ?',
                    [sessionCode]
                );
                
                // Notify all players
                io.to(sessionCode).emit('game-started', {
                    message: 'Game started!',
                    players: session.players
                });
                
                console.log(`🎮 Game started in session ${sessionCode}`);
                
            } catch (error) {
                console.error('Error starting game:', error);
                socket.emit('error', { message: 'Failed to start game: ' + error.message });
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log('🔴 Player disconnected:', socket.id);
            
            // Find and update sessions
            for (const [sessionCode, session] of activeSessions.entries()) {
                const playerIndex = session.players.findIndex(p => p.id === socket.id);
                
                if (playerIndex !== -1) {
                    const playerName = session.players[playerIndex].name;
                    session.players.splice(playerIndex, 1);
                    
                    if (session.players.length === 0) {
                        // Session empty, delete it
                        activeSessions.delete(sessionCode);
                        await db.query(
                            'UPDATE game_sessions SET status = "finished" WHERE session_code = ?',
                            [sessionCode]
                        );
                        console.log(`🗑️ Session ${sessionCode} deleted (empty)`);
                    } else {
                        // Update session
                        activeSessions.set(sessionCode, session);
                        await db.query(
                            'UPDATE game_sessions SET players = ? WHERE session_code = ?',
                            [JSON.stringify(session.players), sessionCode]
                        );
                        
                        // Notify remaining players
                        io.to(sessionCode).emit('player-left', {
                            players: session.players,
                            message: `${playerName} left the game`
                        });
                    }
                    break;
                }
            }
        });
    });
};