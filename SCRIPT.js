const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    width: 50,
    height: 20,
    x: canvas.width / 2 - 25,
    y: canvas.height - 40,
    speed: 5,
    color: "white",
    dx: 0
};

const bullets = [];
const enemies = [];
let enemySpeed = 1;
let score = 0;
let lives = 5;
let gameRunning = false;

const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const scoreDisplay = document.getElementById("scoreDisplay");

// Event Listeners for player movement
document.addEventListener("keydown", movePlayer);
document.addEventListener("keyup", stopPlayer);

function movePlayer(e) {
    if (e.key === "ArrowLeft") {
        player.dx = -player.speed;
    } else if (e.key === "ArrowRight") {
        player.dx = player.speed;
    } else if (e.key === " " && gameRunning) {
        shoot();
    }
}

function stopPlayer(e) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        player.dx = 0;
    }
}

// Update player position
function updatePlayer() {
    player.x += player.dx;

    // Boundaries
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Bullet object and shooting
function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 7,
        color: "yellow"
    });
}

// Update and draw bullets
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;

        // Remove bullet if off the screen
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function drawBullets() {
    bullets.forEach((bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Enemy generation
function createEnemy() {
    const size = 30;
    const x = Math.random() * (canvas.width - size);
    enemies.push({
        x: x,
        y: 0,
        width: size,
        height: size,
        speed: enemySpeed,
        color: "red"
    });
}

// Update and draw enemies
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        // Check if enemy goes off screen (missed)
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            lives--; // Lose a life
            updateScoreAndLives();

            // End game if lives run out
            if (lives <= 0) {
                gameOver();
            }
        }
    });
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Collision detection
function detectCollision() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Remove enemy and bullet on collision
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                score++; // Increase score
                updateScoreAndLives();
            }
        });
    });
}

// Update score and lives on the screen
function updateScoreAndLives() {
    scoreDisplay.textContent = `Score: ${score} | Lives Left: ${lives}`;
}

// When the game ends
function gameOver() {
    gameRunning = false;
    stopEnemySpawn();
    gameOverSection.style.display = "block"; // Show input for player name
}

// Submit score function
function submitScore() {
    playerName = playerNameInput.value.trim();
    if (playerName !== "") {
        players.push({ name: playerName, score: score });
        displayScoreboard();
        resetGame();
    } else {
        alert("Please enter a name!");
    }
}

// Display scoreboard
function displayScoreboard() {
    scoreboard.innerHTML = "<h3>Player Scores:</h3>";
    players.forEach(player => {
        const playerDiv = document.createElement("div");
        playerDiv.textContent = `${player.name}: ${player.score}`;
        scoreboard.appendChild(playerDiv);
    });
}


// Game loop
function update() {
    if (!gameRunning) return; // Stop updating if game over

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateBullets();
    updateEnemies();
    detectCollision();
    
    drawPlayer();
    drawBullets();
    drawEnemies();
}

// Generate enemies every 2 seconds
let enemyInterval;
function startEnemySpawn() {
    enemyInterval = setInterval(createEnemy, 2000);
}

// Stop enemy generation
function stopEnemySpawn() {
    clearInterval(enemyInterval);
}

// Update game at 60 FPS
function gameLoop() {
    update();
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Start button logic
startButton.addEventListener("click", function () {
    startButton.style.display = "none"; // Hide start button
    gameRunning = true;
    score = 0;
    lives = 5;
    updateScoreAndLives();
    startEnemySpawn(); // Start generating enemies
    gameLoop();
});

// Reset button logic
resetButton.addEventListener("click", function () {
    resetButton.style.display = "none"; // Hide reset button
    enemies.length = 0; // Clear enemies
    bullets.length = 0; // Clear bullets
    gameRunning = true;
    score = 0;
    lives = 5;
    updateScoreAndLives();
    startEnemySpawn(); // Restart enemy generation
    gameLoop();
});
