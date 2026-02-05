// Mario-Style Love Journey Game
// Instructions: Replace photo files and captions in the storyBlocks array below.
// Ensure assets are in /sprites/, /photos/, /audio/ folders.
// Photos: If they fail to load, a placeholder frame shows with the caption.

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

// Entities
let player = { x: 50, y: 300, vx: 0, vy: 0, width: 32, height: 32, sprite: 'girl_idle.png', onGround: false };
let player2 = { x: 0, y: 300, width: 32, height: 32, sprite: 'boy_idle.png', visible: false };
let car = { x: 0, y: 300, width: 64, height: 32, sprite: 'car_black.png', visible: false };
let plane = { x: 0, y: 0, width: 128, height: 64, sprite: 'plane.png', visible: false, vx: 0, vy: 0 };
let bricks = [];
let flag = { x: 3200, y: 200, width: 32, height: 128, sprite: 'flag.png' };
let camera = { x: 0, y: 0 };

// Load assets (placeholders)
let images = {};
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}
function preloadAssets() {
    images.girl_idle = loadImage('sprites/girl_idle.png');
    images.girl_walk = loadImage('sprites/girl_walk.png');
    images.boy_idle = loadImage('sprites/boy_idle.png');
    images.boy_walk = loadImage('sprites/boy_walk.png');
    images.car_black = loadImage('sprites/car_black.png');
    images.plane = loadImage('sprites/plane.png');
    images.brick = loadImage('sprites/brick.png');
    images.question_brick = loadImage('sprites/question_brick.png');
    images.flag = loadImage('sprites/flag.png');
    images.ground_tiles = loadImage('sprites/ground_tiles.png');
    // Load photos
    storyBlocks.forEach(block => {
        images[`photo${block.id}`] = loadImage(block.photo);
    });
}

// Initialize bricks
function initBricks() {
    storyBlocks.forEach(block => {
        bricks.push({ x: block.x, y: 200, width: 32, height: 32, type: 'question', id: block.id, used: false });
    });
}

// Game loop
function gameLoop() {
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
            // Play bump sound (optional)
            // new Audio('audio/bump.wav').play();
            showRevealOverlay(brick.id);
        }
    });

    // Check flag
    if (player.x >= flag.x) {
        currentState = STATES.END_FLAG;
        // Play level end sound (optional)
        // new Audio('audio/level_end.wav').play();
        setTimeout(() => { currentState = STATES.VALENTINE_SCREEN; }, 2000);
    }
}

// Render
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    for (let i = 0; i < canvas.width / TILE_SIZE; i++) {
        ctx.drawImage(images.ground_tiles, i * TILE_SIZE - camera.x % TILE_SIZE, canvas.height - TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Bricks
    bricks.forEach(brick => {
        const img = brick.type === 'question' ? images.question_brick : images.brick;
        ctx.drawImage(img, brick.x - camera.x, brick.y - camera.y, brick.width, brick.height);
    });

    // Flag
    ctx.drawImage(images.flag, flag.x - camera.x, flag.y - camera.y, flag.width, flag.height);

    // Player
    if (currentState === STATES.CH1_PLAY || currentState === STATES.CH3_PLAY) {
        ctx.drawImage(images[player.sprite], player.x - camera.x, player.y - camera.y, player.width, player.height);
    }

    // Player2
    if (player2.visible) {
        ctx.drawImage(images[player2.sprite], player2.x - camera.x, player2.y - camera.y, player2.width, player2.height);
    }

    // Car
    if (car.visible) {
        ctx.drawImage(images[car.sprite], car.x - camera.x, car.y - camera.y, car.width, car.height);
    }

    // Plane
    if (plane.visible) {
        ctx.drawImage(images[plane.sprite], plane.x - camera.x, plane.y - camera.y, plane.width, plane.height);
    }
}

// Overlays
function showRevealOverlay(id) {
    const block = storyBlocks.find(b => b.id === id);
    const photoImg = document.getElementById('revealPhoto');
    photoImg.src = block.photo;
    photoImg.onerror = () => { photoImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QaG90byBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4='; };
    document.getElementById('revealCaption').textContent = block.caption;
    document.getElementById('revealOverlay').classList.remove('hidden');
    // Play reveal sound (optional)
    // new Audio('audio/reveal.wav').play();
}

function hideRevealOverlay() {
    document.getElementById('revealOverlay').classList.add('hidden');
    if (currentState === STATES.CH1_PLAY && storyBlocks[2].id === 3) { // After brick 3
        currentState = STATES.CUTSCENE_JOIN;
        startCutsceneJoin();
    } else if (currentState === STATES.CH2_PLAY && storyBlocks[6].id === 7) { // After brick 7
        currentState = STATES.CUTSCENE_FLIGHT;
        startCutsceneFlight();
    }
}

// Cutscenes
function startCutsceneJoin() {
    document.getElementById('cutsceneText').textContent = "Then… you weren’t just in my story.\nYou became my home.";
    document.getElementById('cutsceneOverlay').classList.remove('hidden');
    setTimeout(() => {
        player2.x = player.x + 100;
        player2.visible = true;
        // Simple hop animation
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
    // Airport BG (optional: draw or overlay)
    setTimeout(() => {
        plane.x = canvas.width + 100;
        plane.y = 200;
        plane.visible = true;
        plane.vx = -5; plane.vy = -2; // Takeoff
        // Play takeoff sound (optional)
        // new Audio('audio/takeoff.wav').play();
        setTimeout(() => {
            plane.visible = false;
            document.getElementById('chapterTitle').classList.remove('hidden');
            document.getElementById('titleText').textContent = "Long Distance, Same Love";
            setTimeout
