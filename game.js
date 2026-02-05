// Mario-Style Love Journey Game (No Images Needed - Simple Canvas Drawing)
// Instructions: Replace photo files and captions in the storyBlocks array below.
// Photos: If they fail to load, a drawn placeholder shows with the caption.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 3;
const CAMERA_SPEED = 2;
const TILE_SIZE = 32;

// Animation frame counter for simple animations
let animationFrame = 0;

// States
const STATES = {
    START_SCREEN: 'start',
    CH1_PLAY: 'ch1_play',
    CUTSCENE_JOIN: 'cutscene_join',
    CH2_PLAY: 'ch2_play',
    CUTSCENE_FLIGHT: 'cutscene_flight',
    CH3_PLAY: 'ch3_play',
    END_FLAG: 'end_flag',
    VALENTINE_SCREEN: 'valentine',
    END_MESSAGE: 'end_message'
};
let currentState = STATES.START_SCREEN;

// Story blocks (easy to edit)
const storyBlocks = [
    { id: 1, x: 200, photo: "photos/photo1.jpg", caption: "The day my world got brighter.", chapter: "First Spark" },
    { id: 2, x: 400, photo: "photos/photo2.jpg", caption: "Our first real moment—still my favorite.", chapter: "First Spark" },
    { id: 3, x: 600, photo: "photos/photo3.jpg", caption: "The beginning of ‘us’.", chapter: "First Spark" },
    { id: 4, x: 1000, photo: "photos/photo4.jpg", caption: "We kept choosing each other.", chapter: "Journey Together" },
    { id: 5, x: 1200, photo: "photos/photo5.jpg", caption: "Laughs, chaos, and love—our kind of perfect.", chapter: "Journey Together" },
    { id: 6, x: 1400, photo: "photos/photo6.jpg", caption: "You made ordinary days feel golden.", chapter: "Journey Together" },
    { id: 7, x: 1600, photo: "photos/photo7.jpg", caption: "And somehow… it still felt like the start.", chapter: "Journey Together" },
    { id: 8, x: 2200, photo: "photos/photo8.jpg", caption: "Miles apart… but never out of reach.", chapter: "Long Distance" },
    { id: 9, x: 2400, photo: "photos/photo9.jpg", caption: "We turned time zones into togetherness.", chapter: "Long Distance" },
    { id: 10, x: 2600, photo: "photos/photo10.jpg", caption: "Distance tested us—love carried us.", chapter: "Long Distance" },
    { id: 11, x: 2800, photo: "photos/photo11.jpg", caption: "Even far away, you’re my safe place.", chapter: "Long Distance" },
    { id: 12, x: 3000, photo: "photos/photo12.jpg", caption: "And I’d choose you—every level, every time.", chapter: "Long Distance" }
];

// Entities (no images needed)
let player = { x: 50, y: 300, vx: 0, vy: 0, width: 32, height: 32, color: '#FF69B4', onGround: false }; // Pink for girl
let player2 = { x: 0, y: 300, width: 32, height: 32, color: '#4169E1', visible: false }; // Blue for boy
let car = { x: 0, y: 300, width: 64, height: 32, visible: false };
let plane = { x: 0, y: 0, width: 128, height: 64, visible: false, vx: 0, vy: 0 };
let bricks = [];
let flag = { x: 3200, y: 200, width: 32, height: 128 };
let camera = { x: 0, y: 0 };

// Initialize bricks
function initBricks() {
    storyBlocks.forEach(block => {
        bricks.push({ x: block.x, y: 200, width: 32, height: 32, type: 'question', id: block.id, used: false });
    });
}

