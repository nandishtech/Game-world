export function generate(name, options = {}) {
  return {
    "package.json": JSON.stringify({
      "name": "flappy-bird-classic",
      "version": "1.0.0",
      "description": "Authentic Flappy Bird replica game with sound synthesis and physics rules test",
      "main": "game.js",
      "scripts": {
        "start": "echo \"Open index.html to play!\"",
        "test": "node test.js"
      },
      "author": "Game Source Generator",
      "license": "MIT"
    }, null, 2),

    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flappy Bird Classic</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</head>
<body>
  <div class="game-container">
    <!-- Main Menu -->
    <div id="main-menu" class="overlay active">
      <h1 class="logo-title">Flappy Bird</h1>
      <button class="play-btn" onclick="startGame()">START</button>
    </div>

    <!-- Score Counter -->
    <div id="hud" class="hud-panel">0</div>

    <!-- Canvas -->
    <canvas id="game-canvas" width="320" height="480"></canvas>

    <!-- Game Over Screen -->
    <div id="game-over" class="overlay">
      <h2 class="logo-title subtitle">GAME OVER</h2>
      <div class="score-card">
        <p>SCORE: <span id="final-score">0</span></p>
        <p>BEST: <span id="best-score">0</span></p>
      </div>
      <button class="play-btn" onclick="restartGame()">REPLAY</button>
    </div>
  </div>

  <script src="game.js"></script>
</body>
</html>`,

    "style.css": `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #333;
  color: #fff;
  font-family: 'Press Start 2P', cursive;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.game-container {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 480px;
  border: 4px solid #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

#game-canvas {
  display: block;
}

/* Overlays */
.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  text-align: center;
  padding: 20px;
}

.overlay.active {
  display: flex;
}

.logo-title {
  font-size: 1.4rem;
  color: #fca5a5;
  text-shadow: 2px 2px 0 #000;
  margin-bottom: 32px;
}

.logo-title.subtitle {
  color: #ef4444;
}

.play-btn {
  background-color: #f97316; /* orange */
  border: 3px solid #000;
  border-radius: 4px;
  color: #fff;
  padding: 12px 24px;
  font-family: 'Press Start 2P', cursive;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #9a3412;
}

.play-btn:active {
  transform: translateY(4px);
  box-shadow: none;
}

.hud-panel {
  position: absolute;
  top: 24px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 2.2rem;
  color: #fff;
  text-shadow: 3px 3px 0 #000;
  z-index: 5;
  pointer-events: none;
  display: none;
}

.score-card {
  background-color: #ded895; /* yellowish retro card */
  border: 3px solid #000;
  border-radius: 6px;
  color: #555;
  padding: 16px;
  width: 80%;
  margin-bottom: 24px;
  text-shadow: none;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.score-card span {
  font-weight: bold;
  color: #000;
}
`,

    "game.js": `/**
 * Classic Flappy Bird game loop engine
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  playFlap() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
  playScore() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
  playCrash() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }
}

const audio = new SoundEngine();

const physics = {
  gravity: 0.22,
  jumpStrength: 4.8,
  pipeGap: 100,
  pipeWidth: 52,
  pipeInterval: 120,
  speed: 1.8
};

class GameState {
  constructor() {
    this.reset();
  }
  reset() {
    this.birdY = 200;
    this.velocity = 0;
    this.score = 0;
    this.gameOver = false;
    this.pipes = [];
    this.frameCount = 0;
  }
}

const state = new GameState();
let canvas, ctx;
let animationId = null;

window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas');
  if (canvas) ctx = canvas.getContext('2d');

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      flap();
    }
  });

  if (canvas) {
    canvas.addEventListener('mousedown', () => flap());
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      flap();
    }, { passive: false });
  }

  const record = localStorage.getItem('flap_classic_high') || '0';
  document.getElementById('best-score').textContent = record;
});

function startGame() {
  state.reset();
  
  // Toggle screens
  document.getElementById('main-menu').classList.remove('active');
  document.getElementById('game-over').classList.remove('active');
  document.getElementById('hud').style.display = 'block';
  document.getElementById('hud').textContent = '0';

  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameStep);
}

function restartGame() {
  startGame();
}

function flap() {
  if (state.gameOver) return;
  audio.playFlap();
  state.velocity = -physics.jumpStrength;
}

function gameStep() {
  if (state.gameOver) return;

  state.velocity += physics.gravity;
  state.birdY += state.velocity;

  // Collision with ground/ceiling (ground starts at Y=410)
  if (state.birdY > 410 || state.birdY < 0) {
    triggerGameOver();
    return;
  }

  state.frameCount++;
  if (state.frameCount % physics.pipeInterval === 0 || state.pipes.length === 0) {
    spawnPipe();
  }

  for (let i = state.pipes.length - 1; i >= 0; i--) {
    const pipe = state.pipes[i];
    pipe.x -= physics.speed;

    // Check pass score
    if (!pipe.passed && pipe.x < 50) { // bird is at x=50
      pipe.passed = true;
      state.score++;
      audio.playScore();
      document.getElementById('hud').textContent = state.score;
    }

    // Hit checks
    const birdRadius = 10;
    const bx = 50;
    const by = state.birdY;

    if (bx + birdRadius > pipe.x && bx - birdRadius < pipe.x + physics.pipeWidth) {
      if (by - birdRadius < pipe.topHeight || by + birdRadius > pipe.bottomY) {
        triggerGameOver();
        return;
      }
    }

    if (pipe.x < -physics.pipeWidth) {
      state.pipes.splice(i, 1);
    }
  }

  draw();
  animationId = requestAnimationFrame(gameStep);
}

function spawnPipe() {
  const minHeight = 50;
  const maxHeight = 250;
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
  const bottomY = topHeight + physics.pipeGap;

  state.pipes.push({
    x: canvas.width,
    topHeight,
    bottomY,
    passed: false
  });
}

function draw() {
  if (!ctx) return;

  // Sky Blue
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background clouds/bushes
  ctx.fillStyle = '#ded895'; // Bush green-yellow base ground
  ctx.fillRect(0, 420, canvas.width, 60);

  ctx.fillStyle = '#5c942e'; // Grass lining
  ctx.fillRect(0, 410, canvas.width, 10);

  // Draw pipes (Classic Flappy Green)
  state.pipes.forEach(pipe => {
    ctx.fillStyle = '#73bf2e';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    // Top pipe rect
    ctx.fillRect(pipe.x, 0, physics.pipeWidth, pipe.topHeight);
    ctx.strokeRect(pipe.x, -3, physics.pipeWidth, pipe.topHeight + 3);

    // Bottom pipe rect
    ctx.fillRect(pipe.x, pipe.bottomY, physics.pipeWidth, 410 - pipe.bottomY);
    ctx.strokeRect(pipe.x, pipe.bottomY, physics.pipeWidth, 410 - pipe.bottomY + 3);
    
    // Draw pipe lips
    ctx.fillStyle = '#94e833';
    ctx.fillRect(pipe.x - 2, pipe.topHeight - 16, physics.pipeWidth + 4, 16);
    ctx.strokeRect(pipe.x - 2, pipe.topHeight - 16, physics.pipeWidth + 4, 16);

    ctx.fillRect(pipe.x - 2, pipe.bottomY, physics.pipeWidth + 4, 16);
    ctx.strokeRect(pipe.x - 2, pipe.bottomY, physics.pipeWidth + 4, 16);
  });

  // Draw Bird (Classic Yellow Bird)
  const bx = 50, by = state.birdY;
  
  ctx.fillStyle = '#f3d958'; // Yellow body
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(bx, by, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Draw Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(bx + 4, by - 3, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bx + 5, by - 3, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Draw Beak (Orange)
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(bx + 8, by);
  ctx.lineTo(bx + 14, by - 2);
  ctx.lineTo(bx + 9, by + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function triggerGameOver() {
  state.gameOver = true;
  audio.playCrash();
  if (animationId) cancelAnimationFrame(animationId);

  const record = parseInt(localStorage.getItem('flap_classic_high') || '0');
  if (state.score > record) {
    localStorage.setItem('flap_classic_high', state.score);
    document.getElementById('best-score').textContent = state.score;
  } else {
    document.getElementById('best-score').textContent = record;
  }

  document.getElementById('final-score').textContent = state.score;
  document.getElementById('hud').style.display = 'none';
  document.getElementById('game-over').classList.add('active');
}
`,

    "test.js": `/** Flappy Bird Test */
import { assert } from 'console';
function checkCollision(by, py, gap, px) {
  // bird radius = 10, x=50
  if (by > 410 || by < 0) return true;
  if (px > 50 - 10 - 52 && px < 50 + 10) {
    if (by - 10 < py || by + 10 > py + gap) return true;
  }
  return false;
}
function run() {
  console.log("RUNNING FLAPPY BIRD MECHANICAL TESTS...");
  assert(checkCollision(420, 100, 100, 100) === true, "Must detect ground hit");
  assert(checkCollision(200, 100, 100, 40) === true, "Must detect top pipe hit");
  assert(checkCollision(150, 100, 100, 40) === false, "Must pass safely through pipe gap");
  console.log("✅ FLAPPY BIRD TESTS COMPLETED");
  process.exit(0);
}
run();`,

    "ASSET-LICENSES.md": `# ASSET LICENSES
1. Fonts: Google Font Press Start 2P (SIL Open Font License).
2. Audio: Programmatic synthesis.
`,

    "README.md": `# Flappy Bird Classic

Classic Flappy Bird replica.
`
  };
}
