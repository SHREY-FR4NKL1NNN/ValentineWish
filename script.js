// ============================================
// SCREEN NAVIGATION
// ============================================

/**
 * Navigate between different screens with smooth transitions
 * @param {number} screenNumber - The screen number to navigate to
 */
function goToScreen(screenNumber) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Show target screen
    const targetScreen = document.getElementById(`screen${screenNumber}`);
    setTimeout(() => {
        targetScreen.classList.add('active');
        
        // Initialize screen-specific features
        if (screenNumber === 2) {
            initGame();
        } else if (screenNumber === 4) {
            createConfetti();
        }
    }, 300);
}

// ============================================
// FLOATING HEARTS BACKGROUND
// ============================================

/**
 * Create floating hearts animation in the background
 */
function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const heartEmojis = ['💕', '💖', '💗', '💓', '💝'];
    
    // Create 15 floating hearts
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        
        // Random horizontal position
        heart.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        heart.style.animationDelay = Math.random() * 8 + 's';
        
        // Random animation duration
        heart.style.animationDuration = (6 + Math.random() * 4) + 's';
        
        container.appendChild(heart);
    }
}

// ============================================
// GAME LOGIC
// ============================================

let gameActive = false;
let moveCount = 0;

/**
 * Initialize the shy heart game
 */
function initGame() {
    const heart = document.getElementById('shyHeart');
    const gameArea = document.getElementById('gameArea');
    gameActive = true;
    moveCount = 0;
    
    // Position heart in a random spot (away from center)
    const randomX = 30 + Math.random() * 40; // 30% to 70%
    const randomY = 30 + Math.random() * 40; // 30% to 70%
    positionHeart(randomX, randomY);
    
    // Add event listeners
    heart.addEventListener('click', catchHeart);
    heart.addEventListener('touchstart', catchHeart);
    gameArea.addEventListener('mousemove', moveHeartAway);
    gameArea.addEventListener('touchmove', moveHeartAwayTouch);
}

/**
 * Position the heart at specific coordinates (percentage-based)
 */
function positionHeart(x, y) {
    const heart = document.getElementById('shyHeart');
    heart.style.left = x + '%';
    heart.style.top = y + '%';
}

/**
 * Move heart away from cursor on desktop
 */
function moveHeartAway(e) {
    if (!gameActive) return;
    
    const heart = document.getElementById('shyHeart');
    const gameArea = document.getElementById('gameArea');
    const rect = gameArea.getBoundingClientRect();
    
    // Get cursor position relative to game area
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    
    // Get heart position
    const heartRect = heart.getBoundingClientRect();
    const heartX = heartRect.left - rect.left + heartRect.width / 2;
    const heartY = heartRect.top - rect.top + heartRect.height / 2;
    
    // Calculate distance
    const distance = Math.sqrt(
        Math.pow(cursorX - heartX, 2) + Math.pow(cursorY - heartY, 2)
    );
    
    // If cursor is close enough, move heart away
    if (distance < 150) {
        moveCount++;
        
        // Calculate direction away from cursor
        const angle = Math.atan2(heartY - cursorY, heartX - cursorX);
        
        // Calculate new position (move further away)
        let newX = ((heartX + Math.cos(angle) * 120) / rect.width) * 100;
        let newY = ((heartY + Math.sin(angle) * 120) / rect.height) * 100;
        
        // Keep within bounds (10% to 90%)
        newX = Math.max(10, Math.min(90, newX));
        newY = Math.max(10, Math.min(90, newY));
        
        // After 8 moves, make it easier to catch
        if (moveCount > 8) {
            newX = 50;
            newY = 50;
        }
        
        positionHeart(newX, newY);
    }
}

/**
 * Move heart away from touch on mobile
 */
function moveHeartAwayTouch(e) {
    e.preventDefault();
    if (!gameActive || !e.touches[0]) return;
    
    const touch = e.touches[0];
    moveHeartAway({ clientX: touch.clientX, clientY: touch.clientY });
}

/**
 * Handle heart being caught
 */
function catchHeart(e) {
    if (!gameActive) return;
    
    e.stopPropagation();
    gameActive = false;
    
    const heart = document.getElementById('shyHeart');
    heart.classList.add('caught');
    
    // Proceed to next screen after animation
    setTimeout(() => {
        goToScreen(3);
    }, 800);
}

// ============================================
// CONFETTI ANIMATION
// ============================================

/**
 * Create confetti particles for the final screen
 */
function createConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#ffb6d9', '#d4a5ff', '#b6e5ff', '#ffd4e5', '#e5b6ff'];
    
    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        // Random properties
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        // Random shape (some are rectangular, some square)
        if (Math.random() > 0.5) {
            confetti.style.width = '15px';
            confetti.style.height = '6px';
        }
        
        container.appendChild(confetti);
    }
}

// ============================================
// FINAL MESSAGE
// ============================================

/**
 * Show the final message after user clicks YES
 */
function showFinalMessage() {
    const questionCard = document.getElementById('questionCard');
    const finalMessage = document.getElementById('finalMessage');
    
    questionCard.classList.add('hidden');
    finalMessage.classList.remove('hidden');
    
    // Create more confetti!
    setTimeout(() => {
        createConfetti();
    }, 300);
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
});
