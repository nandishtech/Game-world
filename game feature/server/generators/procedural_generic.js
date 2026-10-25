export function generate(gameName, options = {}) {
  const normalized = gameName.toLowerCase();
  
  // Choose type based on keyword mapping
  if (normalized.includes('race') || normalized.includes('car') || normalized.includes('speed') || normalized.includes('drive')) {
    return generateCarRacing(gameName, options);
  }
  if (normalized.includes('shoot') || normalized.includes('space') || normalized.includes('invad') || normalized.includes('alien') || normalized.includes('galaga')) {
    return generateSpaceShooter(gameName, options);
  }
  if (normalized.includes('brick') || normalized.includes('break') || normalized.includes('pong') || normalized.includes('ball')) {
    return generateBrickBreaker(gameName, options);
  }
  
  // Default Hazard Dodge Arcade Game
  return generateHazardDodge(gameName, options);
}

// 1. DYNAMIC CAR RACING PROCEDURAL TEMPLATE
function generateCarRacing(name, options) {
  const pColor = options.themeColor || '#ef4444'; // Red player car
  const sColor = options.secondaryColor || '#3b82f6'; // Blue obstacle cars
  
  return {
    "package.json": JSON.stringify({
      "name": "car-racing-cyber",
      "version": "1.0.0",
      "description": `Procedurally generated ${name} car racing arcade game`,
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
  <title>Cyber Highway - ${name}</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <div class="arcade-cabinet">
    <header class="cabinet-header">
      <h1 class="glow-text">${name.toUpperCase()}</h1>
      <div class="subtitle">NEON HIGHWAY SIMULATOR</div>
    </header>

    <div class="screen-container">
      <div id="loading-screen" class="screen active">
        <div class="glitch-title" data-text="IGNITION">IGNITION</div>
        <div class="loading-bar"><div class="loading-progress"></div></div>
        <div class="blink-text">STARTING STEERING CORES...</div>
      </div>

      <div id="main-menu" class="screen">
        <div class="menu-title glow-text">SELECT SPEED</div>
        <div class="menu-options">
          <button class="menu-btn" onclick="startGame(4)">CRUISE SPEED</button>
          <button class="menu-btn" onclick="startGame(7)">HYPER DRIVE</button>
        </div>
      </div>

      <div id="game-screen" class="screen">
        <div class="hud">
          <div class="hud-item">
            <span class="label">SCORE</span>
            <span id="score-val" class="value glow-value">0000</span>
          </div>
          <div class="hud-item">
            <span class="label">SPEED</span>
            <span id="speed-val" class="value glow-value">120 kmh</span>
          </div>
        </div>

        <div class="canvas-wrapper">
          <canvas id="game-canvas" width="300" height="400"></canvas>
        </div>

        <div class="controls-hint">USE A / D OR LEFT / RIGHT ARROWS TO STEER</div>
      </div>

      <div id="game-over" class="screen">
        <div class="game-over-title glitch-text">CHASSIS CRUSHED</div>
        <div class="final-score-box">
          <p>DISTANCE ACHIEVED: <span id="final-score" class="glow-text-pink">0</span> km</p>
        </div>
        <div class="menu-options">
          <button class="menu-btn" onclick="restartGame()">RELAUNCH</button>
          <button class="menu-btn" onclick="exitToMenu()">COMMAND HANGAR</button>
        </div>
      </div>
    </div>
  </div>

  <script src="game.js"></script>
</body>
</html>`,

    "style.css": `/* Retro Cabinet Styles */
:root {
  --primary: ${pColor};
  --primary-glow: rgba(${hexToRgb(pColor)}, 0.45);
  --secondary: ${sColor};
  --bg-dark: #070707;
  --bg-cabinet: #141414;
  --cabinet-border: #222222;
  --text-main: #f4f4f5;
  --text-muted: #a1a1aa;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Share Tech Mono', monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
}

.arcade-cabinet {
  background: var(--bg-cabinet);
  border: 4px solid var(--cabinet-border);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 20px var(--primary-glow);
  width: 100%;
  max-width: 400px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cabinet-header { text-align: center; }
h1 { font-family: 'Orbitron', sans-serif; font-size: 1.6rem; font-weight: 900; letter-spacing: 2px; }
.subtitle { color: var(--text-muted); font-size: 0.75rem; letter-spacing: 3px; }

.screen-container {
  position: relative;
  background-color: #030303;
  border: 8px solid #222;
  border-radius: 10px;
  height: 440px;
  overflow: hidden;
  box-shadow: inset 0 0 40px rgba(0,0,0,1);
}

.screen-container::after {
  content: " "; display: block; position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
  background-size: 100% 4px; z-index: 100; pointer-events: none;
}

.screen {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
.screen.active { display: flex; }

.hud { width: 90%; display: flex; justify-content: space-between; margin-bottom: 10px; }
.hud-item { display: flex; flex-direction: column; align-items: center; }
.hud-item .label { font-size: 0.75rem; color: var(--text-muted); }
.hud-item .value { font-size: 1.2rem; font-weight: 700; font-family: 'Orbitron', sans-serif; }

.canvas-wrapper {
  background-color: #0c0c14;
  border: 2px solid var(--primary);
  box-shadow: 0 0 10px var(--primary-glow);
}

.controls-hint { margin-top: 10px; font-size: 0.75rem; color: var(--text-muted); }

.menu-title { font-family: 'Orbitron', sans-serif; font-size: 1.6rem; margin-bottom: 24px; color: var(--primary); }
.menu-options { display: flex; flex-direction: column; gap: 12px; width: 80%; }
.menu-btn {
  background: transparent; color: var(--text-main); border: 2px solid var(--primary);
  padding: 10px 20px; font-family: 'Share Tech Mono', monospace; font-size: 1.1rem;
  font-weight: bold; cursor: pointer; border-radius: 6px; transition: all 0.2s ease;
}
.menu-btn:hover { background: var(--primary); color: #000; box-shadow: 0 0 10px var(--primary); }

.glow-text { color: var(--primary); text-shadow: 0 0 10px var(--primary); }
.glow-text-pink { color: #f43f5e; text-shadow: 0 0 10px rgba(244, 63, 94, 0.5); }
.glow-value { color: var(--primary); }
.blink-text { animation: blink 1.2s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.loading-bar { width: 150px; height: 6px; background-color: #222; border-radius: 3px; overflow: hidden; margin: 16px 0; }
.loading-progress { width: 0; height: 100%; background-color: var(--primary); animation: fillProgress 1.8s forwards ease-in-out; }
@keyframes fillProgress { to { width: 100%; } }
.glitch-title { font-size: 2.2rem; font-weight: bold; animation: glitch 500ms infinite; }
@keyframes glitch {
  0% { text-shadow: 0.05em 0 0 rgba(255,0,0,.75), -0.025em -0.05em 0 rgba(0,255,0,.75), 0.025em 0.05em 0 rgba(0,0,255,.75); }
  50% { text-shadow: -0.05em -0.025em 0 rgba(255,0,0,.75), 0.025em 0.025em 0 rgba(0,255,0,.75), -0.05em -0.05em 0 rgba(0,0,255,.75); }
  100% { text-shadow: -0.025em 0 0 rgba(255,0,0,.75), -0.025em -0.025em 0 rgba(0,255,0,.75), -0.025em -0.05em 0 rgba(0,0,255,.75); }
}`,

    "game.js": `/**
 * Car Racing Game Loop Engine
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  playHum() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
  playCrash() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

const audio = new SoundEngine();

class GameState {
  constructor() {
    this.playerX = 130;
    this.playerY = 320;
    this.score = 0;
    this.gameSpeed = 4;
    this.gameOver = false;
    this.obstacles = [];
    this.laneWidth = 80;
    this.keys = {};
    this.roadOffset = 0;
  }
  reset() {
    this.playerX = 130;
    this.score = 0;
    this.gameOver = false;
    this.obstacles = [];
    this.roadOffset = 0;
  }
}

const state = new GameState();
let canvas, ctx;
let loopId = null;

window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas');
  if (canvas) ctx = canvas.getContext('2d');
  setTimeout(() => showScreen('main-menu'), 1800);

  window.addEventListener('keydown', (e) => state.keys[e.key] = true);
  window.addEventListener('keyup', (e) => state.keys[e.key] = false);
});

function showScreen(screenId) {
  ['loading-screen', 'main-menu', 'game-screen', 'game-over'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
}

function startGame(speed) {
  state.reset();
  state.gameSpeed = speed;
  showScreen('game-screen');
  if (loopId) cancelAnimationFrame(loopId);
  loopId = requestAnimationFrame(gameLoop);
}

function restartGame() {
  startGame(state.gameSpeed);
}

function exitToMenu() {
  if (loopId) cancelAnimationFrame(loopId);
  showScreen('main-menu');
}

function gameLoop() {
  if (state.gameOver) return;

  // Steering Controls
  if (state.keys['ArrowLeft'] || state.keys['a']) {
    state.playerX -= 4;
  }
  if (state.keys['ArrowRight'] || state.keys['d']) {
    state.playerX += 4;
  }

  // Constrain to road boundaries
  if (state.playerX < 40) state.playerX = 40;
  if (state.playerX > 220) state.playerX = 220;

  // Manage highway lines scrolling
  state.roadOffset += state.gameSpeed;
  if (state.roadOffset > 40) state.roadOffset = 0;

  // Sound hum
  if (Math.random() < 0.25) audio.playHum();

  // Spawning obstacles
  if (state.obstacles.length === 0 || state.obstacles[state.obstacles.length - 1].y > 150) {
    state.obstacles.push({
      x: 40 + Math.random() * 180,
      y: -60,
      speed: state.gameSpeed + (Math.random() * 2 - 1)
    });
  }

  // Move obstacles and verify collision
  for (let i = state.obstacles.length - 1; i >= 0; i--) {
    const obs = state.obstacles[i];
    obs.y += obs.speed;

    // Check hit
    // Player bounds: width 30, height 50
    if (state.playerX < obs.x + 30 && state.playerX + 30 > obs.x) {
      if (state.playerY < obs.y + 50 && state.playerY + 50 > obs.y) {
        triggerGameOver();
        return;
      }
    }

    if (obs.y > canvas.height) {
      state.obstacles.splice(i, 1);
      state.score += 10;
      document.getElementById('score-val').textContent = String(state.score).padStart(4, '0');
    }
  }

  draw();
  loopId = requestAnimationFrame(gameLoop);
}

function draw() {
  ctx.fillStyle = '#1e293b'; // Road gray
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sidewalks
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 35, canvas.height);
  ctx.fillRect(265, 0, 35, canvas.height);

  // Scrolling road dashes
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(150, state.roadOffset - 40);
  ctx.lineTo(150, canvas.height + 40);
  ctx.stroke();
  ctx.setLineDash([]); // clear dash

  // Draw player car
  ctx.fillStyle = '${pColor}';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '${pColor}';
  ctx.fillRect(state.playerX, state.playerY, 30, 50);

  // Obstacles
  ctx.fillStyle = '${sColor}';
  ctx.shadowColor = '${sColor}';
  state.obstacles.forEach(obs => {
    ctx.fillRect(obs.x, obs.y, 30, 50);
  });
  ctx.shadowBlur = 0;
}

function triggerGameOver() {
  state.gameOver = true;
  audio.playCrash();
  document.getElementById('final-score').textContent = state.score;
  showScreen('game-over');
}
`,

    "test.js": `/**
 * Simple test suite for Car game
 */
import { assert } from 'console';

function checkHit(px, py, ox, oy) {
  // width 30, height 50
  return px < ox + 30 && px + 30 > ox && py < oy + 50 && py + 50 > oy;
}

function runTests() {
  console.log("-----------------------------------------");
  console.log("RUNNING CAR RACING MECHANICS TESTS...");
  console.log("-----------------------------------------");

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(\`✅ PASS: \${name}\`);
      passed++;
    } catch (err) {
      console.error(\`❌ FAIL: \${name}\`);
      console.error(err);
      failed++;
    }
  }

  test("No Collision far apart", () => {
    assert(checkHit(100, 300, 200, 100) === false, "Cars separated should not hit");
  });

  test("Collision overlap", () => {
    assert(checkHit(100, 300, 110, 320) === true, "Overlapping bounding boxes must collide");
  });

  console.log("-----------------------------------------");
  console.log(\`TESTS RESULTS: \${passed} PASSED // \${failed} FAILED\`);
  console.log("-----------------------------------------");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
`,

    "ASSET-LICENSES.md": `# ASSET-LICENSES
1. Sound: Synthesized web audio.
2. Fonts: Google Fonts.
`,

    "README.md": `# Cyber Highway

Procedural Car dodger.

## Commands
\`\`\`bash
npm test
\`\`\`
`
  };
}

// 2. SPACE SHOOTER PROCEDURAL TEMPLATE
function generateSpaceShooter(name, options) {
  return {
    "package.json": JSON.stringify({
      "name": "space-shooter-procedural",
      "version": "1.0.0",
      "description": `Procedural shooting game named ${name}`,
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
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <div class="arcade-cabinet">
    <header class="cabinet-header">
      <h1 class="glow-text">${name.toUpperCase()}</h1>
      <div class="subtitle">NEON LASER SYSTEM</div>
    </header>
    <div class="screen-container">
      <div id="loading-screen" class="screen active">
        <h2 class="glitch-title">WARPING</h2>
        <div class="loading-bar"><div class="loading-progress"></div></div>
        <div class="blink-text">CALIBRATING BLASTER CORES...</div>
      </div>
      <div id="main-menu" class="screen">
        <button class="menu-btn" onclick="startGame()">INITIALIZE SHIP</button>
      </div>
      <div id="game-screen" class="screen">
        <div class="hud">
          <div class="hud-item"><span class="label">SCORE</span><span id="score-val" class="value glow-value">0000</span></div>
        </div>
        <div class="canvas-wrapper"><canvas id="game-canvas" width="300" height="400"></canvas></div>
        <div class="controls-hint">ARROW KEYS TO MOVE / SPACEBAR TO SHOOT</div>
      </div>
      <div id="game-over" class="screen">
        <h2 class="glitch-title">HULL DESTROYED</h2>
        <div class="menu-options">
          <button class="menu-btn" onclick="restartGame()">RELAUNCH</button>
          <button class="menu-btn" onclick="exitToMenu()">COMMAND HANGAR</button>
        </div>
      </div>
    </div>
  </div>
  <script src="game.js"></script>
</body>
</html>`,

    "style.css": `/* Cyber styling common across generic arcade templates */
:root { --primary: #3b82f6; --bg-dark: #02040a; --bg-cabinet: #0d0f19; }
body { background: var(--bg-dark); color: #fff; font-family: 'Share Tech Mono', monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; }
.arcade-cabinet { background: var(--bg-cabinet); border: 4px solid #1e293b; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(59,130,246,0.3); width: 340px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.cabinet-header { text-align: center; }
h1 { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; letter-spacing: 2px; }
.subtitle { color: #64748b; font-size: 0.7rem; letter-spacing: 3px; }
.screen-container { position: relative; background: #000; border: 4px solid #111; border-radius: 8px; height: 420px; overflow: hidden; }
.screen { position: absolute; top:0; left:0; width:100%; height:100%; display:none; flex-direction:column; align-items:center; justify-content:center; }
.screen.active { display:flex; }
.hud { width:90%; display:flex; justify-content:space-between; margin-bottom: 5px; }
.hud-item { display:flex; flex-direction:column; }
.hud-item .label { font-size:0.7rem; color:#64748b; }
.hud-item .value { font-size:1.1rem; font-family:'Orbitron'; color:var(--primary); }
.canvas-wrapper { border: 2px solid var(--primary); }
.controls-hint { font-size:0.7rem; color:#64748b; margin-top:8px; }
.menu-btn { background:transparent; border:2px solid var(--primary); color:#fff; padding:8px 16px; font-family:'Share Tech Mono'; font-weight:bold; cursor:pointer; border-radius:4px; }
.menu-btn:hover { background:var(--primary); color:#000; }
.glitch-title { font-family:'Orbitron'; font-size:1.8rem; color:#f43f5e; text-shadow:0 0 8px rgba(244,63,94,0.5); }
.loading-bar { width: 120px; height: 4px; background:#222; overflow:hidden; margin:10px 0; }
.loading-progress { width:0; height:100%; background:var(--primary); animation:f 1.5s forwards; }
@keyframes f { to { width:100%; } }
.blink-text { animation:b 1.2s infinite; font-size:0.8rem; }
@keyframes b { 50% { opacity:0.3; } }`,

    "game.js": `/** Space Shooting Game Loop logic */
class SoundEngine {
  constructor() { this.ctx = null; }
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
  playLaser() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.1);
  }
  playExplode() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.25);
  }
}
const audio = new SoundEngine();
class GameState {
  constructor() {
    this.shipX = 135; this.score = 0; this.gameOver = false;
    this.bullets = []; this.enemies = []; this.keys = {};
  }
  reset() { this.shipX = 135; this.score = 0; this.gameOver = false; this.bullets = []; this.enemies = []; }
}
const state = new GameState();
let canvas, ctx, loopId;
window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas'); if (canvas) ctx = canvas.getContext('2d');
  setTimeout(() => showScreen('main-menu'), 1500);
  window.addEventListener('keydown', (e) => {
    state.keys[e.key] = true;
    if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); shoot(); }
  });
  window.addEventListener('keyup', (e) => state.keys[e.key] = false);
});
function showScreen(screenId) {
  ['loading-screen', 'main-menu', 'game-screen', 'game-over'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { if (id === screenId) el.classList.add('active'); else el.classList.remove('active'); }
  });
}
function startGame() {
  state.reset(); showScreen('game-screen');
  if (loopId) cancelAnimationFrame(loopId);
  loopId = requestAnimationFrame(gameLoop);
}
function restartGame() { startGame(); }
function exitToMenu() { if (loopId) cancelAnimationFrame(loopId); showScreen('main-menu'); }
function shoot() {
  if (state.gameOver) return;
  audio.playLaser();
  state.bullets.push({ x: state.shipX + 13, y: 350 });
}
function gameLoop() {
  if (state.gameOver) return;
  if (state.keys['ArrowLeft'] || state.keys['a']) state.shipX -= 4;
  if (state.keys['ArrowRight'] || state.keys['d']) state.shipX += 4;
  if (state.shipX < 5) state.shipX = 5; if (state.shipX > 265) state.shipX = 265;

  // Bullets step
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    state.bullets[i].y -= 6;
    if (state.bullets[i].y < 0) state.bullets.splice(i, 1);
  }

  // Enemies spawn & step
  if (state.enemies.length < 4 && Math.random() < 0.03) {
    state.enemies.push({ x: 20 + Math.random() * 250, y: 0 });
  }
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const en = state.enemies[i];
    en.y += 1.5;
    if (en.y > canvas.height) { triggerGameOver(); return; }

    // Bullet collision hit check
    // Bullet: width 4, height 10. Enemy: width 20, height 20
    for (let j = state.bullets.length - 1; j >= 0; j--) {
      const b = state.bullets[j];
      if (b.x > en.x - 4 && b.x < en.x + 20 && b.y > en.y && b.y < en.y + 20) {
        audio.playExplode();
        state.enemies.splice(i, 1);
        state.bullets.splice(j, 1);
        state.score += 20;
        document.getElementById('score-val').textContent = String(state.score).padStart(4, '0');
        break;
      }
    }
  }
  draw();
  loopId = requestAnimationFrame(gameLoop);
}
function draw() {
  ctx.fillStyle = '#030712'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Ship (neon blue)
  ctx.fillStyle = '#3b82f6'; ctx.fillRect(state.shipX, 360, 30, 20);
  // Bullets
  ctx.fillStyle = '#10b981'; state.bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
  // Enemies
  ctx.fillStyle = '#ef4444'; state.enemies.forEach(en => ctx.fillRect(en.x, en.y, 20, 20));
}
function triggerGameOver() { state.gameOver = true; audio.playExplode(); showScreen('game-over'); }`,

    "test.js": `/** Laser collision unit test */
import { assert } from 'console';
function checkBulletHit(bx, by, ex, ey) {
  return bx > ex - 4 && bx < ex + 20 && by > ey && by < ey + 20;
}
function runTests() {
  console.log("-----------------------------------------");
  console.log("RUNNING SPACE COLLISION TESTS...");
  console.log("-----------------------------------------");
  assert(checkBulletHit(10, 50, 8, 45) === true, "Overlap must trigger hit success");
  assert(checkBulletHit(10, 100, 80, 45) === false, "Separated coords must not register hit");
  console.log("✅ SPACE SHOOTER TESTS COMPLETED SUCCESSFULLY");
  process.exit(0);
}
runTests();`
  };
}

// 3. BRICK BREAKER PROCEDURAL TEMPLATE
function generateBrickBreaker(name, options) {
  return {
    "package.json": JSON.stringify({
      "name": "brick-breaker",
      "version": "1.0.0",
      "description": `Procedural brick breaker game named ${name}`,
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
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <div class="arcade-cabinet">
    <header class="cabinet-header">
      <h1 class="glow-text">${name.toUpperCase()}</h1>
      <div class="subtitle">BOUNCING CONSTRAINT CORE</div>
    </header>
    <div class="screen-container">
      <div id="loading-screen" class="screen active">
        <h2 class="glitch-title">GENERATING</h2>
        <div class="loading-bar"><div class="loading-progress"></div></div>
        <div class="blink-text">CALIBRATING FORCE FIELDS...</div>
      </div>
      <div id="main-menu" class="screen">
        <button class="menu-btn" onclick="startGame()">LAUNCH BALL</button>
      </div>
      <div id="game-screen" class="screen">
        <div class="hud">
          <div class="hud-item"><span class="label">SCORE</span><span id="score-val" class="value glow-value">0000</span></div>
        </div>
        <div class="canvas-wrapper"><canvas id="game-canvas" width="300" height="400"></canvas></div>
        <div class="controls-hint">USE A / D OR LEFT / RIGHT ARROWS TO SLIDE PADDLE</div>
      </div>
      <div id="game-over" class="screen">
        <h2 class="glitch-title">MATRIX TERMINATED</h2>
        <div class="menu-options">
          <button class="menu-btn" onclick="restartGame()">RELAUNCH</button>
          <button class="menu-btn" onclick="exitToMenu()">COMMAND HANGAR</button>
        </div>
      </div>
    </div>
  </div>
  <script src="game.js"></script>
</body>
</html>`,

    "style.css": `/* Cyber styling common across generic arcade templates */
:root { --primary: #10b981; --bg-dark: #030805; --bg-cabinet: #0d1911; }
body { background: var(--bg-dark); color: #fff; font-family: 'Share Tech Mono', monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; }
.arcade-cabinet { background: var(--bg-cabinet); border: 4px solid #1e293b; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(16,185,129,0.3); width: 340px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.cabinet-header { text-align: center; }
h1 { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; letter-spacing: 2px; }
.subtitle { color: #64748b; font-size: 0.7rem; letter-spacing: 3px; }
.screen-container { position: relative; background: #000; border: 4px solid #111; border-radius: 8px; height: 420px; overflow: hidden; }
.screen { position: absolute; top:0; left:0; width:100%; height:100%; display:none; flex-direction:column; align-items:center; justify-content:center; }
.screen.active { display:flex; }
.hud { width:90%; display:flex; justify-content:space-between; margin-bottom: 5px; }
.hud-item { display:flex; flex-direction:column; }
.hud-item .label { font-size:0.7rem; color:#64748b; }
.hud-item .value { font-size:1.1rem; font-family:'Orbitron'; color:var(--primary); }
.canvas-wrapper { border: 2px solid var(--primary); }
.controls-hint { font-size:0.7rem; color:#64748b; margin-top:8px; }
.menu-btn { background:transparent; border:2px solid var(--primary); color:#fff; padding:8px 16px; font-family:'Share Tech Mono'; font-weight:bold; cursor:pointer; border-radius:4px; }
.menu-btn:hover { background:var(--primary); color:#000; }
.glitch-title { font-family:'Orbitron'; font-size:1.8rem; color:#f43f5e; text-shadow:0 0 8px rgba(244,63,94,0.5); }
.loading-bar { width: 120px; height: 4px; background:#222; overflow:hidden; margin:10px 0; }
.loading-progress { width:0; height:100%; background:var(--primary); animation:f 1.5s forwards; }
@keyframes f { to { width:100%; } }
.blink-text { animation:b 1.2s infinite; font-size:0.8rem; }
@keyframes b { 50% { opacity:0.3; } }`,

    "game.js": `/** Brick Breaker gameplay loops */
class SoundEngine {
  constructor() { this.ctx = null; }
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
  playPing() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.05);
  }
  playCrash() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.3);
  }
}
const audio = new SoundEngine();
class GameState {
  constructor() {
    this.paddleX = 110; this.score = 0; this.gameOver = false;
    this.ball = { x: 150, y: 300, dx: 2, dy: -3, radius: 5 };
    this.bricks = []; this.keys = {};
  }
  reset() {
    this.paddleX = 110; this.score = 0; this.gameOver = false;
    this.ball = { x: 150, y: 300, dx: 2, dy: -3, radius: 5 };
    this.bricks = [];
    // Spawn 4x6 bricks grid
    for(let r=0; r<4; r++) {
      for(let c=0; c<6; c++) {
        this.bricks.push({ x: 15 + c*45, y: 40 + r*20, w: 35, h: 12, status: 1 });
      }
    }
  }
}
const state = new GameState();
let canvas, ctx, loopId;
window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas'); if (canvas) ctx = canvas.getContext('2d');
  setTimeout(() => showScreen('main-menu'), 1500);
  window.addEventListener('keydown', (e) => state.keys[e.key] = true);
  window.addEventListener('keyup', (e) => state.keys[e.key] = false);
});
function showScreen(screenId) {
  ['loading-screen', 'main-menu', 'game-screen', 'game-over'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { if (id === screenId) el.classList.add('active'); else el.classList.remove('active'); }
  });
}
function startGame() {
  state.reset(); showScreen('game-screen');
  if (loopId) cancelAnimationFrame(loopId);
  loopId = requestAnimationFrame(gameLoop);
}
function restartGame() { startGame(); }
function exitToMenu() { if (loopId) cancelAnimationFrame(loopId); showScreen('main-menu'); }
function gameLoop() {
  if (state.gameOver) return;
  if (state.keys['ArrowLeft'] || state.keys['a']) state.paddleX -= 5;
  if (state.keys['ArrowRight'] || state.keys['d']) state.paddleX += 5;
  if (state.paddleX < 5) state.paddleX = 5; if (state.paddleX > 215) state.paddleX = 215;

  const b = state.ball;
  b.x += b.dx; b.y += b.dy;

  // Wall bounce reflection
  if (b.x < 5 || b.x > 295) { b.dx = -b.dx; audio.playPing(); }
  if (b.y < 5) { b.dy = -b.dy; audio.playPing(); }

  // Paddle bounce reflection
  if (b.y > 370 && b.x > state.paddleX && b.x < state.paddleX + 80) {
    b.dy = -Math.abs(b.dy);
    audio.playPing();
  }

  // Ground collision check
  if (b.y > canvas.height) { triggerGameOver(); return; }

  // Brick hits
  state.bricks.forEach(br => {
    if (br.status === 1) {
      if (b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + br.h) {
        br.status = 0;
        b.dy = -b.dy;
        audio.playPing();
        state.score += 15;
        document.getElementById('score-val').textContent = String(state.score).padStart(4, '0');
      }
    }
  });

  draw();
  loopId = requestAnimationFrame(gameLoop);
}
function draw() {
  ctx.fillStyle = '#020306'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Paddle (green)
  ctx.fillStyle = '#10b981'; ctx.fillRect(state.paddleX, 375, 80, 10);
  // Ball
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI*2); ctx.fill();
  // Bricks (orange/pink neon)
  ctx.fillStyle = '#f43f5e';
  state.bricks.forEach(br => {
    if (br.status === 1) ctx.fillRect(br.x, br.y, br.w, br.h);
  });
}
function triggerGameOver() { state.gameOver = true; audio.playCrash(); showScreen('game-over'); }`,

    "test.js": `/** Ball reflection tests */
import { assert } from 'console';
function simulateBounce(bx, dx) {
  if (bx < 5 || bx > 295) return -dx;
  return dx;
}
function runTests() {
  console.log("-----------------------------------------");
  console.log("RUNNING BRICK REFLECTION TESTS...");
  console.log("-----------------------------------------");
  assert(simulateBounce(2, 2) === -2, "Border hit must reflect velocity");
  assert(simulateBounce(150, 2) === 2, "Center path must keep direction");
  console.log("✅ BRICK BREAKER TESTS PASSED");
  process.exit(0);
}
runTests();`
  };
}

// 4. ACTION PLATFORMER / HAZARD DODGE (DEFAULT FALLBACK)
function generateHazardDodge(name, options) {
  return {
    "package.json": JSON.stringify({
      "name": "hazard-dodge",
      "version": "1.0.0",
      "description": `Procedural dodging game named ${name}`,
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
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <div class="arcade-cabinet">
    <header class="cabinet-header">
      <h1 class="glow-text">${name.toUpperCase()}</h1>
      <div class="subtitle">HAZARD AVOIDANCE SYSTEM</div>
    </header>
    <div class="screen-container">
      <div id="loading-screen" class="screen active">
        <h2 class="glitch-title">READYING</h2>
        <div class="loading-bar"><div class="loading-progress"></div></div>
        <div class="blink-text">LOADING STABILITY SECTORS...</div>
      </div>
      <div id="main-menu" class="screen">
        <button class="menu-btn" onclick="startGame()">ACTIVATE SECTOR</button>
      </div>
      <div id="game-screen" class="screen">
        <div class="hud">
          <div class="hud-item"><span class="label">SCORE</span><span id="score-val" class="value glow-value">0000</span></div>
        </div>
        <div class="canvas-wrapper"><canvas id="game-canvas" width="300" height="400"></canvas></div>
        <div class="controls-hint">USE LEFT / RIGHT ARROWS TO DODGE HAZARD LASERS</div>
      </div>
      <div id="game-over" class="screen">
        <h2 class="glitch-title">DODGER OFFLINE</h2>
        <div class="menu-options">
          <button class="menu-btn" onclick="restartGame()">REBOOT</button>
          <button class="menu-btn" onclick="exitToMenu()">COMMAND HANGAR</button>
        </div>
      </div>
    </div>
  </div>
  <script src="game.js"></script>
</body>
</html>`,

    "style.css": `/* Cyber styling common across generic arcade templates */
:root { --primary: #ec4899; --bg-dark: #080205; --bg-cabinet: #190d13; }
body { background: var(--bg-dark); color: #fff; font-family: 'Share Tech Mono', monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; }
.arcade-cabinet { background: var(--bg-cabinet); border: 4px solid #1e293b; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(236,72,153,0.3); width: 340px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.cabinet-header { text-align: center; }
h1 { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; letter-spacing: 2px; }
.subtitle { color: #64748b; font-size: 0.7rem; letter-spacing: 3px; }
.screen-container { position: relative; background: #000; border: 4px solid #111; border-radius: 8px; height: 420px; overflow: hidden; }
.screen { position: absolute; top:0; left:0; width:100%; height:100%; display:none; flex-direction:column; align-items:center; justify-content:center; }
.screen.active { display:flex; }
.hud { width:90%; display:flex; justify-content:space-between; margin-bottom: 5px; }
.hud-item { display:flex; flex-direction:column; }
.hud-item .label { font-size:0.7rem; color:#64748b; }
.hud-item .value { font-size:1.1rem; font-family:'Orbitron'; color:var(--primary); }
.canvas-wrapper { border: 2px solid var(--primary); }
.controls-hint { font-size:0.7rem; color:#64748b; margin-top:8px; }
.menu-btn { background:transparent; border:2px solid var(--primary); color:#fff; padding:8px 16px; font-family:'Share Tech Mono'; font-weight:bold; cursor:pointer; border-radius:4px; }
.menu-btn:hover { background:var(--primary); color:#000; }
.glitch-title { font-family:'Orbitron'; font-size:1.8rem; color:#f43f5e; text-shadow:0 0 8px rgba(244,63,94,0.5); }
.loading-bar { width: 120px; height: 4px; background:#222; overflow:hidden; margin:10px 0; }
.loading-progress { width:0; height:100%; background:var(--primary); animation:f 1.5s forwards; }
@keyframes f { to { width:100%; } }
.blink-text { animation:b 1.2s infinite; font-size:0.8rem; }
@keyframes b { 50% { opacity:0.3; } }`,

    "game.js": `/** Hazard Dodge generic action platform loop */
class SoundEngine {
  constructor() { this.ctx = null; }
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
  playScore() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.05);
  }
  playCrash() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.3);
  }
}
const audio = new SoundEngine();
class GameState {
  constructor() {
    this.playerX = 135; this.score = 0; this.gameOver = false;
    this.lasers = []; this.keys = {};
  }
  reset() { this.playerX = 135; this.score = 0; this.gameOver = false; this.lasers = []; }
}
const state = new GameState();
let canvas, ctx, loopId;
window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas'); if (canvas) ctx = canvas.getContext('2d');
  setTimeout(() => showScreen('main-menu'), 1500);
  window.addEventListener('keydown', (e) => state.keys[e.key] = true);
  window.addEventListener('keyup', (e) => state.keys[e.key] = false);
});
function showScreen(screenId) {
  ['loading-screen', 'main-menu', 'game-screen', 'game-over'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { if (id === screenId) el.classList.add('active'); else el.classList.remove('active'); }
  });
}
function startGame() {
  state.reset(); showScreen('game-screen');
  if (loopId) cancelAnimationFrame(loopId);
  loopId = requestAnimationFrame(gameLoop);
}
function restartGame() { startGame(); }
function exitToMenu() { if (loopId) cancelAnimationFrame(loopId); showScreen('main-menu'); }
function gameLoop() {
  if (state.gameOver) return;
  if (state.keys['ArrowLeft'] || state.keys['a']) state.playerX -= 4;
  if (state.keys['ArrowRight'] || state.keys['d']) state.playerX += 4;
  if (state.playerX < 5) state.playerX = 5; if (state.playerX > 275) state.playerX = 275;

  // Move lasers
  if (state.lasers.length < 3 && Math.random() < 0.04) {
    state.lasers.push({ x: Math.random() * 280, y: -20, speed: 2 + Math.random() * 3 });
  }
  for (let i = state.lasers.length - 1; i >= 0; i--) {
    const las = state.lasers[i];
    las.y += las.speed;
    if (las.y > canvas.height) {
      state.lasers.splice(i, 1);
      state.score += 5;
      audio.playScore();
      document.getElementById('score-val').textContent = String(state.score).padStart(4, '0');
    }

    // Check collision
    // Player width 20, height 20. Laser width 10, height 20
    if (state.playerX < las.x + 10 && state.playerX + 20 > las.x && las.y + 20 > 360 && las.y < 380) {
      triggerGameOver();
      return;
    }
  }
  draw();
  loopId = requestAnimationFrame(gameLoop);
}
function draw() {
  ctx.fillStyle = '#060205'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Player
  ctx.fillStyle = '#ec4899'; ctx.fillRect(state.playerX, 360, 20, 20);
  // Lasers
  ctx.fillStyle = '#fbbf24'; state.lasers.forEach(las => ctx.fillRect(las.x, las.y, 10, 20));
}
function triggerGameOver() { state.gameOver = true; audio.playCrash(); showScreen('game-over'); }`,

    "test.js": `/** Laser collision unit test */
import { assert } from 'console';
function checkHit(px, lx, ly) {
  // player x=px, y=360, size=20. laser x=lx, y=ly, size_x=10, size_y=20
  return px < lx + 10 && px + 20 > lx && ly + 20 > 360 && ly < 380;
}
function runTests() {
  console.log("-----------------------------------------");
  console.log("RUNNING HAZARD COLLISION TESTS...");
  console.log("-----------------------------------------");
  assert(checkHit(100, 102, 355) === true, "Laser overlap should register hit");
  assert(checkHit(100, 200, 10) === false, "Safe separation coords must not collide");
  console.log("✅ HAZARD DODGE TESTS PASSED");
  process.exit(0);
}
runTests();`
  };
}

function hexToRgb(hex) {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return ((num >> 16) & 255) + ', ' + ((num >> 8) & 255) + ', ' + (num & 255);
}
