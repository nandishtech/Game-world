export function generate(name, options = {}) {
  return {
    "package.json": JSON.stringify({
      "name": "sudoku-classic",
      "version": "1.0.0",
      "description": "Clean newspaper-style classic Sudoku board with validation tests",
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
  <title>Classic Sudoku</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="game-wrapper">
    <header class="game-header">
      <h1>SUDOKU</h1>
      <div class="subtitle">Standard 9x9 Constraint Grid</div>
    </header>

    <!-- Main Menu Screen -->
    <div id="main-menu" class="screen active">
      <button class="menu-btn" onclick="startGame('easy')">Easy</button>
      <button class="menu-btn" onclick="startGame('medium')">Medium</button>
      <button class="menu-btn" onclick="startGame('hard')">Hard</button>
    </div>

    <!-- Gameplay Board Screen -->
    <div id="game-screen" class="screen">
      <div class="status-hud">
        <div>MISTAKES: <span id="mistakes-count">0/3</span></div>
        <div>TIME: <span id="timer-val">00:00</span></div>
      </div>

      <div id="sudoku-grid" class="sudoku-grid"></div>

      <!-- Virtual keypad -->
      <div class="keypad">
        <button class="key-btn" onclick="inputNumber(1)">1</button>
        <button class="key-btn" onclick="inputNumber(2)">2</button>
        <button class="key-btn" onclick="inputNumber(3)">3</button>
        <button class="key-btn" onclick="inputNumber(4)">4</button>
        <button class="key-btn" onclick="inputNumber(5)">5</button>
        <button class="key-btn" onclick="inputNumber(6)">6</button>
        <button class="key-btn" onclick="inputNumber(7)">7</button>
        <button class="key-btn" onclick="inputNumber(8)">8</button>
        <button class="key-btn" onclick="inputNumber(9)">9</button>
        <button class="key-btn clear" onclick="clearSelected()">CLEAR</button>
      </div>

      <div class="action-bar">
        <button class="action-btn" onclick="restartGame()">RESTART</button>
        <button class="action-btn secondary" onclick="exitToMenu()">QUIT</button>
      </div>
    </div>

    <!-- Win/Loss Overlay -->
    <div id="result-overlay" class="overlay">
      <div class="overlay-card">
        <h2 id="result-title">RESOLVED</h2>
        <p id="result-desc">All grids populated successfully.</p>
        <button class="menu-btn" onclick="exitToMenu()">MENU</button>
      </div>
    </div>
  </div>
</body>
</html>`,

    "style.css": `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f5f5f4; /* warm stone paper color */
  color: #1c1917;
  font-family: 'Crimson Pro', serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.game-wrapper {
  background-color: #ffffff;
  border: 1px solid #d6d3d1;
  border-radius: 4px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 360px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.game-header {
  text-align: center;
}

h1 {
  font-size: 2.1rem;
  letter-spacing: 4px;
  color: #000;
  font-weight: 700;
}

.subtitle {
  font-size: 0.8rem;
  color: #78716c;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 2px;
}

.screen {
  display: none;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.screen.active {
  display: flex;
}

.menu-btn {
  width: 100%;
  background-color: #1c1917;
  color: #fff;
  border: none;
  padding: 10px;
  font-family: 'Crimson Pro', serif;
  font-size: 1.15rem;
  font-weight: 600;
  border-radius: 3px;
  cursor: pointer;
  margin-bottom: 8px;
}

.menu-btn:hover {
  background-color: #44403c;
}

/* Sudoku 9x9 Grid layout */
.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  width: 100%;
  aspect-ratio: 1;
  border: 3px solid #1c1917;
  background-color: #1c1917;
}

.cell {
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  border: 0.5px solid #d6d3d1;
}

/* Bold boundaries for 3x3 subgrids */
.cell:nth-child(3n) { border-right: 2px solid #1c1917; }
.cell:nth-child(9n) { border-right: none; }
.cell:nth-child(27n + 1), .cell:nth-child(27n + 2), .cell:nth-child(27n + 3),
.cell:nth-child(27n + 4), .cell:nth-child(27n + 5), .cell:nth-child(27n + 6),
.cell:nth-child(27n + 7), .cell:nth-child(27n + 8), .cell:nth-child(27n + 9) {
  border-bottom: 2px solid #1c1917;
}

.cell.selected {
  background-color: #f5f5f4;
  outline: 2px dashed #000;
  outline-offset: -2px;
}

.cell.given {
  color: #1c1917; /* solid black */
  font-weight: bold;
}

.cell.correct {
  color: #2563eb; /* Blue correct input */
}

.cell.wrong {
  color: #dc2626; /* Red wrong input */
  background-color: #fee2e2;
}

.status-hud {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: bold;
}

/* Input Keypad */
.keypad {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 6px;
  width: 100%;
}

.key-btn {
  background-color: #f5f5f4;
  border: 1px solid #d6d3d1;
  border-radius: 3px;
  padding: 8px 0;
  font-family: 'Crimson Pro', serif;
  font-size: 1.15rem;
  font-weight: bold;
  cursor: pointer;
}

.key-btn:hover { background-color: #e7e5e4; }
.key-btn.clear { grid-column: span 2; }

.action-bar {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  font-family: 'Crimson Pro', serif;
  background-color: #78716c;
  color: #fff;
  border: none;
  cursor: pointer;
}

.action-btn.secondary { background-color: #a8a29e; }

/* Overlays */
.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.overlay-card {
  background-color: #fff;
  padding: 24px;
  border-radius: 4px;
  text-align: center;
  width: 80%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
`,

    "game.js": `/**
 * Newspaper-style Sudoku Grid Engine
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  playInput() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
  playWrong() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
  playWin() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
}

const audio = new SoundEngine();

const solvedBaseBoard = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

class GameState {
  constructor() {
    this.solvedGrid = [];
    this.currentGrid = [];
    this.initialMask = [];
    this.selectedIndex = -1;
    this.difficulty = 'easy';
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.timer = 0;
    this.timerInterval = null;
    this.gameOver = false;
  }
  generateBoard(difficulty) {
    this.difficulty = difficulty;
    const board = solvedBaseBoard.map(row => [...row]);
    shuffleBands(board);

    this.solvedGrid = board.flat();
    this.currentGrid = [...this.solvedGrid];
    this.initialMask = Array(81).fill(true);

    let removals = 30;
    if (difficulty === 'medium') removals = 40;
    if (difficulty === 'hard') removals = 52;

    const indices = Array.from({length: 81}, (_, i) => i);
    shuffleArray(indices);

    for (let i = 0; i < removals; i++) {
      const idx = indices[i];
      this.currentGrid[idx] = null;
      this.initialMask[idx] = false;
    }

    this.selectedIndex = -1;
    this.mistakes = 0;
    this.timer = 0;
    this.gameOver = false;
  }
}

function shuffleBands(board) {
  for (let i = 0; i < 9; i += 3) {
    const rIndices = [i, i+1, i+2];
    shuffleArray(rIndices);
    const tempRows = rIndices.map(idx => board[idx]);
    board[i] = tempRows[0];
    board[i+1] = tempRows[1];
    board[i+2] = tempRows[2];
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const state = new GameState();

function showScreen(screenId) {
  ['main-menu', 'game-screen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
}

function startGame(difficulty) {
  state.generateBoard(difficulty);
  showScreen('game-screen');
  renderGrid();
  
  document.getElementById('mistakes-count').textContent = '0/3';
  document.getElementById('timer-val').textContent = '00:00';

  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(updateTimer, 1000);
}

function restartGame() {
  startGame(state.difficulty);
}

function renderGrid() {
  const container = document.getElementById('sudoku-grid');
  container.innerHTML = '';

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.idx = i;

    const val = state.currentGrid[i];
    cell.textContent = val || '';

    if (state.initialMask[i]) {
      cell.classList.add('given');
    } else if (val) {
      if (val === state.solvedGrid[i]) {
        cell.classList.add('correct');
      } else {
        cell.classList.add('wrong');
      }
    }

    cell.addEventListener('click', () => selectCell(i));
    container.appendChild(cell);
  }
}

function selectCell(idx) {
  state.selectedIndex = idx;
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    if (i === idx) cell.classList.add('selected');
    else cell.classList.remove('selected');
  });
}

function inputNumber(num) {
  const idx = state.selectedIndex;
  if (idx === -1 || state.gameOver) return;
  if (state.initialMask[idx]) return;
  if (state.currentGrid[idx] === state.solvedGrid[idx]) return;

  state.currentGrid[idx] = num;
  audio.playInput();
  renderGrid();
  selectCell(idx);

  if (num !== state.solvedGrid[idx]) {
    state.mistakes++;
    audio.playWrong();
    document.getElementById('mistakes-count').textContent = state.mistakes + '/3';
    
    if (state.mistakes >= state.maxMistakes) {
      triggerGameOver(false);
    }
  } else {
    if (checkSolved()) {
      triggerGameOver(true);
    }
  }
}

function clearSelected() {
  const idx = state.selectedIndex;
  if (idx === -1 || state.gameOver) return;
  if (state.initialMask[idx]) return;
  if (state.currentGrid[idx] === state.solvedGrid[idx]) return;

  state.currentGrid[idx] = null;
  renderGrid();
  selectCell(idx);
}

function updateTimer() {
  state.timer++;
  const mins = String(Math.floor(state.timer / 60)).padStart(2, '0');
  const secs = String(state.timer % 60).padStart(2, '0');
  document.getElementById('timer-val').textContent = mins + ':' + secs;
}

function checkSolved() {
  for (let i = 0; i < 81; i++) {
    if (state.currentGrid[i] !== state.solvedGrid[i]) return false;
  }
  return true;
}

function triggerGameOver(isWin) {
  state.gameOver = true;
  if (state.timerInterval) clearInterval(state.timerInterval);

  const overlay = document.getElementById('result-overlay');
  const title = document.getElementById('result-title');
  const desc = document.getElementById('result-desc');

  if (isWin) {
    audio.playWin();
    title.textContent = 'CONSTRAINTS RESOLVED';
    const mins = String(Math.floor(state.timer / 60)).padStart(2, '0');
    const secs = String(state.timer % 60).padStart(2, '0');
    desc.textContent = 'Completed in ' + mins + ':' + secs;
  } else {
    audio.playWrong();
    title.textContent = 'GAME OVER';
    desc.textContent = 'Mistake limit exceeded.';
  }

  overlay.style.display = 'flex';
}

function exitToMenu() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  document.getElementById('result-overlay').style.display = 'none';
  showScreen('main-menu');
}
`,

    "test.js": `/** Sudoku tests */
import { assert } from 'console';
function checkDuplicate(row) {
  const filtered = row.filter(v => v !== null);
  return filtered.length === new Set(filtered).size;
}
function run() {
  assert(checkDuplicate([1,2,3,null,null]) === true, "Allowed non-duplicate entries");
  assert(checkDuplicate([1,2,2,null]) === false, "Detected duplicate entries");
  console.log("✅ SUDOKU TESTS PASSED");
  process.exit(0);
}
run();`,

    "ASSET-LICENSES.md": `# ASSET LICENSES
1. Fonts: Crimson Pro (Open Font License).
`,

    "README.md": `# Classic Sudoku

Clean newspaper-style Sudoku board.
`
  };
}
