// ==================== GAMES RETRO - COMPLETE EDITION ====================
// Dengan fitur: Solo Games (3 game) + Multiplayer Battle (via Socket.io)
// Skor tersimpan di localStorage, multiplayer via backend

// ==================== KONFIGURASI & STATE ====================
const STORAGE_KEY = 'retroGameScore';
let score = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
let secretNumber = Math.floor(Math.random() * 10) + 1;
let mathAnswer = 0;

// Multiplayer state
let socket = null;
let currentSession = null;
let isMultiplayer = false;
let playerName = localStorage.getItem('playerName') || 'Player';

// ==================== FUNGSI SKOR ====================
function saveScore() {
    localStorage.setItem(STORAGE_KEY, score);
}

function updateScore() {
    const scoreEl = document.getElementById('gameScore');
    if (scoreEl) scoreEl.innerHTML = `🏆 SCORE: ${score}`;
    saveScore();
}

function resetScore() {
    if (confirm('Reset score to zero?')) {
        score = 0;
        updateScore();
    }
}

// ==================== NAVIGASI MENU ====================
function showMenu() {
    document.querySelectorAll('.game-area').forEach(el => el.classList.add('hidden'));
    const menu = document.getElementById('gameMenu');
    if (menu) menu.classList.remove('hidden');
}

function hideAllGames() {
    document.querySelectorAll('.game-area').forEach(el => el.classList.add('hidden'));
    const menu = document.getElementById('gameMenu');
    if (menu) menu.classList.add('hidden');
}

function showGame(game) {
    hideAllGames();
    
    switch(game) {
        case 'guess':
            document.getElementById('gameGuess').classList.remove('hidden');
            resetGuessGame();
            break;
        case 'rps':
            document.getElementById('gameRPS').classList.remove('hidden');
            document.getElementById('rpsDisplay').innerText = 'VS';
            break;
        case 'quiz':
            document.getElementById('gameQuiz').classList.remove('hidden');
            generateMathQuestion();
            break;
        case 'multi':
            document.getElementById('gameMultiLobby').classList.remove('hidden');
            if (!socket) initMultiplayer();
            break;
        default:
            showMenu();
    }
}

// ==================== GAME 1: TEBAK ANGKA ====================
function resetGuessGame() {
    secretNumber = Math.floor(Math.random() * 10) + 1;
    document.getElementById('guessDisplay').innerText = '❓';
    document.getElementById('guessInput').value = '';
}

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
        resetGuessGame();
    } else if (guess < secretNumber) {
        display.innerText = '🔻';
        msg.innerText = 'TOO LOW!';
    } else {
        display.innerText = '🔺';
        msg.innerText = 'TOO HIGH!';
    }
}

// ==================== GAME 2: ROCK PAPER SCISSORS ====================
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

// ==================== GAME 3: MATH QUIZ ====================
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

// ==================== MULTIPLAYER (GAME 4) ====================
function initMultiplayer() {
    if (socket) return;
    
    socket = io('http://localhost:3001');

    socket.on('connect', () => {
        addStatus('✅ Connected to server', 'success');
    });

    socket.on('session-created', (data) => {
        currentSession = data.sessionCode;
        document.getElementById('multiSessionCode').value = data.sessionCode;
        addStatus(`✅ Session created: ${data.sessionCode}`, 'success');
        document.getElementById('multiPlayersList').classList.remove('hidden');
        document.getElementById('multiStartGameBtn').classList.remove('hidden');
    });

    socket.on('player-joined', (data) => {
        addStatus(`👤 ${data.message}`, 'info');
        updatePlayersList(data.players);
    });

    socket.on('game-started', (data) => {
        addStatus(`🎮 Game started!`, 'success');
        startMultiplayerGame(data.players);
    });

    socket.on('player-left', (data) => {
        addStatus(`👋 ${data.message}`, 'info');
        updatePlayersList(data.players);
    });

    socket.on('error', (data) => {
        addStatus(`❌ ${data.message}`, 'error');
    });
}

function addStatus(message, type) {
    const msgEl = document.getElementById('gameMessage');
    if (msgEl) {
        msgEl.innerText = message;
        msgEl.style.color = type === 'error' ? '#ff6b6b' : '#00ff99';
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

function startMultiplayerGame(players) {
    isMultiplayer = true;
    hideAllGames();
    document.getElementById('gameMultiBattle').classList.remove('hidden');
    // Di sini nanti logic game multiplayer-nya
}

// ==================== CHEAT / ADMIN ====================
function cheatReset() {
    if (confirm('🛠️ Reset game? (Admin only)')) {
        score = 0;
        secretNumber = Math.floor(Math.random() * 10) + 1;
        mathAnswer = 0;
        updateScore();
        document.getElementById('gameMessage').innerText = '🔄 Game reset!';
    }
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Update skor
    updateScore();

    // Menu games (SEMUA dari HTML, termasuk multiplayer)
    document.querySelectorAll('.btn-game[data-game]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showGame(e.target.dataset.game);
        });
    });

    // Game 1: Tebak Angka
    document.getElementById('guessBtn')?.addEventListener('click', checkGuess);
    document.getElementById('guessInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkGuess();
    });

    // Game 2: RPS
    document.querySelectorAll('.btn-rps').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playRPS(e.target.dataset.move);
        });
    });
    document.getElementById('rpsPlay')?.addEventListener('click', () => {
        const random = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
        playRPS(random);
    });

    // Game 3: Math Quiz
    document.getElementById('quizBtn')?.addEventListener('click', checkMath);
    document.getElementById('quizInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkMath();
    });

    // Multiplayer buttons (dengan pengecekan elemen)
    setTimeout(() => {
        document.getElementById('multiCreateBtn')?.addEventListener('click', () => {
            if (!socket) {
                addStatus('❌ Connecting to server...', 'error');
                initMultiplayer();
                setTimeout(() => {
                    socket?.emit('create-session', { gameId: 4, playerName });
                }, 500);
            } else {
                socket.emit('create-session', { gameId: 4, playerName });
            }
        });

        document.getElementById('multiJoinBtn')?.addEventListener('click', () => {
            const code = document.getElementById('multiSessionCode')?.value.trim();
            if (!code) {
                addStatus('❌ Enter session code', 'error');
                return;
            }
            
            if (!socket) {
                addStatus('❌ Connecting to server...', 'error');
                initMultiplayer();
                setTimeout(() => {
                    socket?.emit('join-session', { sessionCode: code, playerName });
                }, 500);
            } else {
                socket.emit('join-session', { sessionCode: code, playerName });
            }
        });

        document.getElementById('multiStartGameBtn')?.addEventListener('click', () => {
            if (!currentSession) {
                addStatus('❌ No active session', 'error');
                return;
            }
            socket?.emit('start-game', { sessionCode: currentSession });
        });

        // Multiplayer battle buttons
        document.getElementById('multiSendMove')?.addEventListener('click', () => {
            // Logic untuk kirim move ke server
            addStatus('Move sent!', 'success');
        });

    }, 100);

    console.log('🎮 Retro Games loaded! Type cheatReset() to reset score.');
});

// ==================== EKSPOR FUNGSI GLOBAL ====================
window.cheatReset = cheatReset;
window.resetScore = resetScore;
window.showMenu = showMenu;
window.showGame = showGame;
window.playRPS = playRPS;