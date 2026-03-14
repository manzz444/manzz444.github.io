// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // Ganti dengan URL frontend kamu
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = require('./models/db');

// Routes
app.use('/api/games', require('./routes/games'));
app.use('/api/scores', require('./routes/scores'));

// Socket.io
require('./socket/gameSocket')(io);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Retro Games API is running!' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 http://localhost:${PORT}`);
});