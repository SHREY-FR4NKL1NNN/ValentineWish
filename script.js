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
let escapeCount = 0;
const PANIC_RADIUS = 100; // Distance at which heart starts to panic
const BASE_ESCAPE_DISTANCE = 60; // How far the heart moves away
const MAX_ESCAPES = 10; // After this many escapes, heart becomes easier to catch

/**
 * Initialize the shy heart game
 */
function initGame() {
    const heart = document.getElementById('shyHeart');
    const gameArea = document.getElementById('gameArea');
    gameActive = true;
    escapeCount = 0;
    
    // Position heart in corners or edges (far from center where cursor usually is)
    const positions = [
        { x: 15, y: 15 },  // Top left
        { x: 85, y: 15 },  // Top right
        { x: 15, y: 85 },  // Bottom left
        { x: 85, y: 85 },  // Bottom right
    ];
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    positionHeart(randomPos.x, randomPos.y);
    
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
    
    // Get heart center position
    const heartRect = heart.getBoundingClientRect();
    const heartCenterX = heartRect.left - rect.left + heartRect.width / 2;
    const heartCenterY = heartRect.top - rect.top + heartRect.height / 2;
    
    // Calculate distance from cursor to heart center
    const distance = Math.sqrt(
        Math.pow(cursorX - heartCenterX, 2) + Math.pow(cursorY - heartCenterY, 2)
    );
    
    // Only move if cursor is within panic radius
    if (distance < PANIC_RADIUS && distance > 0) {
        escapeCount++;
        
        // Calculate escape strength (reduces after many escapes)
        let escapeStrength = BASE_ESCAPE_DISTANCE;
        if (escapeCount > MAX_ESCAPES) {
            escapeStrength = BASE_ESCAPE_DISTANCE * 0.3; // Much easier to catch
        } else if (escapeCount > MAX_ESCAPES * 0.7) {
            escapeStrength = BASE_ESCAPE_DISTANCE * 0.6; // Getting easier
        }
        
        // Calculate direction away from cursor (normalized)
        const directionX = (heartCenterX - cursorX) / distance;
        const directionY = (heartCenterY - cursorY) / distance;
        
        // Calculate new position in pixels
        const newHeartX = heartCenterX + directionX * escapeStrength;
        const newHeartY = heartCenterY + directionY * escapeStrength;
        
        // Convert to percentage
        let newX = (newHeartX / rect.width) * 100;
        let newY = (newHeartY / rect.height) * 100;
        
        // Clamp within bounds (5% to 95% for safety)
        newX = Math.max(5, Math.min(95, newX));
        newY = Math.max(5, Math.min(95, newY));
        
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
