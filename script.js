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
let heartVelocityX = 0;
let heartVelocityY = 0;
let animationFrameId = null;

const PANIC_RADIUS = 100; // Distance at which heart starts to panic
const ESCAPE_FORCE = 15; // Initial escape speed
const FRICTION = 0.92; // Slowdown factor (lower = slower deceleration)
const MAX_ESCAPES = 10; // After this many escapes, heart becomes easier to catch

/**
 * Initialize the shy heart game
 */
function initGame() {
    const heart = document.getElementById('shyHeart');
    const gameArea = document.getElementById('gameArea');
    gameActive = true;
    escapeCount = 0;
    heartVelocityX = 0;
    heartVelocityY = 0;
    
    // Position heart in corners or edges (far from center where cursor usually is)
    const positions = [
        { x: 15, y: 15 },  // Top left
        { x: 85, y: 15 },  // Top right
        { x: 15, y: 85 },  // Bottom left
        { x: 85, y: 85 },  // Bottom right
    ];
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    positionHeart(randomPos.x, randomPos.y);
    
    // Start animation loop
    updateHeartPosition();
    
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
 * Update heart position based on velocity (called every frame)
 */
function updateHeartPosition() {
    if (!gameActive) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        return;
    }
    
    const heart = document.getElementById('shyHeart');
    const gameArea = document.getElementById('gameArea');
    const rect = gameArea.getBoundingClientRect();
    
    // Apply friction to slow down movement
    heartVelocityX *= FRICTION;
    heartVelocityY *= FRICTION;
    
    // Stop if velocity is very small
    if (Math.abs(heartVelocityX) < 0.1) heartVelocityX = 0;
    if (Math.abs(heartVelocityY) < 0.1) heartVelocityY = 0;
    
    // Get current position
    const currentLeft = parseFloat(heart.style.left) || 50;
    const currentTop = parseFloat(heart.style.top) || 50;
    
    // Calculate new position
    const newX = currentLeft + (heartVelocityX / rect.width) * 100;
    const newY = currentTop + (heartVelocityY / rect.height) * 100;
    
    // Clamp within bounds and bounce off edges
    let clampedX = newX;
    let clampedY = newY;
    
    if (newX < 5) {
        clampedX = 5;
        heartVelocityX = Math.abs(heartVelocityX) * 0.5; // Bounce back
    } else if (newX > 95) {
        clampedX = 95;
        heartVelocityX = -Math.abs(heartVelocityX) * 0.5; // Bounce back
    }
    
    if (newY < 5) {
        clampedY = 5;
        heartVelocityY = Math.abs(heartVelocityY) * 0.5; // Bounce back
    } else if (newY > 95) {
        clampedY = 95;
        heartVelocityY = -Math.abs(heartVelocityY) * 0.5; // Bounce back
    }
    
    positionHeart(clampedX, clampedY);
    
    // Continue animation loop
    animationFrameId = requestAnimationFrame(updateHeartPosition);
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
    
    // Only add velocity if cursor is within panic radius
    if (distance < PANIC_RADIUS && distance > 0) {
        escapeCount++;
        
        // Calculate escape force (reduces after many escapes)
        let escapeForce = ESCAPE_FORCE;
        if (escapeCount > MAX_ESCAPES) {
            escapeForce = ESCAPE_FORCE * 0.3; // Much easier to catch
        } else if (escapeCount > MAX_ESCAPES * 0.7) {
            escapeForce = ESCAPE_FORCE * 0.6; // Getting easier
        }
        
        // Calculate direction away from cursor (normalized)
        const directionX = (heartCenterX - cursorX) / distance;
        const directionY = (heartCenterY - cursorY) / distance;
        
        // Add velocity in the escape direction
        heartVelocityX += directionX * escapeForce;
        heartVelocityY += directionY * escapeForce;
        
        // Cap max velocity
        const maxVelocity = 25;
        const velocityMagnitude = Math.sqrt(heartVelocityX * heartVelocityX + heartVelocityY * heartVelocityY);
        if (velocityMagnitude > maxVelocity) {
            heartVelocityX = (heartVelocityX / velocityMagnitude) * maxVelocity;
            heartVelocityY = (heartVelocityY / velocityMagnitude) * maxVelocity;
        }
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
    
    // Stop animation loop
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
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
