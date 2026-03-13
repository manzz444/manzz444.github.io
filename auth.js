// js/auth.js
const ADMIN_PASSWORD = '786343';

function protectPage(pageId, redirectUrl = 'index.html') {
    const content = document.getElementById(pageId);
    const promptDiv = document.getElementById('passwordPrompt');

    if (!content || !promptDiv) return;

    // Cek sessionStorage
    if (sessionStorage.getItem('auth_' + pageId) === 'true') {
        promptDiv.style.display = 'none';
        content.style.display = 'block';
        return;
    }

    // Tampilkan form
    promptDiv.style.display = 'block';
    content.style.display = 'none';

    window.checkPassword = function() {
        const input = document.getElementById('passwordInput');
        if (input.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('auth_' + pageId, 'true');
            promptDiv.style.display = 'none';
            content.style.display = 'block';
        } else {
            alert('Access denied');
            window.location.href = redirectUrl;
        }
    };
}