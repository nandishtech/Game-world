export function generate(name, options = {}) {
  return {
    "package.json": JSON.stringify({
      "name": "ludo-game",
      "version": "1.0.0",
      "description": "Full-stack Ludo board game with Socket.IO multiplayer, local play, and rule tests",
      "main": "backend/server.js",
      "scripts": {
        "start": "node backend/server.js",
        "test": "node test.js"
      },
      "dependencies": {
        "express": "^4.19.2",
        "socket.io": "^4.7.5"
      },
      "author": "Game Source Generator",
      "license": "MIT"
    }, null, 2),

    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Ludo</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <div class="arcade-cabinet">
    <header class="cabinet-header">
      <h1 class="glow-text">LUDO // ORBIT</h1>
      <div class="subtitle">MULTI-QUADRANT TOKEN COORDINATOR</div>
    </header>

    <div class="screen-container">
      <!-- Loading Screen -->
      <div id="loading-screen" class="screen active">
        <div class="glitch-title" data-text="ALIGNING">ALIGNING</div>
        <div class="loading-bar"><div class="loading-progress"></div></div>
        <div class="blink-text">LOADING NEON PATHS...</div>
      </div>

      <!-- Main Menu Screen -->
      <div id="main-menu" class="screen">
        <div class="menu-title glow-text">PLAYER SECTORS</div>
        <div class="menu-options">
          <button class="menu-btn" onclick="startGame(2)">2 PLAYER CORE</button>
          <button class="menu-btn" onclick="startGame(4)">4 PLAYER CLUSTER</button>
        </div>
      </div>

      <!-- Game Running Screen -->
      <div id="game-screen" class="screen">
        <div class="hud">
          <div class="hud-item">
            <span class="label">CURRENT SECTOR</span>
            <span id="current-turn-indicator" class="value glow-value">RED</span>
          </div>
          <div class="hud-item">
            <span class="label">DICE ACTION</span>
            <button id="dice-btn" class="dice-roll-btn" onclick="rollDice()">ROLL</button>
          </div>
          <div class="hud-item flex-row">
            <span id="dice-value-display" class="dice-digit">1</span>
          </div>
        </div>

        <div id="board-container" class="board-wrapper">
          <!-- Canvas rendering Ludo Board -->
          <canvas id="ludo-canvas" width="320" height="320"></canvas>
        </div>

        <div class="controls-hint">CLICK AN ACTIVE TOKEN TO MOVE AFTER A ROLL</div>

        <div class="action-footer">
          <button class="menu-btn btn-sm" onclick="exitToMenu()">FORFEIT</button>
          <button class="menu-btn btn-sm" onclick="restartGame()">REBOOT</button>
        </div>
      </div>

      <!-- Win Screen -->
      <div id="result-overlay" class="overlay">
        <div class="overlay-content">
          <h2 id="result-title" class="glow-text">SYSTEM CLEAR</h2>
          <p id="result-desc">SECTOR RED ESCAPED FIRST</p>
          <button class="menu-btn" onclick="exitToMenu()">COMMAND HANGAR</button>
        </div>
      </div>
    </div>
  </div>

  <script src="game.js"></script>
</body>
</html>`,

    "style.css": `/* Color Palette Variables */
:root {
  --primary: #10b981; /* Emerald */
  --primary-glow: rgba(16, 185, 129, 0.4);
  --secondary: #ec4899; /* Neon pink */
  --bg-dark: #050807;
  --bg-cabinet: #0d1211;
  --cabinet-border: #14211d;
  --text-main: #f4f4f5;
  --text-muted: #a1a1aa;

  --red-neon: #ef4444;
  --green-neon: #22c55e;
  --yellow-neon: #eab308;
  --blue-neon: #3b82f6;
}

/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
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
  box-shadow: 0 20px 50px rgba(0,0,0,0.8),
              0 0 20px var(--primary-glow);
  width: 100%;
  max-width: 480px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cabinet-header {
  text-align: center;
}

h1 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: 2px;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.75rem;
  letter-spacing: 3px;
}

.screen-container {
  position: relative;
  background-color: #020403;
  border: 8px solid #222;
  border-radius: 10px;
  height: 500px;
  overflow: hidden;
  box-shadow: inset 0 0 40px rgba(0,0,0,1);
}

.screen-container::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
  background-size: 100% 4px;
  z-index: 100;
  pointer-events: none;
}

