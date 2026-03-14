// hacker_terminal.js - Complete Terminal dengan Guest Login
let currentUser = 'guest';
let editMode = false;
let currentEditPage = '';
let editBuffer = {};

// Password
const ADMIN_PASSWORD = '786343';
const GUEST_PASSWORD = '489621';

// Inisialisasi terminal
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupTerminal();
    updateFooter();
    showOutput('👋 Welcome to Hacker Terminal. Type /help for commands.');
});

window.initializeTerminal = function() {
    checkAuth();
    setupTerminal();
    updateFooter();
};

function updateFooter() {
    const footer = document.querySelector('.terminal-footer');
    if (footer) {
        footer.innerHTML = `
            <span>[GUEST LOGIN: 489621]</span>
            <span>[ADMIN LOGIN: 786343]</span>
            <span>[PORT: 22]</span>
        `;
    }
}

function checkAuth() {
    if (sessionStorage.getItem('hackerAuth') === 'true') {
        currentUser = 'admin';
        const indicator = document.getElementById('userIndicator');
        if (indicator) indicator.innerText = 'admin';
    } else if (sessionStorage.getItem('guestAuth') === 'true') {
        currentUser = 'guest';
        const indicator = document.getElementById('userIndicator');
        if (indicator) indicator.innerText = 'guest';
    } else {
        currentUser = 'guest';
        const indicator = document.getElementById('userIndicator');
        if (indicator) indicator.innerText = 'guest';
    }
}

function setupTerminal() {
    const input = document.getElementById('terminalInput');
    
    if (input) {
        input.removeEventListener('keypress', handleCommand);
        input.addEventListener('keypress', handleCommand);
        input.focus();
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

    // Perintah untuk semua user
    const guestCommands = {
        '/help': showGuestHelp,
        '/games': () => navigateTo('games_retro.html'),
        '/tribute': () => navigateTo('tribute.html'),
        '/dashboard': () => navigateTo('dashboard.html'),
        '/q': () => navigateTo('../index.html'),
        '/clear': clearTerminal,
        '/whoami': () => showOutput(`Current user: ${currentUser}`),
        '/login': showLoginPrompt
    };

    // Perintah khusus admin
    const adminCommands = {
        '/help': showAdminHelp,
        '/edit_tribute': () => startEdit('tribute'),
        '/edit_dashboard': () => startEdit('dashboard'),
        '/show_edit': showEditBuffer,
        '/commit_edit': commitEdit,
        '/cancel_edit': cancelEdit,
        '/logout': logout
    };

    // Jalankan perintah berdasarkan user
    if (currentUser === 'admin') {
        if (adminCommands[cmd]) {
            adminCommands[cmd]();
        } else if (guestCommands[cmd]) {
            guestCommands[cmd]();
        } else {
            showOutput(`Command not recognized: ${cmd}`);
        }
    } else {
        if (guestCommands[cmd]) {
            guestCommands[cmd]();
        } else {
            showOutput(`Command not recognized: ${cmd}`);
        }
    }
}

function showGuestHelp() {
    let help = '📋 GUEST COMMANDS:<br>';
    help += '━━━━━━━━━━━━━━━━━━<br>';
    help += '/games - Go to Games Retro<br>';
    help += '/tribute - View Tribute Page<br>';
    help += '/dashboard - View Dashboard<br>';
    help += '/q - Exit to Home<br>';
    help += '/clear - Clear terminal<br>';
    help += '/whoami - Show current user<br>';
    help += '/login - Login as guest/admin<br>';
    showOutput(help);
}

function showAdminHelp() {
    let help = '📋 ADMIN COMMANDS:<br>';
    help += '━━━━━━━━━━━━━━━━━━<br>';
    help += '/games - Go to Games Retro<br>';
    help += '/tribute - Go to Tribute Page<br>';
    help += '/dashboard - Go to Dashboard<br>';
    help += '/q - Exit to Home<br>';
    help += '/clear - Clear terminal<br>';
    help += '/whoami - Show current user<br>';
    help += '/logout - Logout from admin<br>';
    help += '<br>🔧 EDIT COMMANDS:<br>';
    help += '/edit_tribute - Edit Tribute Page<br>';
    help += '/edit_dashboard - Edit Dashboard<br>';
    help += '/show_edit - Show current edits<br>';
    help += '/commit_edit - Save all edits<br>';
    help += '/cancel_edit - Cancel edits<br>';
    showOutput(help);
}

function showLoginPrompt() {
    showOutput('🔒 Enter password: (type it and press Enter)');
    
    const input = document.getElementById('terminalInput');
    input.removeEventListener('keypress', handleCommand);
    
    input.addEventListener('keypress', function loginHandler(e) {
        if (e.key === 'Enter') {
            const password = e.target.value.trim();
            
            if (password === ADMIN_PASSWORD) {
                sessionStorage.setItem('hackerAuth', 'true');
                sessionStorage.removeItem('guestAuth');
                currentUser = 'admin';
                document.getElementById('userIndicator').innerText = 'admin';
                showOutput('✅ Admin login successful. Welcome!');
                updateFooter();
                setupTerminal();
            } else if (password === GUEST_PASSWORD) {
                sessionStorage.setItem('guestAuth', 'true');
                sessionStorage.removeItem('hackerAuth');
                currentUser = 'guest';
                document.getElementById('userIndicator').innerText = 'guest';
                showOutput('👋 Guest login successful. Limited access.');
                updateFooter();
                setupTerminal();
            } else {
                showOutput('❌ Wrong password. Access denied.');
                setupTerminal();
            }
            e.target.value = '';
        }
    });
}

function logout() {
    sessionStorage.removeItem('hackerAuth');
    sessionStorage.removeItem('guestAuth');
    currentUser = 'guest';
    document.getElementById('userIndicator').innerText = 'guest';
    showOutput('👋 Logged out. Back to guest mode.');
    updateFooter();
}

function navigateTo(page) {
    window.location.href = page;
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
    if (currentUser !== 'admin') {
        showOutput('❌ Admin only command.');
        return;
    }
    editMode = true;
    currentEditPage = page;
    editBuffer = JSON.parse(localStorage.getItem(page + 'Data')) || {};
    showOutput(`✏️ Editing ${page}. Use /commit_edit to save.`);
}

function commitEdit() {
    if (currentUser !== 'admin') {
        showOutput('❌ Admin only command.');
        return;
    }
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
    if (currentUser !== 'admin') {
        showOutput('❌ Admin only command.');
        return;
    }
    editMode = false;
    currentEditPage = '';
    editBuffer = {};
    showOutput('❌ Edit cancelled.');
}

function showEditBuffer() {
    if (currentUser !== 'admin') {
        showOutput('❌ Admin only command.');
        return;
    }
    if (!editMode) {
        showOutput('No active edit session.');
        return;
    }
    showOutput(`Current edit buffer for ${currentEditPage}:`);
    showOutput(JSON.stringify(editBuffer, null, 2));
}

// Ekspos fungsi ke global
window.terminalCommands = {
    processCommand,
    showHelp: showGuestHelp,
    clearTerminal
};