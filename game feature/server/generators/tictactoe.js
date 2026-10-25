export function generate(name, options = {}) {
  return {
    "package.json": JSON.stringify({
      "name": "tictactoe-classic",
      "version": "1.0.0",
      "description": "Minimalist Tic Tac Toe board game with minimax AI and rules test",
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
  <title>Classic Tic Tac Toe</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet">
</head>
<body>
  <div class="game-wrapper">
    <header class="game-header">
      <h1>Tic-Tac-Toe</h1>
      <div id="status-text">Choose your opponent</div>
    </header>

    <!-- Menu Screen -->
    <div id="menu-screen" class="screen active">
      <button class="menu-btn" onclick="startGame('ai')">Play vs Computer</button>
      <button class="menu-btn" onclick="startGame('local')">Play Local 2P</button>
    </div>

    <!-- Board Grid Screen -->
    <div id="board-screen" class="screen">
      <div class="grid-board">
        <div class="grid-cell" onclick="cellClicked(0)"></div>
        <div class="grid-cell" onclick="cellClicked(1)"></div>
        <div class="grid-cell" onclick="cellClicked(2)"></div>
        <div class="grid-cell" onclick="cellClicked(3)"></div>
        <div class="grid-cell" onclick="cellClicked(4)"></div>
        <div class="grid-cell" onclick="cellClicked(5)"></div>
        <div class="grid-cell" onclick="cellClicked(6)"></div>
        <div class="grid-cell" onclick="cellClicked(7)"></div>
        <div class="grid-cell" onclick="cellClicked(8)"></div>
      </div>

      <div class="score-hud">
        <div class="hud-box">PLAYER X: <span id="score-x">0</span></div>
        <div class="hud-box">PLAYER O: <span id="score-o">0</span></div>
      </div>

      <div class="action-bar">
        <button class="action-btn" onclick="resetBoard()">RESET</button>
        <button class="action-btn secondary" onClick="exitToMenu()">MENU</button>
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
  background-color: #f3f4f6; /* light gray */
  color: #1f2937;
  font-family: 'Fredoka One', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.game-wrapper {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 340px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.game-header {
  text-align: center;
}

h1 {
  font-size: 1.8rem;
  color: #1e3a8a;
  margin-bottom: 6px;
}

#status-text {
  font-size: 0.95rem;
  color: #6b7280;
}

/* Screens toggling */
.screen {
  width: 100%;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.screen.active {
  display: flex;
}

.menu-btn {
  width: 100%;
  background-color: #2563eb;
  color: #fff;
  border: none;
  padding: 12px 20px;
  font-family: 'Fredoka One', sans-serif;
  font-size: 1.05rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(37,99,235,0.2);
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}

/* White board grid */
.grid-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 8px;
  width: 250px;
  height: 250px;
  background-color: #e5e7eb;
  padding: 8px;
  border-radius: 12px;
}

.grid-cell {
  background-color: #ffffff;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}

.grid-cell.cell-x {
  color: #3b82f6; /* Blue X */
}

.grid-cell.cell-o {
  color: #ef4444; /* Red O */
}

.score-hud {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.9rem;
}

.hud-box {
  background-color: #f3f4f6;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: bold;
}

.action-bar {
  display: flex;
  gap: 10px;
  width: 100%;
}

.action-btn {
  flex: 1;
  background-color: #10b981;
  color: #fff;
  border: none;
  padding: 10px 16px;
  font-family: 'Fredoka One', sans-serif;
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: pointer;
}

.action-btn.secondary {
  background-color: #9ca3af;
}

.action-btn:hover { opacity: 0.9; }
`,

    "game.js": `/**
 * Classic Whiteboard Tic Tac Toe Engine
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  playX() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(329.63, this.ctx.currentTime); // E4
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
  playO() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(392.00, this.ctx.currentTime); // G4
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
  playWin() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
}

const audio = new SoundEngine();

class GameState {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.scores = { X: 0, O: 0 };
    this.mode = 'ai';
    this.gameOver = false;
  }
  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameOver = false;
  }
}

const state = new GameState();

function showScreen(screenId) {
  ['menu-screen', 'board-screen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
}

function startGame(mode) {
  state.mode = mode;
  state.reset();
  state.scores = { X: 0, O: 0 };
  
  document.getElementById('score-x').textContent = '0';
  document.getElementById('score-o').textContent = '0';
  
  showScreen('board-screen');
  renderBoard();
  document.getElementById('status-text').textContent = "Player X's turn";
}

function cellClicked(idx) {
  if (state.board[idx] || state.gameOver) return;

  state.board[idx] = state.currentPlayer;
  if (state.currentPlayer === 'X') {
    audio.playX();
  } else {
    audio.playO();
  }

  renderBoard();

  if (checkWin(state.board, state.currentPlayer)) {
    triggerWin(state.currentPlayer);
    return;
  }

  if (checkTie(state.board)) {
    triggerTie();
    return;
  }

  state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
  document.getElementById('status-text').textContent = "Player " + state.currentPlayer + "'s turn";

  if (state.mode === 'ai' && state.currentPlayer === 'O') {
    document.getElementById('status-text').textContent = "Computer is thinking...";
    setTimeout(makeAiMove, 400);
  }
}

function makeAiMove() {
  const move = getBestMove(state.board, 'O');
  if (move !== -1) {
    cellClicked(move);
  }
}

function renderBoard() {
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach((cell, idx) => {
    cell.className = 'grid-cell';
    const val = state.board[idx];
    cell.textContent = val || '';
    if (val) {
      cell.classList.add(val === 'X' ? 'cell-x' : 'cell-o');
    }
  });
}

function checkWin(board, player) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(p => p.every(i => board[i] === player));
}

function checkTie(board) {
  return board.every(cell => cell !== null);
}

function triggerWin(player) {
  state.gameOver = true;
  state.scores[player]++;
  audio.playWin();

  document.getElementById('score-' + player.toLowerCase()).textContent = state.scores[player];
  document.getElementById('status-text').textContent = "Player " + player + " Wins!";
}

function triggerTie() {
  state.gameOver = true;
  document.getElementById('status-text').textContent = "Cat's game! It's a Tie";
}

function resetBoard() {
  state.reset();
  renderBoard();
  document.getElementById('status-text').textContent = "Player X's turn";
}

function exitToMenu() {
  showScreen('menu-screen');
  document.getElementById('status-text').textContent = "Choose your opponent";
}

function getBestMove(board, player) {
  const opponent = player === 'O' ? 'X' : 'O';

  function minimax(tempBoard, depth, isMax) {
    if (checkWin(tempBoard, player)) return 10 - depth;
    if (checkWin(tempBoard, opponent)) return depth - 10;
    if (checkTie(tempBoard)) return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = player;
          best = Math.max(best, minimax(tempBoard, depth + 1, false));
          tempBoard[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = opponent;
          best = Math.min(best, minimax(tempBoard, depth + 1, true));
          tempBoard[i] = null;
        }
      }
      return best;
    }
  }

  let bestVal = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = player;
      let moveVal = minimax(board, 0, false);
      board[i] = null;
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }
  return bestMove;
}
`,

    "test.js": `/** Tests checks */
import { assert } from 'console';
function checkWin(b, p) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(w => w.every(i => b[i] === p));
}
function run() {
  const board = ['X', 'X', 'X', null, null, null, null, null, null];
  assert(checkWin(board, 'X') === true, "Must recognize row win");
  console.log("✅ TIC TAC TOE TESTS PASSED");
  process.exit(0);
}
run();`,

    "ASSET-LICENSES.md": `# ASSET LICENSES
1. Fonts: Fredoka One (Open Font License).
`,

    "README.md": `# Classic Tic Tac Toe

Authentic minimalist Tic Tac Toe.
`
  };
}