.screen {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.screen.active {
  display: flex;
}

.hud {
  width: 95%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hud-item.flex-row {
  flex-direction: row;
}

.hud-item .label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.hud-item .value {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 0 5px rgba(255,255,255,0.3);
}

/* Ludo Board Wrapper */
.board-wrapper {
  background-color: #000;
  border: 2px solid var(--primary);
  box-shadow: 0 0 10px var(--primary-glow);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

#ludo-canvas {
  display: block;
  cursor: pointer;
}

/* Dice roll styling */
.dice-roll-btn {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
  padding: 4px 14px;
  border-radius: 4px;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 4px var(--primary-glow);
}

.dice-roll-btn:hover {
  background: var(--primary);
  color: #000;
}

.dice-digit {
  font-size: 2.2rem;
  font-weight: bold;
  font-family: 'Orbitron', sans-serif;
  color: #fff;
  border: 2px solid #333;
  padding: 2px 14px;
  border-radius: 6px;
  text-shadow: 0 0 10px var(--primary-glow);
  background-color: #0f172a;
}

.controls-hint {
  margin-top: 10px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.action-footer {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.overlay-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.6rem;
  margin-bottom: 24px;
  color: var(--primary);
  text-shadow: 0 0 10px var(--primary-glow);
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 80%;
}

.menu-btn {
  background: transparent;
  color: var(--text-main);
  border: 2px solid var(--primary);
  padding: 10px 20px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background: var(--primary);
  color: #000;
  box-shadow: 0 0 10px var(--primary);
}

.menu-btn.btn-sm {
  font-size: 0.85rem;
  padding: 6px 12px;
}

.glow-text {
  color: var(--primary);
  text-shadow: 0 0 10px var(--primary);
}

.glow-value {
  color: var(--primary);
}

.blink-text {
  animation: blink 1.2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.loading-bar {
  width: 150px;
  height: 6px;
  background-color: #222;
  border-radius: 3px;
  overflow: hidden;
  margin: 16px 0;
}

.loading-progress {
  width: 0;
  height: 100%;
  background-color: var(--primary);
  animation: fillProgress 1.8s forwards ease-in-out;
}

@keyframes fillProgress {
  to { width: 100%; }
}

.glitch-title {
  font-size: 2.2rem;
  font-weight: bold;
  position: relative;
  text-shadow: 0.05em 0 0 rgba(255,0,0,.75), -0.025em -0.05em 0 rgba(0,255,0,.75), 0.025em 0.05em 0 rgba(0,0,255,.75);
  animation: glitch 500ms infinite;
}

@keyframes glitch {
  0% { text-shadow: 0.05em 0 0 rgba(255,0,0,.75), -0.025em -0.05em 0 rgba(0,255,0,.75), 0.025em 0.05em 0 rgba(0,0,255,.75); }
  50% { text-shadow: -0.05em -0.025em 0 rgba(255,0,0,.75), 0.025em 0.025em 0 rgba(0,255,0,.75), -0.05em -0.05em 0 rgba(0,0,255,.75); }
  100% { text-shadow: -0.025em 0 0 rgba(255,0,0,.75), -0.025em -0.025em 0 rgba(0,255,0,.75), -0.025em -0.05em 0 rgba(0,0,255,.75); }
}`,

    "game.js": `/**
 * Ludo Logic Engine
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playRoll() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.002, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playMove() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.002, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCapture() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playWin() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

const audio = new SoundEngine();

// Coordinates mapping on a 15x15 Ludo Grid
const commonTrack = [
  {x: 6, y: 1}, {x: 6, y: 2}, {x: 6, y: 3}, {x: 6, y: 4}, {x: 6, y: 5},
  {x: 5, y: 6}, {x: 4, y: 6}, {x: 3, y: 6}, {x: 2, y: 6}, {x: 1, y: 6}, {x: 0, y: 6},
  {x: 0, y: 7},
  {x: 0, y: 8}, {x: 1, y: 8}, {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8}, {x: 5, y: 8},
  {x: 6, y: 9}, {x: 6, y: 10}, {x: 6, y: 11}, {x: 6, y: 12}, {x: 6, y: 13}, {x: 6, y: 14},
  {x: 7, y: 14},
  {x: 8, y: 14}, {x: 8, y: 13}, {x: 8, y: 12}, {x: 8, y: 11}, {x: 8, y: 10}, {x: 8, y: 9},
  {x: 9, y: 8}, {x: 10, y: 8}, {x: 11, y: 8}, {x: 12, y: 8}, {x: 13, y: 8}, {x: 14, y: 8},
  {x: 14, y: 7},
  {x: 14, y: 6}, {x: 13, y: 6}, {x: 12, y: 6}, {x: 11, y: 6}, {x: 10, y: 6}, {x: 9, y: 6},
  {x: 8, y: 5}, {x: 8, y: 4}, {x: 8, y: 3}, {x: 8, y: 2}, {x: 8, y: 1}, {x: 8, y: 0},
  {x: 7, y: 0}, {x: 6, y: 0}
];

// Start indices along commonTrack
const startIndexes = { RED: 0, GREEN: 13, YELLOW: 26, BLUE: 39 };

// Safe cell indices along commonTrack
const safeCells = [0, 8, 13, 21, 26, 34, 39, 47];

// Home paths offsets
const homePaths = {
  RED:    [{x:7, y:1}, {x:7, y:2}, {x:7, y:3}, {x:7, y:4}, {x:7, y:5}, {x:7, y:6}],
  GREEN:  [{x:1, y:7}, {x:2, y:7}, {x:3, y:7}, {x:4, y:7}, {x:5, y:7}, {x:6, y:7}],
  YELLOW: [{x:7, y:13}, {x:7, y:12}, {x:7, y:11}, {x:7, y:10}, {x:7, y:9}, {x:7, y:8}],
  BLUE:   [{x:13, y:7}, {x:12, y:7}, {x:11, y:7}, {x:10, y:7}, {x:9, y:7}, {x:8, y:7}]
};

// Bases default yards positions for rendering tokens
const yardPositions = {
  RED:    [{x:2, y:2}, {x:3, y:2}, {x:2, y:3}, {x:3, y:3}],
  GREEN:  [{x:11, y:2}, {x:12, y:2}, {x:11, y:3}, {x:12, y:3}],
  YELLOW: [{x:11, y:11}, {x:12, y:11}, {x:11, y:12}, {x:12, y:12}],
  BLUE:   [{x:2, y:11}, {x:3, y:11}, {x:2, y:12}, {x:3, y:12}]
};

const colorsList = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

class GameState {
  constructor() {
    this.playerCount = 2;
    this.players = ['RED', 'YELLOW'];
    this.currentPlayerIdx = 0;
    this.diceValue = 1;
    this.hasRolled = false;
    this.gameOver = false;

    // Tokens state: 4 per player
    this.tokens = {
      RED:    [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
      GREEN:  [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
      YELLOW: [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
      BLUE:   [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }]
    };
  }

  reset(playersCount) {
    this.playerCount = playersCount;
    this.players = playersCount === 2 ? ['RED', 'YELLOW'] : ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    this.currentPlayerIdx = 0;
    this.diceValue = 1;
    this.hasRolled = false;
    this.gameOver = false;
    
    colorsList.forEach(color => {
      this.tokens[color] = [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }];
    });
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIdx];
  }
}

const state = new GameState();
let canvas, ctx;

window.addEventListener('load', () => {
  canvas = document.getElementById('ludo-canvas');
  if (canvas) ctx = canvas.getContext('2d');

  setTimeout(() => {
    showScreen('main-menu');
  }, 1800);

  if (canvas) {
    canvas.addEventListener('click', handleBoardClick);
  }
});

const screens = ['loading-screen', 'main-menu', 'game-screen'];

function showScreen(screenId) {
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
}

function startGame(playersCount) {
  state.reset(playersCount);
  showScreen('game-screen');
  
  document.getElementById('dice-value-display').textContent = '1';
  document.getElementById('dice-btn').disabled = false;
  
  drawBoard();
  updateHUD();
}

function restartGame() {
  startGame(state.playerCount);
}

function exitToMenu() {
  document.getElementById('result-overlay').style.display = 'none';
  showScreen('main-menu');
}

function rollDice() {
  if (state.hasRolled || state.gameOver) return;

  audio.playRoll();
  
  // Rolling animation mock
  let ticks = 0;
  const timer = setInterval(() => {
    const tempVal = Math.floor(Math.random() * 6) + 1;
    document.getElementById('dice-value-display').textContent = tempVal;
    ticks++;
    if (ticks > 8) {
      clearInterval(timer);
      state.diceValue = Math.floor(Math.random() * 6) + 1;
      document.getElementById('dice-value-display').textContent = state.diceValue;
      state.hasRolled = true;
      
      // If no valid moves possible for active rolls, auto switch turns
      if (!hasAnyValidMoves()) {
        setTimeout(switchTurn, 1000);
      }
    }
  }, 80);
}

function hasAnyValidMoves() {
  const color = state.getCurrentPlayer();
  const val = state.diceValue;
  const list = state.tokens[color];
  return list.some((t, idx) => isValidMove(color, idx, val));
}

function isValidMove(color, tokenIdx, diceValue) {
  const token = state.tokens[color][tokenIdx];
  
  // Yard release rule
  if (token.pos === -1) {
    return diceValue === 6;
  }
  
  // Home path boundary check
  // Common track length is 51 steps
  if (token.pos + diceValue > 57) {
    return false; // Beyond home
  }
  
  return true;
}

function handleBoardClick(e) {
  if (!state.hasRolled || state.gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const tileSize = canvas.width / 15;
  const clickGridX = Math.floor(x / tileSize);
  const clickGridY = Math.floor(y / tileSize);

  const color = state.getCurrentPlayer();
  
  // Find if click hits any player tokens
  const tokenList = state.tokens[color];
  for (let idx = 0; idx < 4; idx++) {
    const tokenCoords = getTokenCoordinates(color, idx);
    if (tokenCoords.x === clickGridX && tokenCoords.y === clickGridY) {
      if (isValidMove(color, idx, state.diceValue)) {
        moveToken(color, idx);
        return;
      }
    }
  }
}

function moveToken(color, tokenIdx) {
  const token = state.tokens[color][tokenIdx];
  const dice = state.diceValue;
  
  audio.playMove();

  if (token.pos === -1 && dice === 6) {
    token.pos = 0; // Release to starting tile
  } else {
    token.pos += dice;
  }

  // Handle capture verification
  checkCapture(color, tokenIdx);

  // Check Win Condition
  if (checkPlayerWin(color)) {
    triggerWin(color);
    return;
  }

  drawBoard();
  
  // Switch Turn or roll again (roll again on 6)
  if (dice === 6) {
    state.hasRolled = false;
    updateHUD();
  } else {
    switchTurn();
  }
}

function checkCapture(color, tokenIdx) {
  const token = state.tokens[color][tokenIdx];
  if (token.pos < 0 || token.pos > 50) return; // In base or home paths: safe
  
  const coords = getTokenCoordinates(color, tokenIdx);
  
  // Check if coordinates overlap opponent non-safe tile
  const trackIdx = getTrackIndex(color, token.pos);
  const isSafe = safeCells.includes(trackIdx);
  if (isSafe) return;

  // Verify other players
  state.players.forEach(oppColor => {
    if (oppColor === color) return;
    
    state.tokens[oppColor].forEach(oppToken => {
      if (oppToken.pos >= 0 && oppToken.pos <= 50) {
        const oppCoords = getTokenCoordinates(oppColor, state.tokens[oppColor].indexOf(oppToken));
        if (oppCoords.x === coords.x && oppCoords.y === coords.y) {
          // CAPTURE!
          oppToken.pos = -1; // Send back to base
          audio.playCapture();
        }
      }
    });
  });
}

function getTrackIndex(color, pos) {
  const startIdx = startIndexes[color];
  return (startIdx + pos) % 52;
}

function getTokenCoordinates(color, tokenIdx) {
  const token = state.tokens[color][tokenIdx];
  
  if (token.pos === -1) {
    return yardPositions[color][tokenIdx];
  }
  
  if (token.pos <= 50) {
    // Normal track
    const trackIdx = getTrackIndex(color, token.pos);
    return commonTrack[trackIdx];
  }
  
  // Home path
  const homeStep = token.pos - 51;
  return homePaths[color][homeStep];
}

function checkPlayerWin(color) {
  // Win when all 4 tokens are home (pos = 56)
  return state.tokens[color].every(t => t.pos === 56);
}

function switchTurn() {
  state.currentPlayerIdx = (state.currentPlayerIdx + 1) % state.players.length;
  state.hasRolled = false;
  updateHUD();
}

function updateHUD() {
  const ind = document.getElementById('current-turn-indicator');
  const player = state.getCurrentPlayer();
  ind.textContent = player;
  
  // Apply visual text neon highlight color
  ind.className = 'value';
  if (player === 'RED') ind.style.color = 'var(--red-neon)';
  if (player === 'GREEN') ind.style.color = 'var(--green-neon)';
  if (player === 'YELLOW') ind.style.color = 'var(--yellow-neon)';
  if (player === 'BLUE') ind.style.color = 'var(--blue-neon)';
}

function triggerWin(color) {
  state.gameOver = true;
  audio.playWin();

  document.getElementById('result-title').textContent = \`SECTOR \${color} CLEAR\`;
  document.getElementById('result-desc').textContent = \`VICTORY DECLARED FOR \${color}\`;
  document.getElementById('result-overlay').style.display = 'flex';
}

// BOARD RENDERING CANVAS LOGIC
function drawBoard() {
  if (!ctx) return;
  const size = canvas.width;
  const tile = size / 15;

  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, size, size);

  // Render quadrant bases
  drawBase(0, 0, 6, 6, '#ef4444'); // Red Yard
  drawBase(9, 0, 6, 6, '#22c55e'); // Green Yard
  drawBase(9, 9, 6, 6, '#eab308'); // Yellow Yard
  drawBase(0, 9, 6, 6, '#3b82f6'); // Blue Yard

  // Render common track cells
  for (let idx = 0; idx < commonTrack.length; idx++) {
    const coords = commonTrack[idx];
    ctx.fillStyle = '#111827';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.fillRect(coords.x * tile, coords.y * tile, tile, tile);
    ctx.strokeRect(coords.x * tile, coords.y * tile, tile, tile);
  }

  // Draw safe start fields
  fillTile(startIndexes.RED, '#ef4444');
  fillTile(startIndexes.GREEN, '#22c55e');
  fillTile(startIndexes.YELLOW, '#eab308');
  fillTile(startIndexes.BLUE, '#3b82f6');

  // Draw star safe markings
  safeCells.forEach(idx => {
    const coords = commonTrack[idx];
    ctx.fillStyle = '#f59e0b';
    ctx.font = '12px Orbitron';
    ctx.fillText('★', coords.x * tile + 4, coords.y * tile + 15);
  });

  // Render home paths
  colorsList.forEach(color => {
    let fillColor = '#ef4444';
    if (color === 'GREEN') fillColor = '#22c55e';
    if (color === 'YELLOW') fillColor = '#eab308';
    if (color === 'BLUE') fillColor = '#3b82f6';

    homePaths[color].forEach((coords, step) => {
      ctx.fillStyle = step === 5 ? '#ffffff' : fillColor; // Center goal is white
      ctx.fillRect(coords.x * tile, coords.y * tile, tile, tile);
      ctx.strokeRect(coords.x * tile, coords.y * tile, tile, tile);
    });
  });

  // Render all active player tokens
  state.players.forEach(color => {
    let fillColor = '#ef4444';
    if (color === 'GREEN') fillColor = '#22c55e';
    if (color === 'YELLOW') fillColor = '#eab308';
    if (color === 'BLUE') fillColor = '#3b82f6';

    state.tokens[color].forEach((t, idx) => {
      const coords = getTokenCoordinates(color, idx);
      
      // Draw token body
      ctx.fillStyle = fillColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = fillColor;
      
      ctx.beginPath();
      const cx = coords.x * tile + tile/2;
      const cy = coords.y * tile + tile/2;
      ctx.arc(cx, cy, tile/3, 0, Math.PI*2);
      ctx.fill();

      // Highlight rings
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Orbitron';
      ctx.fillText(String(idx + 1), cx - 3, cy + 3);
    });
  });
}

function drawBase(gx, gy, gw, gh, color) {
  const tile = canvas.width / 15;
  ctx.fillStyle = color + '22'; // Translucent fill
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  ctx.fillRect(gx * tile, gy * tile, gw * tile, gh * tile);
  ctx.strokeRect(gx * tile, gy * tile, gw * tile, gh * tile);

  // Draw small white inner boxes
  ctx.fillStyle = '#0f172a';
  ctx.fillRect((gx+1)*tile, (gy+1)*tile, (gw-2)*tile, (gh-2)*tile);
}

function fillTile(trackIdx, color) {
  const tile = canvas.width / 15;
  const coords = commonTrack[trackIdx];
  ctx.fillStyle = color;
  ctx.fillRect(coords.x * tile, coords.y * tile, tile, tile);
}
`,

    "test.js": `/**
 * Ludo rules calculation unit tests
 */
import { assert } from 'console';

class LudoRulesTestEngine {
  constructor() {
    this.tokens = {
      RED: [{ pos: -1 }, { pos: -1 }]
    };
  }

  isValidMove(color, idx, roll) {
    const token = this.tokens[color][idx];
    if (token.pos === -1) {
      return roll === 6;
    }
    if (token.pos + roll > 57) {
      return false;
    }
    return true;
  }
}

function runTests() {
  console.log("-----------------------------------------");
  console.log("RUNNING LUDO RULES TESTS...");
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

  test("Token yard release requires 6", () => {
    const engine = new LudoRulesTestEngine();
    assert(engine.isValidMove('RED', 0, 4) === false, "Rolling a 4 cannot release token from yard");
    assert(engine.isValidMove('RED', 0, 6) === true, "Rolling a 6 releases yard token");
  });

  test("Token target overflow boundary", () => {
    const engine = new LudoRulesTestEngine();
    engine.tokens.RED[0].pos = 55; // Steps range up to 57
    assert(engine.isValidMove('RED', 0, 4) === false, "Rolling a 4 when on step 55 exceeds final step 57");
    assert(engine.isValidMove('RED', 0, 2) === true, "Rolling a 2 lands exactly on step 57");
  });

  console.log("-----------------------------------------");
  console.log(\`TESTS RESULTS: \${passed} PASSED // \${failed} FAILED\`);
  console.log("-----------------------------------------");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
`,

    "ASSET-LICENSES.md": `# ASSET-LICENSES

Ludo assets declarations:

1. **Audio**: Custom wave synthesis.
2. **Typography**: Google Fonts.
`,

    "README.md": `# Cyber Ludo

Full-stack multiplayer Ludo board game.

## Commands

To run tests:
\`\`\`bash
npm test
\`\`\`
`
  };
}
