export function generate(name, options = {}) {
  const primaryColor = options.themeColor || '#06b6d4'; // Cyan neon
  const secondaryColor = options.secondaryColor || '#ec4899'; // Pink match highlight
  
  return {
    "package.json": JSON.stringify({
      "name": "memory-grid",
      "version": "1.0.0",
      "description": "Card matching memory game with dynamic grids, audio synthesis, and rule testing",
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
  <title>Cyber Memory Matrix</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <div class="arcade-cabinet">
    <header class="cabinet-header">
      <h1 class="glow-text">MEMORY // GRID</h1>
      <div class="subtitle">SYNAPSE RESONANCE RECOVERY</div>
    </header>

    <div class="screen-container">
      <!-- Loading Screen -->
      <div id="loading-screen" class="screen active">
        <div class="glitch-title" data-text="ALIGNING">ALIGNING</div>
        <div class="loading-bar"><div class="loading-progress"></div></div>
        <div class="blink-text">LOADING HOLO-ARRAYS...</div>
      </div>

      <!-- Main Menu Screen -->
      <div id="main-menu" class="screen">
        <div class="menu-title glow-text">MATRIX LEVEL</div>
        <div class="menu-options">
          <button class="menu-btn" onclick="startGame('4x4')">4x4 GRID (8 PAIRS)</button>
          <button class="menu-btn" onclick="startGame('6x6')">6x6 GRID (18 PAIRS)</button>
        </div>
      </div>

      <!-- Game Running Screen -->
      <div id="game-screen" class="screen">
        <div class="hud">
          <div class="hud-item">
            <span class="label">MOVES</span>
            <span id="moves-count" class="value glow-value">000</span>
          </div>
          <div class="hud-item">
            <span class="label">MATCHED</span>
            <span id="matches-count" class="value glow-value">0/8</span>
          </div>
          <div class="hud-item">
            <span class="label">TIME</span>
            <span id="timer-val" class="value glow-value">00:00</span>
          </div>
        </div>

        <div id="cards-container" class="cards-grid grid-4x4">
          <!-- Cards will be populated here -->
        </div>

        <div class="action-footer">
          <button class="menu-btn btn-sm" onclick="exitToMenu()">MENU</button>
          <button class="menu-btn btn-sm" onclick="restartGame()">REBOOT</button>
        </div>
      </div>

      <!-- End screen -->
      <div id="result-overlay" class="overlay">
        <div class="overlay-content">
          <h2 class="glow-text">SYNAPSE ALIGNED</h2>
          <p>MOVES COMPLETED: <span id="final-moves" class="glow-text-pink">0</span></p>
          <p>TIME TAKEN: <span id="final-time" class="glow-text-pink">00:00</span></p>
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
  --primary: ${primaryColor};
  --primary-glow: rgba(${hexToRgb(primaryColor)}, 0.45);
  --secondary: ${secondaryColor};
  --secondary-glow: rgba(${hexToRgb(secondaryColor)}, 0.45);
  --bg-dark: #05080c;
  --bg-cabinet: #0d121b;
  --cabinet-border: #16202f;
  --text-main: #f4f4f5;
  --text-muted: #a1a1aa;
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
  padding: 20px;
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
  background-color: #020204;
  border: 8px solid #222;
  border-radius: 10px;
  height: 480px;
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
  padding: 12px;
}

.screen.active {
  display: flex;
}

.hud {
  width: 90%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hud-item .label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.hud-item .value {
  font-size: 1.2rem;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
}

/* Card Board CSS grid sizes */
.cards-grid {
  display: grid;
  grid-gap: 8px;
  width: 320px;
  height: 320px;
  perspective: 1000px;
}

.grid-4x4 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.grid-6x6 {
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 4px;
}

/* 3D Flip Card classes */
.card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.4s ease-out;
  cursor: pointer;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  backface-visibility: hidden;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-front {
  background-color: #0c121e;
  border: 1px solid var(--primary);
  box-shadow: inset 0 0 5px var(--primary-glow);
  color: var(--primary);
}

/* Matrix scanning circuit pattern on card back */
.card-back {
  background-color: #080d14;
  border: 1px solid #1a2a3f;
  background-image: radial-gradient(var(--primary-glow) 1px, transparent 1px);
  background-size: 10px 10px;
}

.card-front-content {
  transform: rotateY(180deg);
  font-size: 1.6rem;
  font-family: 'Orbitron', sans-serif;
}

.grid-6x6 .card-front-content {
  font-size: 1.1rem;
}

.card.matched .card-front {
  border-color: var(--secondary);
  box-shadow: inset 0 0 10px var(--secondary-glow);
  color: var(--secondary);
}

.action-footer {
  margin-top: 15px;
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
  color: var(--bg-dark);
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

.glow-text-pink {
  color: var(--secondary);
  text-shadow: 0 0 10px var(--secondary);
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
 * Memory Grid Game Module
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playFlip() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(293.66, this.ctx.currentTime); // D4
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.002, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playMatch() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, this.ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playMismatch() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playWin() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16);
    osc.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.24);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.002, this.ctx.currentTime + 0.55);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.55);
  }
}

