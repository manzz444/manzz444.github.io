// games_retro.js - with persistent score using localStorage
const STORAGE_KEY = 'retroGameScore';

// Load score dari localStorage
let score = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;

let secretNumber = Math.floor(Math.random() * 10) + 1;
let mathAnswer = 0;

// Fungsi untuk menyimpan skor
function saveScore() {
    localStorage.setItem(STORAGE_KEY, score);
}

// Update tampilan skor
function updateScore() {
    document.getElementById('gameScore').innerHTML = `🏆 SCORE: ${score}`;
    saveScore();
}

// Reset skor (untuk admin/developer)
function resetScore() {
    if (confirm('Reset score to zero?')) {
        score = 0;
        updateScore();
    }
}

// TAMPILAN MENU
function showMenu() {
    document.querySelectorAll('.game-area').forEach(el => el.classList.add('hidden'));
    document.getElementById('gameMenu').classList.remove('hidden');
}

// FUNGSI UTAMA
function showGame(game) {
    document.getElementById('gameMenu').classList.add('hidden');
    document.getElementById('gameGuess').classList.add('hidden');
    document.getElementById('gameRPS').classList.add('hidden');
    document.getElementById('gameQuiz').classList.add('hidden');

    if (game === 'guess') {
        document.getElementById('gameGuess').classList.remove('hidden');
        resetGuessGame();
    } else if (game === 'rps') {
        document.getElementById('gameRPS').classList.remove('hidden');
        document.getElementById('rpsDisplay').innerText = 'VS';
    } else if (game === 'quiz') {
        document.getElementById('gameQuiz').classList.remove('hidden');
        generateMathQuestion();
    }
}

// GAME 1: TEBAK ANGKA
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

// GAME 2: ROCK PAPER SCISSORS
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
        score += 5; // Hiburan dikit biar gak frustasi
    }

    display.innerHTML = `${emoji[move]} VS ${emoji[computer]}`;
    msg.innerText = result;
    updateScore();
}

// GAME 3: MATH QUIZ
function generateMathQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];

    let question = `${num1} ${op} ${num2}`;
    if (op === '+') mathAnswer = num1 + num2;
    else if (op === '-') mathAnswer = num1 - num2;
    else mathAnswer = num1 * num2;

    document.getElementById('quizDisplay').innerText = question + ' = ?';
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
        score += 10; // Tetap kasih poin biar semangat
    }
    updateScore();
}

// RESET GAME (UNTUK CHEAT / ADMIN)
function cheatReset() {
    if (confirm('🛠️ Reset game? (Admin only)')) {
        score = 0;
        secretNumber = Math.floor(Math.random() * 10) + 1;
        mathAnswer = 0;
        updateScore();
        document.getElementById('gameMessage').innerText = '🔄 Game reset!';
    }
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan skor saat halaman dimuat
    updateScore();

    // Menu
    document.querySelectorAll('.btn-game[data-game]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showGame(e.target.dataset.game);
        });
    });

    // Game 1
    document.getElementById('guessBtn').addEventListener('click', checkGuess);
    document.getElementById('guessInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkGuess();
    });

    // Game 2
    document.querySelectorAll('.btn-rps').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playRPS(e.target.dataset.move);
        });
    });

    // Game 2 alternate via PLAY button
    document.getElementById('rpsPlay').addEventListener('click', () => {
        const random = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
        playRPS(random);
    });

    // Game 3
    document.getElementById('quizBtn').addEventListener('click', checkMath);
    document.getElementById('quizInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkMath();
    });

    // Cheat code: ketik "reset" di console untuk reset skor
    console.log('🎮 Retro Games loaded! Type cheatReset() to reset score.');
});

// Ekspos fungsi ke global (biar bisa dipanggil dari console)
window.cheatReset = cheatReset;
window.resetScore = resetScore;