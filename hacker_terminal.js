// hacker_terminal.js - BENERAN BISA NGETIK
let currentUser = 'guest';
let editMode = false;
let currentEditPage = '';
let editBuffer = {};

// Inisialisasi terminal
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupTerminal();
});

// Fungsi ini dipanggil dari HTML
window.initializeTerminal = function() {
    checkAuth();
    setupTerminal();
};

function checkAuth() {
    if (sessionStorage.getItem('hackerAuth') === 'true') {
        currentUser = 'admin';
        const indicator = document.getElementById('userIndicator');
        if (indicator) indicator.innerText = 'admin';
    }
}

function setupTerminal() {
    const input = document.getElementById('terminalInput');
    
    if (input) {
        // Hapus event listener lama biar gak dobel
        input.removeEventListener('keypress', handleCommand);
        input.addEventListener('keypress', handleCommand);
    }
}

function handleCommand(e) {
    if (e.key === 'Enter') {
        const input = e.target;
        processCommand(input.value);
        input.value = ''; // Kosongkan input
    }
}

function processCommand(cmd) {
    cmd = cmd.trim().toLowerCase();
    addToHistory(`> ${cmd}`);

    // Daftar perintah
    const commands = {
        '/help': showHelp,
        '/games': () => navigateTo('games_retro.html'),
        '/tribute': () => navigateTo('tribute.html'),
        '/dashboard': () => navigateTo('dashboard.html'),
        '/q': () => navigateTo('../index.html'),
        '/clear': clearTerminal,
        '/whoami': showUser
    };

    // Admin-only commands
    if (currentUser === 'admin') {
        commands['/edit_tribute'] = () => startEdit('tribute');
        commands['/edit_dashboard'] = () => startEdit('dashboard');
        commands['/commit_edit'] = commitEdit;
        commands['/cancel_edit'] = cancelEdit;
        commands['/show_edit'] = showEditBuffer;
    }

    if (commands[cmd]) {
        commands[cmd]();
    } else {
        showOutput(`Command not recognized: ${cmd}`);
    }
}

function showHelp() {
    let help = '📋 AVAILABLE COMMANDS:<br>';
    help += '━━━━━━━━━━━━━━━━━━<br>';
    help += '/games - Go to Games Retro<br>';
    help += '/tribute - Go to Tribute Page<br>';
    help += '/dashboard - Go to Dashboard<br>';
    help += '/q - Exit to Home<br>';
    help += '/clear - Clear terminal<br>';
    help += '/whoami - Show user<br>';

    if (currentUser === 'admin') {
        help += '<br>🔧 ADMIN COMMANDS:<br>';
        help += '━━━━━━━━━━━━━━━━━━<br>';
        help += '/edit_tribute - Edit Tribute Page<br>';
        help += '/edit_dashboard - Edit Dashboard<br>';
        help += '/show_edit - Show current edits<br>';
        help += '/commit_edit - Save all edits<br>';
        help += '/cancel_edit - Cancel edits<br>';
    }

    showOutput(help);
}

function navigateTo(page) {
    window.location.href = page;
}

function showUser() {
    showOutput(`Current user: ${currentUser}`);
}

function clearTerminal() {
    const output = document.getElementById('terminalOutput');
    if (output) output.innerHTML = '';
    showOutput('Terminal cleared.');
}

function addToHistory(text) {
    const output = document.getElementById('terminalOutput');
    if (output) {
        output.innerHTML += `<div>${text}</div>`;
        output.scrollTop = output.scrollHeight;
    }
}

function showOutput(text) {
    const output = document.getElementById('terminalOutput');
    if (output) {
        output.innerHTML += `<div>${text}</div>`;
        output.scrollTop = output.scrollHeight;
    }
}

// ===== EDITOR FUNCTIONS =====
function startEdit(page) {
    editMode = true;
    currentEditPage = page;
    editBuffer = JSON.parse(localStorage.getItem(page + 'Data')) || {};
    showOutput(`✏️ Editing ${page}. Use /commit_edit to save.`);
}

function commitEdit() {
    if (!editMode) {
        showOutput('No active edit session.');
        return;
    }

    localStorage.setItem(currentEditPage + 'Data', JSON.stringify(editBuffer));
    editMode = false;
    showOutput(`✅ ${currentEditPage} updated successfully!`);
    currentEditPage = '';
    editBuffer = {};
}

function cancelEdit() {
    editMode = false;
    currentEditPage = '';
    editBuffer = {};
    showOutput('❌ Edit cancelled.');
}

function showEditBuffer() {
    if (!editMode) {
        showOutput('No active edit session.');
        return;
    }
    showOutput(`Current edit buffer for ${currentEditPage}:`);
    showOutput(JSON.stringify(editBuffer, null, 2));
}

// Ekspos fungsi ke global untuk debugging
window.terminalCommands = {
    processCommand,
    showHelp,
    clearTerminal
};