// Game loop
function gameLoop() {
    animationFrame++;
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update logic
function update() {
    if (currentState === STATES.START_SCREEN) return;
    if (currentState === STATES.END_FLAG || currentState === STATES.VALENTINE_SCREEN || currentState === STATES.END_MESSAGE) return;

    // Auto-run
    if (currentState === STATES.CH1_PLAY || currentState === STATES.CH3_PLAY) {
        player.x += PLAYER_SPEED;
    } else if (currentState === STATES.CH2_PLAY) {
        car.x += PLAYER_SPEED;
    }

    // Gravity and jump
    if (currentState === STATES.CH1_PLAY || currentState === STATES.CH3_PLAY) {
        player.vy += GRAVITY;
        player.y += player.vy;
        if (player.y >= 300) { player.y = 300; player.vy = 0; player.onGround = true; }
    }

    // Camera follow
    camera.x = Math.max(0, player.x - canvas.width / 2);

    // Auto-bump bricks
    bricks.forEach(brick => {
        if (!brick.used && brick.type === 'question' && player.x + player.width > brick.x && player.x < brick.x + brick.width && player.y < brick.y) {
            brick.used = true;
            brick.type = 'normal';
            showRevealOverlay(brick.id);
        }
    });

    // Check flag
    if (player.x >= flag.x) {
        currentState = STATES.END_FLAG;
        setTimeout(() => { currentState = STATES.VALENTINE_SCREEN; }, 2000);
    }
}

// Render (using Canvas drawing instead of images)
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground (simple tiles)
    ctx.fillStyle = '#8B4513'; // Brown
    for (let i = 0; i < canvas.width / TILE_SIZE; i++) {
        ctx.fillRect(i * TILE_SIZE - camera.x % TILE_SIZE, canvas.height - TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Bricks
    bricks.forEach(brick => {
        ctx.fillStyle = brick.type === 'question' ? '#FFD700' : '#A0522D'; // Gold for question, brown for normal
        ctx.fillRect(brick.x - camera.x, brick.y - camera.y, brick.width, brick.height);
        if (brick.type === 'question') {
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            ctx.fillText('?', brick.x - camera.x + 12, brick.y - camera.y + 20);
        }
    });

    // Flag (pole and flag)
    ctx.fillStyle = '#654321'; // Brown pole
    ctx.fillRect(flag.x - camera.x, flag.y - camera.y, 4, flag.height);
    ctx.fillStyle = '#FF0000'; // Red flag
    ctx.fillRect(flag.x - camera.x + 4, flag.y - camera.y, flag.width - 4, 32);

    // Player (simple animated rectangle with legs)
    if (currentState === STATES.CH1_PLAY || currentState === STATES.CH3_PLAY) {
        drawCharacter(player.x - camera.x, player.y - camera.y, player.color, animationFrame);
    }

    // Player2
    if (player2.visible) {
        drawCharacter(player2.x - camera.x, player2.y - camera.y, player2.color, animationFrame);
    }

    // Car (simple rectangle)
    if (car.visible) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(car.x - camera.x, car.y - camera.y, car.width, car.height);
        ctx.fillStyle = '#FFFF00'; // Yellow windows
        ctx.fillRect(car.x - camera.x + 10, car.y - camera.y + 5, 20, 10);
    }

    // Plane (simple shape)
    if (plane.visible) {
        ctx.fillStyle = '#C0C0C0'; // Silver
        ctx.fillRect(plane.x - camera.x, plane.y - camera.y, plane.width, plane.height);
        ctx.fillStyle = '#0000FF'; // Blue tail
        ctx.fillRect(plane.x - camera.x + plane.width - 20, plane.y - camera.y + 10, 20, 20);
    }
}

// Helper function to draw animated character
function drawCharacter(x, y, color, frame) {
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 32, 32);
    // Head
    ctx.fillStyle = '#FFE4B5'; // Skin tone
    ctx.fillRect(x + 8, y - 8, 16, 16);
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 10, y - 6, 2, 2);
    ctx.fillRect(x + 20, y - 6, 2, 2);
    // Legs (animated)
    ctx.fillStyle = '#000';
    const legOffset = (frame % 20 < 10) ? 0 : 4; // Alternate legs
    ctx.fillRect(x + 6, y + 32, 6, 8);
    ctx.fillRect(x + 20 + legOffset, y + 32, 6, 8);
}

