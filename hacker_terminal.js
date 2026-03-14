// hacker_terminal.js - Complete Terminal dengan Guest Login
let currentUser = 'guest';
let editMode = false;
let currentEditPage = '';
let editBuffer = {};
let loginMode = false; // Flag untuk mode login

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
            <span>[PORT: 22]</span>
        `;
    }
}

function checkAuth() {
    const adminAuth = sessionStorage.getItem('hackerAuth');
    const guestAuth = sessionStorage.getItem('guestAuth');
    
    if (adminAuth === 'true') {
        currentUser = 'admin';
    } else if (guestAuth === 'true') {
        currentUser = 'guest';
    } else {
        currentUser = 'guest';
    }
    
    const indicator = document.getElementById('userIndicator');
    if (indicator) indicator.innerText = currentUser;
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
        const command = input.value.trim();
        
        // Jika dalam mode login, proses password
        if (loginMode) {
            processLogin(command);
        } else {
            processCommand(command);
        }
        
        input.value = ''; // Kosongkan input
    }
}

function processLogin(password) {
    loginMode = false;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('hackerAuth', 'true');
        sessionStorage.removeItem('guestAuth');
        currentUser = 'admin';
        document.getElementById('userIndicator').innerText = 'admin';
        showOutput('✅ Admin login successful. Welcome!');
    } else if (password === GUEST_PASSWORD) {
        sessionStorage.setItem('guestAuth', 'true');
        sessionStorage.removeItem('hackerAuth');
        currentUser = 'guest';
        document.getElementById('userIndicator').innerText = 'guest';
        showOutput('👋 Guest login successful. Limited access.');
    } else {
        showOutput('❌ Wrong password. Access denied.');
    }
    
    updateFooter();
    setupTerminal();
}

function processCommand(cmd) {
    if (!cmd) return;
    
    cmd = cmd.trim().toLowerCase();
    addToHistory(`> ${cmd}`);

    // Perintah dasar untuk semua user
    if (cmd === '/help') {
        if (currentUser === 'admin') {
            showAdminHelp();
        } else {
            showGuestHelp();
        }
        return;
    }
    
    if (cmd === '/games') {
        navigateTo('games_retro.html');
        return;
    }
    
    if (cmd === '/tribute') {
        navigateTo('tribute.html');
        return;
    }
    
    if (cmd === '/dashboard') {
        navigateTo('dashboard.html');
        return;
    }
    
    if (cmd === '/q') {
        navigateTo('../index.html');
        return;
    }
    
    if (cmd === '/clear') {
        clearTerminal();
        return;
    }
    
    if (cmd === '/whoami') {
        showOutput(`Current user: ${currentUser}`);
        return;
    }
    
    if (cmd === '/login') {
        showOutput('🔒 Enter password: (type it and press Enter)');
        loginMode = true;
        return;
    }
    
    // Perintah khusus admin
    if (currentUser === 'admin') {
        if (cmd === '/logout') {
            logout();
            return;
        }
        
        if (cmd === '/edit_tribute') {
            startEdit('tribute');
            return;
        }
        
        if (cmd === '/edit_dashboard') {
            startEdit('dashboard');
            return;
        }
        
        if (cmd === '/show_edit') {
            showEditBuffer();
            return;
        }
        
        if (cmd === '/commit_edit') {
            commitEdit();
            return;
        }
        
        if (cmd === '/cancel_edit') {
            cancelEdit();
            return;
        }
    }
    
    // Kalau gak ada perintah yang cocok
    showOutput(`Command not recognized: ${cmd}`);
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