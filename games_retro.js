// ==================== GAMES RETRO - FINAL WORKING VERSION ====================
console.log('🎮 Retro Games loaded');

// ==================== STATE ====================
let score = 0;
let socket = null;
let currentSession = null;
let playerName = 'Player';
const MAX_RECONNECT = 3;
let reconnectAttempts = 0;

// ==================== SKOR ====================
function updateScore() {
    const scoreEl = document.getElementById('gameScore');
    if (scoreEl) scoreEl.innerHTML = `🏆 SCORE: ${score}`;
}

window.resetScore = function() {
    if (confirm('Reset score to zero?')) {
        score = 0;
        updateScore();
    }
};

// ==================== NAVIGASI ====================
window.showMenu = function() {
    document.querySelectorAll('.game-area').forEach(el => el.classList.add('hidden'));
    const menu = document.getElementById('gameMenu');
    if (menu) menu.classList.remove('hidden');
};

function hideAllGames() {
    document.querySelectorAll('.game-area').forEach(el => el.classList.add('hidden'));
    const menu = document.getElementById('gameMenu');
    if (menu) menu.classList.add('hidden');
}

function showGame(game) {
    hideAllGames();
    
    const gameElement = document.getElementById(game);
    if (gameElement) gameElement.classList.remove('hidden');
}

// ==================== MULTIPLAYER FUNCTIONS ====================
function addMultiStatus(message, type = 'info') {
    const statusDiv = document.getElementById('multiStatus');
    if (!statusDiv) return;
    
    const line = document.createElement('div');
    line.className = 'status-line';
    line.innerHTML = `> ${message}`;
    
    if (type === 'error') line.style.color = '#ff6b6b';
    else if (type === 'success') line.style.color = '#00ff99';
    else line.style.color = '#888';
    
    statusDiv.appendChild(line);
    statusDiv.scrollTop = statusDiv.scrollHeight;
    
    if (statusDiv.children.length > 8) {
        statusDiv.removeChild(statusDiv.children[0]);
    }
}

function updatePlayersList(players) {
    const container = document.getElementById('multiPlayersContainer');
    if (!container) return;
    
    container.innerHTML = '';
    players.forEach(player => {
        container.innerHTML += `<div class="player-item">👤 ${player.name}</div>`;
    });
}

function initMultiplayer() {
    if (socket && socket.connected) {
        addMultiStatus('✅ Already connected', 'success');
        return;
    }
    
    addMultiStatus('🔄 Connecting to server...', 'info');
    
    socket = io('http://localhost:3001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
    });

    socket.on('connect', () => {
        addMultiStatus('✅ Connected to server', 'success');
        document.getElementById('multiConnectionStatus').innerText = 'YES';
        document.getElementById('multiSessionControls').classList.remove('hidden');
        reconnectAttempts = 0;
    });

    socket.on('connect_error', (err) => {
        addMultiStatus(`❌ Connection error: ${err.message}`, 'error');
        reconnectAttempts++;
        
        if (reconnectAttempts >= MAX_RECONNECT) {
            addMultiStatus('❌ Failed to connect after multiple attempts', 'error');
            socket.disconnect();
            socket = null;
        }
    });

    socket.on('session-created', (data) => {
        currentSession = data.sessionCode;
        document.getElementById('multiSessionCode').value = data.sessionCode;
        document.getElementById('multiSessionStatus').innerText = data.sessionCode;
        addMultiStatus(`✅ Session created: ${data.sessionCode}`, 'success');
        document.getElementById('multiPlayersList').classList.remove('hidden');
        document.getElementById('multiStartGameBtn').classList.remove('hidden');
    });

    socket.on('player-joined', (data) => {
        addMultiStatus(`👤 ${data.message}`, 'info');
        updatePlayersList(data.players);
    });

    socket.on('game-started', () => {
        addMultiStatus(`🎮 Game started!`, 'success');
        hideAllGames();
        document.getElementById('gameMultiBattle').classList.remove('hidden');
    });

    socket.on('player-left', (data) => {
        addMultiStatus(`👋 ${data.message}`, 'info');
        updatePlayersList(data.players);
    });

    socket.on('error', (data) => {
        addMultiStatus(`❌ ${data.message}`, 'error');
    });

    socket.on('disconnect', () => {
        addMultiStatus('🔴 Disconnected from server', 'error');
        document.getElementById('multiConnectionStatus').innerText = 'NO';
        document.getElementById('multiSessionControls').classList.add('hidden');
        document.getElementById('multiPlayersList').classList.add('hidden');
        document.getElementById('multiStartGameBtn').classList.add('hidden');
    });
}

// ==================== GAME 1 ====================
let secretNumber = Math.floor(Math.random() * 10) + 1;

function checkGuess() {
    const guess = parseInt(document.getElementById('guessInput').value);
    const display = document.getElementById('guessDisplay');
    const msg = document.getElementById('gameMessage');

    if (isNaN(guess) || guess < 1 || guess > 10) {
        msg.innerText = '❌ 1-10 ONLY!';
        return;
    }

    if (guess === secretNumber) {
        display.innerText = '🎉';
        msg.innerText = '✅ CORRECT! +50';
        score += 50;
        updateScore();
        secretNumber = Math.floor(Math.random() * 10) + 1;
        document.getElementById('guessInput').value = '';
    } else if (guess < secretNumber) {
        display.innerText = '🔻';
        msg.innerText = 'TOO LOW!';
    } else {
        display.innerText = '🔺';
        msg.innerText = 'TOO HIGH!';
    }
}

