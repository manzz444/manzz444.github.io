// ==================== GAMES RETRO - SUPER SIMPLE ====================
console.log('🔥 GAMES RETRO LOADED');

document.addEventListener('DOMContentLoaded', () => {
    // TOMBOL MAIN MENU
    document.querySelectorAll('.btn-game').forEach(btn => {
        btn.addEventListener('click', (e) => {
            alert('LU KLIK: ' + e.target.innerText);
        });
    });

    // TOMBOL BACK
    window.showMenu = function() {
        alert('BACK TO MENU');
    };

    // RESET SCORE
    window.resetScore = function() {
        alert('RESET SCORE');
    };
});