// Overlays (photos still use images or placeholder)
function showRevealOverlay(id) {
    const block = storyBlocks.find(b => b.id === id);
    const photoImg = document.getElementById('revealPhoto');
    photoImg.src = block.photo;
    photoImg.onerror = () => {
        // Drawn placeholder
        const canvasPlaceholder = document.createElement('canvas');
        canvasPlaceholder.width = 300;
        canvasPlaceholder.height = 300;
        const ctxPlaceholder = canvasPlaceholder.getContext('2d');
        ctxPlaceholder.fillStyle = '#CCC';
        ctxPlaceholder.fillRect(0, 0, 300, 300);
        ctxPlaceholder.fillStyle = '#666';
        ctxPlaceholder.font = '20px Arial';
        ctxPlaceholder.fillText('Photo Placeholder', 50, 150);
        photoImg.src = canvasPlaceholder.toDataURL();
    };
    document.getElementById('revealCaption').textContent = block.caption;
    document.getElementById('revealOverlay').classList.remove('hidden');
}

function hideRevealOverlay() {
    document.getElementById('revealOverlay').classList.add('hidden');
    if (currentState === STATES.CH1_PLAY && storyBlocks[2].id === 3) {
        currentState = STATES.CUTSCENE_JOIN;
        startCutsceneJoin();
    } else if (currentState === STATES.CH2_PLAY && storyBlocks[6].id === 7) {
        currentState = STATES.CUTSCENE_FLIGHT;
        startCutsceneFlight();
    }
}

// Cutscenes (unchanged)
function startCutsceneJoin() {
    document.getElementById('cutsceneText').textContent = "Then… you weren’t just in my story.\nYou became my home.";
    document.getElementById('cutsceneOverlay').classList.remove('hidden');
    setTimeout(() => {
        player2.x = player.x + 100;
        player2.visible = true;
        player.y -= 20; player2.y -= 20;
        setTimeout(() => { player.y += 20; player2.y += 20; }, 500);
        setTimeout(() => {
            car.x = player.x - 100;
            car.visible = true;
            setTimeout(() => {
                player.visible = false; player2.visible = false;
                currentState = STATES.CH2_PLAY;
                document.getElementById('cutsceneOverlay').classList.add('hidden');
            }, 2000);
        }, 1000);
    }, 2000);
}

function startCutsceneFlight() {
    document.getElementById('cutsceneText').textContent = "Then came the hardest part…\nI left for the U.S., and you stayed in India.";
    document.getElementById('cutsceneOverlay').classList.remove('hidden');
    setTimeout(() => {
        plane.x = canvas.width + 100;
        plane.y = 200;
        plane.visible = true;
        plane.vx = -5; plane.vy = -2;
        setTimeout(() => {
            plane.visible = false;
            document.getElementById('chapterTitle').classList.remove('hidden');
            document.getElementById('titleText').textContent = "Long Distance, Same Love";
            setTimeout(() => {
                document.getElementById('chapterTitle').classList.add('hidden');
                currentState = STATES.CH3_PLAY;
            }, 2000);
        }, 8000);
    }, 2000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initBricks();
    gameLoop();

    document.getElementById('startOverlay').addEventListener('click', () => {
        console.log('Game started');
        currentState = STATES.CH1_PLAY;
        document.getElementById('startOverlay').classList.add('hidden');
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        hideRevealOverlay();
    });

    document.getElementById('skipButton').addEventListener('click', () => {
        document.getElementById('cutsceneOverlay').classList.add('hidden');
        if (currentState === STATES.CUTSCENE_JOIN) {
            currentState = STATES.CH2_PLAY;
        } else if (currentState === STATES.CUTSCENE_FLIGHT) {
            currentState = STATES.CH3_PLAY;
            document.getElementById('chapterTitle').classList.add('hidden');
        }
    });

    document.querySelectorAll('.yesButton').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('valentineScreen').classList.add('hidden');
            document.getElementById('endMessage').classList.remove('hidden');
        });
    });

    canvas.addEventListener('click', () => {
        if ((currentState === STATES.CH1_PLAY || currentState === STATES.CH3_PLAY) && player.onGround) {
            player.vy = JUMP_FORCE;
            player.onGround = false;
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && (currentState === STATES.CH1_PLAY || currentState === STATES.CH3_PLAY) && player.onGround) {
            e.preventDefault();
            player.vy = JUMP_FORCE;
            player.onGround = false;
        }
    });
});