// ==================== GAME 2 ====================
function playRPS(move) {
    const moves = ['rock', 'paper', 'scissors'];
    const emoji = { rock: '🪨', paper: '📄', scissors: '✂️' };
    const computer = moves[Math.floor(Math.random() * 3)];
    const display = document.getElementById('rpsDisplay');
    const msg = document.getElementById('gameMessage');

    let result = '';
    if (move === computer) {
        result = '🤝 DRAW! +10';
        score += 10;
    } else if (
        (move === 'rock' && computer === 'scissors') ||
        (move === 'paper' && computer === 'rock') ||
        (move === 'scissors' && computer === 'paper')
    ) {
        result = '🎉 WIN! +30';
        score += 30;
    } else {
        result = '💔 LOSE! +5';
        score += 5;
    }

    display.innerHTML = `${emoji[move]} VS ${emoji[computer]}`;
    msg.innerText = result;
    updateScore();
}

// ==================== GAME 3 ====================
let mathAnswer = 0;

function generateMathQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];

    if (op === '+') mathAnswer = num1 + num2;
    else if (op === '-') mathAnswer = num1 - num2;
    else mathAnswer = num1 * num2;

    document.getElementById('quizDisplay').innerText = `${num1} ${op} ${num2} = ?`;
    document.getElementById('quizInput').value = '';
}

function checkMath() {
    const answer = parseInt(document.getElementById('quizInput').value);
    const msg = document.getElementById('gameMessage');

    if (isNaN(answer)) {
        msg.innerText = '❌ INPUT NUMBER!';
        return;
    }

    if (answer === mathAnswer) {
        msg.innerText = '✅ PERFECT! +50';
        score += 50;
        generateMathQuestion();
    } else {
        msg.innerText = '❌ WRONG! +10';
        score += 10;
    }
    updateScore();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded');
    updateScore();

    // Main menu
    document.querySelectorAll('.btn-game[data-game]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gameId = e.target.dataset.game;
            console.log('Game selected:', gameId);
            
            if (gameId === 'guess') showGame('gameGuess');
            else if (gameId === 'rps') {
                showGame('gameRPS');
                document.getElementById('rpsDisplay').innerText = 'VS';
            }
            else if (gameId === 'quiz') {
                showGame('gameQuiz');
                generateMathQuestion();
            }
            else if (gameId === 'multi') {
                showGame('gameMultiLobby');
                // Reset status
                document.getElementById('multiStatus').innerHTML = `
                    <div class="status-line">> Disconnected from server</div>
                    <div class="status-line">> Enter your name and connect</div>
                `;
                document.getElementById('multiConnectionStatus').innerText = 'NO';
                document.getElementById('multiSessionStatus').innerText = 'NONE';
                document.getElementById('multiSessionControls').classList.add('hidden');
                document.getElementById('multiPlayersList').classList.add('hidden');
                document.getElementById('multiStartGameBtn').classList.add('hidden');
            }
        });
    });

    // Game 1
    document.getElementById('guessBtn')?.addEventListener('click', checkGuess);
    document.getElementById('guessInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkGuess();
    });

    // Game 2
    document.querySelectorAll('.btn-rps').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playRPS(e.target.dataset.move);
        });
    });
    document.getElementById('rpsPlay')?.addEventListener('click', () => {
        const random = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
        playRPS(random);
    });

    // Game 3
    document.getElementById('quizBtn')?.addEventListener('click', checkMath);
    document.getElementById('quizInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkMath();
    });

    // ===== MULTIPLAYER =====
    document.getElementById('multiConnectBtn')?.addEventListener('click', () => {
        const name = document.getElementById('multiPlayerName').value.trim();
        if (!name) {
            addMultiStatus('❌ Please enter your name', 'error');
            return;
        }
        playerName = name;
        localStorage.setItem('playerName', name);
        initMultiplayer();
    });

    document.getElementById('multiCreateBtn')?.addEventListener('click', () => {
        if (!socket || !socket.connected) {
            addMultiStatus('❌ Not connected to server', 'error');
            return;
        }
        socket.emit('create-session', { gameId: 4, playerName });
    });

    document.getElementById('multiJoinBtn')?.addEventListener('click', () => {
        const code = document.getElementById('multiSessionCode').value.trim().toUpperCase();
        if (!code) {
            addMultiStatus('❌ Enter session code', 'error');
            return;
        }
        if (!socket || !socket.connected) {
            addMultiStatus('❌ Not connected to server', 'error');
            return;
        }
        socket.emit('join-session', { sessionCode: code, playerName });
    });

    document.getElementById('multiStartGameBtn')?.addEventListener('click', () => {
        if (!currentSession) {
            addMultiStatus('❌ No active session', 'error');
            return;
        }
        if (!socket || !socket.connected) {
            addMultiStatus('❌ Not connected to server', 'error');
            return;
        }
        socket.emit('start-game', { sessionCode: currentSession });
    });
});