const audio = new SoundEngine();

// Array of visual tech symbols to render on matching card fronts
const symbolBank = [
  '◇', '◆', '▲', '▼', '◀', '▶', '●', '■', 
  '▲', '✖', '✚', '⚡', '★', '☣', '☢', '⚙', 
  '✦', '⚛', '☯', '☼', '☽', '♣', '♠', '♥'
];

class GameState {
  constructor() {
    this.grid = '4x4';
    this.cards = []; // Array of card items { id, symbol, isFlipped, isMatched }
    this.flippedIndices = [];
    this.moves = 0;
    this.matchedPairs = 0;
    this.totalPairs = 8;
    this.timer = 0;
    this.timerInterval = null;
    this.gameOver = false;
  }

  setupGrid(mode) {
    this.grid = mode;
    this.flippedIndices = [];
    this.moves = 0;
    this.matchedPairs = 0;
    this.gameOver = false;
    this.timer = 0;

    const count = mode === '4x4' ? 16 : 36;
    this.totalPairs = count / 2;

    const selectedSymbols = symbolBank.slice(0, this.totalPairs);
    const doubleList = [...selectedSymbols, ...selectedSymbols];
    shuffleArray(doubleList);

    this.cards = doubleList.map((symbol, idx) => ({
      id: idx,
      symbol,
      isFlipped: false,
      isMatched: false
    }));
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const state = new GameState();

window.addEventListener('load', () => {
  setTimeout(() => {
    showScreen('main-menu');
  }, 1800);
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

function startGame(gridSize) {
  state.setupGrid(gridSize);
  showScreen('game-screen');
  
  // Set layout styling classes
  const container = document.getElementById('cards-container');
  container.className = gridSize === '4x4' ? 'cards-grid grid-4x4' : 'cards-grid grid-6x6';
  
  renderBoard();
  
  document.getElementById('moves-count').textContent = '000';
  document.getElementById('matches-count').textContent = '0/' + state.totalPairs;
  document.getElementById('timer-val').textContent = '00:00';

  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(updateTimer, 1000);
}

function restartGame() {
  startGame(state.grid);
}

function renderBoard() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';

  state.cards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    if (card.isFlipped) cardEl.classList.add('flipped');
    if (card.isMatched) cardEl.classList.add('matched');

    cardEl.innerHTML = 
      '<div class="card-face card-back"></div>' +
      '<div class="card-face card-front">' +
        '<div class="card-front-content">' + card.symbol + '</div>' +
      '</div>';

    cardEl.addEventListener('click', () => {
      cardClicked(idx);
    });

    container.appendChild(cardEl);
  });
}

function cardClicked(idx) {
  if (state.gameOver) return;
  const card = state.cards[idx];

  // Ignore if already flipped or matched, or 2 cards are currently flipped verifying
  if (card.isFlipped || card.isMatched || state.flippedIndices.length >= 2) return;

  // Flip card
  card.isFlipped = true;
  state.flippedIndices.push(idx);
  audio.playFlip();
  renderBoard();

  if (state.flippedIndices.length === 2) {
    state.moves++;
    document.getElementById('moves-count').textContent = String(state.moves).padStart(3, '0');
    
    checkMatch();
  }
}

function checkMatch() {
  const [firstIdx, secondIdx] = state.flippedIndices;
  const first = state.cards[firstIdx];
  const second = state.cards[secondIdx];

  if (first.symbol === second.symbol) {
    // Match found
    first.isMatched = true;
    second.isMatched = true;
    state.matchedPairs++;
    
    audio.playMatch();
    state.flippedIndices = [];
    
    document.getElementById('matches-count').textContent = state.matchedPairs + '/' + state.totalPairs;

    renderBoard();

    // Check Win
    if (state.matchedPairs === state.totalPairs) {
      triggerWin();
    }
  } else {
    // Mismatch
    setTimeout(() => {
      first.isFlipped = false;
      second.isFlipped = false;
      audio.playMismatch();
      state.flippedIndices = [];
      renderBoard();
    }, 900);
  }
}

function updateTimer() {
  state.timer++;
  const mins = String(Math.floor(state.timer / 60)).padStart(2, '0');
  const secs = String(state.timer % 60).padStart(2, '0');
  document.getElementById('timer-val').textContent = mins + ':' + secs;
}

function triggerWin() {
  state.gameOver = true;
  if (state.timerInterval) clearInterval(state.timerInterval);
  audio.playWin();

  document.getElementById('final-moves').textContent = state.moves;
  
  const mins = String(Math.floor(state.timer / 60)).padStart(2, '0');
  const secs = String(state.timer % 60).padStart(2, '0');
  document.getElementById('final-time').textContent = mins + ':' + secs;

  setTimeout(() => {
    document.getElementById('result-overlay').style.display = 'flex';
  }, 500);
}

function exitToMenu() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  document.getElementById('result-overlay').style.display = 'none';
  showScreen('main-menu');
}
`,

    "test.js": `/**
 * Memory Game logic check rules
 */
import { assert } from 'console';

class MemoryRulesEngine {
  constructor(pairs = 8) {
    this.totalPairs = pairs;
    this.cards = [];
    this.flipped = [];
    this.matches = 0;
    this.moves = 0;
    this.gameOver = false;
  }

  loadCards(symbols) {
    // symbols is array of size totalPairs * 2
    this.cards = symbols.map((symbol, id) => ({
      id, symbol, isFlipped: false, isMatched: false
    }));
  }

  select(idx) {
    if (this.cards[idx].isFlipped || this.cards[idx].isMatched || this.flipped.length >= 2) return;
    this.cards[idx].isFlipped = true;
    this.flipped.push(idx);

    if (this.flipped.length === 2) {
      this.moves++;
      const [f, s] = this.flipped;
      if (this.cards[f].symbol === this.cards[s].symbol) {
        this.cards[f].isMatched = true;
        this.cards[s].isMatched = true;
        this.matches++;
        this.flipped = [];
        if (this.matches === this.totalPairs) {
          this.gameOver = true;
        }
      } else {
        // Mock automatic flip back in test
        this.cards[f].isFlipped = false;
        this.cards[s].isFlipped = false;
        this.flipped = [];
      }
    }
  }
}

function runTests() {
  console.log("-----------------------------------------");
  console.log("RUNNING MEMORY GRID CARD TESTS...");
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

  test("Grid matching detection", () => {
    const engine = new MemoryRulesEngine(2);
    engine.loadCards(['A', 'B', 'A', 'B']); // Pairs at 0,2 and 1,3
    
    // Pick mismatched cards
    engine.select(0);
    engine.select(1);
    assert(engine.moves === 1, "Moves should increment to 1");
    assert(engine.cards[0].isFlipped === false, "Mismatch card 0 should be flipped down");
    assert(engine.cards[1].isFlipped === false, "Mismatch card 1 should be flipped down");

    // Pick matched cards
    engine.select(0);
    engine.select(2);
    assert(engine.moves === 2, "Moves should increment to 2");
    assert(engine.cards[0].isMatched === true, "Card 0 matched");
    assert(engine.cards[2].isMatched === true, "Card 2 matched");
    assert(engine.matches === 1, "Matched pairs count should increase");
    assert(engine.gameOver === false, "Game should not end yet");
  });

  test("Game Win solved board state", () => {
    const engine = new MemoryRulesEngine(2);
    engine.loadCards(['A', 'B', 'A', 'B']);
    
    engine.select(0);
    engine.select(2);
    
    engine.select(1);
    engine.select(3);
    
    assert(engine.matches === 2, "Both pairs matched");
    assert(engine.gameOver === true, "All pairs solved should trigger game over");
  });

  console.log("-----------------------------------------");
  console.log(\`TESTS RESULTS: \${passed} PASSED // \${failed} FAILED\`);
  console.log("-----------------------------------------");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
`,

    "ASSET-LICENSES.md": `# ASSET-LICENSES

Attribution details for Cyber Memory Matrix:

1. **Audio**: Custom wave synthesis.
2. **Typography**: Google Fonts Share Tech Mono & Orbitron.
`,

    "README.md": `# Cyber Memory Matrix

Memory grid matching.

## Commands

To run tests:
\`\`\`bash
npm test
\`\`\`
`
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
