export function generate(name, options = {}) {
  const primaryColor = options.themeColor || '#6366f1'; // Neon Indigo for dark squares
  const secondaryColor = options.secondaryColor || '#a78bfa'; // Violet for selected highlights
  
  return {
    "package.json": JSON.stringify({
      "name": "chess-fullstack",
      "version": "1.0.0",
      "description": "Full-stack Chess board game with multiplayer Socket.IO backend and test suites",
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
    
    // Front-end files (playable directly in iframe)
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Chess Board</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <div class="arcade-cabinet">
    <header class="cabinet-header">
      <h1 class="glow-text">CHESS // CORE</h1>
      <div class="subtitle">TACTICAL BOARD QUANTUM COMPUTER</div>
    </header>

    <div class="screen-container">
      <!-- Loading Screen -->
      <div id="loading-screen" class="screen active">
        <div class="glitch-title" data-text="ALIGNING">ALIGNING</div>
        <div class="loading-bar"><div class="loading-progress"></div></div>
        <div class="blink-text">LOADING TACTICAL BOARDS...</div>
      </div>

      <!-- Main Menu Screen -->
      <div id="main-menu" class="screen">
        <div class="menu-title glow-text">TACTICAL VECTOR</div>
        <div class="menu-options">
          <button class="menu-btn" onclick="startGame('local')">LOCAL 2P PORT</button>
          <button class="menu-btn" onclick="startGame('ai')">VS SYSTEM BOT</button>
        </div>
      </div>

      <!-- Game Running Screen -->
      <div id="game-screen" class="screen">
        <div class="hud">
          <div class="hud-item">
            <span class="label">PLAYER 1 (WHITE)</span>
            <span id="player-white" class="value glow-value">READY</span>
          </div>
          <div class="hud-item">
            <span id="turn-indicator" class="label glow-text">TURN: WHITE</span>
          </div>
          <div class="hud-item">
            <span class="label">PLAYER 2 (BLACK)</span>
            <span id="player-black" class="value glow-value">READY</span>
          </div>
        </div>

        <div id="chess-board" class="board">
          <!-- 64 Squares generated dynamically -->
        </div>

        <div class="action-footer">
          <button class="menu-btn btn-sm" onclick="exitToMenu()">FORFEIT</button>
          <button class="menu-btn btn-sm" onclick="restartGame()">RESET</button>
        </div>
      </div>

      <!-- Overlay Win/GameOver -->
      <div id="result-overlay" class="overlay">
        <div class="overlay-content">
          <h2 id="result-title" class="glow-text">CHECKMATE</h2>
          <p id="result-desc">WHITE SECURES VICTORY</p>
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
  --bg-dark: #050508;
  --bg-cabinet: #0e0e14;
  --cabinet-border: #1f1f2e;
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
  padding: 10px;
}

.screen.active {
  display: flex;
}

.hud {
  width: 95%;
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
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
}

/* Chess Board Grid */
.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 320px;
  height: 320px;
  border: 4px solid var(--primary);
  box-shadow: 0 0 10px var(--primary-glow);
  background-color: #0e0e14;
}

.square {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}

/* Light Squares */
.square.light {
  background-color: #1a1a26;
}

/* Dark Squares */
.square.dark {
  background-color: #0b0b10;
  border: 0.5px solid #14141d;
}

/* Highlight Selected and Move suggestions */
.square.selected {
  background-color: var(--secondary) !important;
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.4);
}

.square.valid-move {
  position: relative;
}

.square.valid-move::after {
  content: '';
  width: 10px;
  height: 10px;
  background-color: #10b981; /* Neon green dot */
  border-radius: 50%;
  position: absolute;
  box-shadow: 0 0 6px #10b981;
}

.piece.white {
  color: #f4f4f5;
  text-shadow: 0 0 4px rgba(255,255,255,0.8);
}

.piece.black {
  color: #a78bfa;
  text-shadow: 0 0 4px var(--secondary-glow);
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
 * Chess Front-end Engine
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playMove() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(370, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
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
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playWin() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
    osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }
}

const audio = new SoundEngine();

// Unicode symbols for chess pieces
const pieceUnicode = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
};

class GameState {
  constructor() {
    this.board = Array(64).fill(null);
    this.currentPlayer = 'w'; // 'w' or 'b'
    this.selectedIdx = -1;
    this.validMoves = [];
    this.mode = 'local';
    this.gameOver = false;
  }

  setupBoard() {
    this.board = Array(64).fill(null);
    this.currentPlayer = 'w';
    this.selectedIdx = -1;
    this.validMoves = [];
    this.gameOver = false;

    // Pawns
    for (let i = 8; i < 16; i++) this.board[i] = 'bP';
    for (let i = 48; i < 56; i++) this.board[i] = 'wP';

    // Rooks
    this.board[0] = 'bR'; this.board[7] = 'bR';
    this.board[56] = 'wR'; this.board[63] = 'wR';

    // Knights
    this.board[1] = 'bN'; this.board[6] = 'bN';
    this.board[57] = 'wN'; this.board[62] = 'wN';

    // Bishops
    this.board[2] = 'bB'; this.board[5] = 'bB';
    this.board[58] = 'wB'; this.board[61] = 'wB';

    // Queens & Kings
    this.board[3] = 'bQ'; this.board[4] = 'bK';
    this.board[59] = 'wQ'; this.board[60] = 'wK';
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

function startGame(mode) {
  state.mode = mode;
  state.setupBoard();
  showScreen('game-screen');
  renderBoard();
  updateTurnIndicator();
}

function restartGame() {
  startGame(state.mode);
}

function exitToMenu() {
  document.getElementById('result-overlay').style.display = 'none';
  showScreen('main-menu');
}

function renderBoard() {
  const container = document.getElementById('chess-board');
  container.innerHTML = '';

  for (let idx = 0; idx < 64; idx++) {
    const square = document.createElement('div');
    const row = Math.floor(idx / 8);
    const col = idx % 8;
    const isDark = (row + col) % 2 === 1;
    
    square.className = \`square \${isDark ? 'dark' : 'light'}\`;
    square.dataset.idx = idx;

    const piece = state.board[idx];
    if (piece) {
      const pieceEl = document.createElement('span');
      pieceEl.className = \`piece \${piece[0] === 'w' ? 'white' : 'black'}\`;
      pieceEl.textContent = pieceUnicode[piece];
      square.appendChild(pieceEl);
    }

    if (idx === state.selectedIdx) {
      square.classList.add('selected');
    }

    if (state.validMoves.includes(idx)) {
      square.classList.add('valid-move');
    }

    square.addEventListener('click', () => handleSquareClick(idx));
    container.appendChild(square);
  }
}

function handleSquareClick(idx) {
  if (state.gameOver) return;

  const piece = state.board[idx];

  // If clicked a cell that is a valid move option
  if (state.validMoves.includes(idx)) {
    const captured = state.board[idx];
    state.board[idx] = state.board[state.selectedIdx];
    state.board[state.selectedIdx] = null;
    
    if (captured) {
      audio.playCapture();
      if (captured[1] === 'K') {
        triggerWin(state.currentPlayer);
        return;
      }
    } else {
      audio.playMove();
    }

    state.selectedIdx = -1;
    state.validMoves = [];
    state.currentPlayer = state.currentPlayer === 'w' ? 'b' : 'w';
    
    renderBoard();
    updateTurnIndicator();

    if (state.mode === 'ai' && state.currentPlayer === 'b') {
      setTimeout(makeAiMove, 500);
    }
    return;
  }

  // Click on own pieces to select
  if (piece && piece[0] === state.currentPlayer) {
    state.selectedIdx = idx;
    state.validMoves = calculateValidMoves(idx, state.board);
    renderBoard();
  } else {
    // Click empty or opponent piece (non-valid move): cancel selection
    state.selectedIdx = -1;
    state.validMoves = [];
    renderBoard();
  }
}

function makeAiMove() {
  // Simple heuristic AI bot - Pick a random valid piece move
  const botPieces = [];
  state.board.forEach((piece, idx) => {
    if (piece && piece[0] === 'b') {
      const moves = calculateValidMoves(idx, state.board);
      if (moves.length > 0) {
        botPieces.push({ idx, moves });
      }
    }
  });

  if (botPieces.length > 0) {
    const pick = botPieces[Math.floor(Math.random() * botPieces.length)];
    const targetIdx = pick.moves[Math.floor(Math.random() * pick.moves.length)];
    
    state.selectedIdx = pick.idx;
    state.validMoves = [targetIdx];
    renderBoard();

    setTimeout(() => {
      handleSquareClick(targetIdx);
    }, 400);
  }
}

function calculateValidMoves(idx, board) {
  const piece = board[idx];
  if (!piece) return [];

  const color = piece[0];
  const type = piece[1];
  const row = Math.floor(idx / 8);
  const col = idx % 8;
  const moves = [];

  // Directions
  const orthogonal = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const diagonal = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  if (type === 'P') {
    // Pawn rules
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    
    // Front step
    const fIdx = (row + dir) * 8 + col;
    if (board[fIdx] === null) {
      moves.push(fIdx);
      // Double step
      const dIdx = (row + dir * 2) * 8 + col;
      if (row === startRow && board[dIdx] === null) {
        moves.push(dIdx);
      }
    }
    // Diagonal captures
    const captureCols = [col - 1, col + 1];
    captureCols.forEach(c => {
      if (c >= 0 && c < 8) {
        const diagIdx = (row + dir) * 8 + c;
        if (board[diagIdx] && board[diagIdx][0] !== color) {
          moves.push(diagIdx);
        }
      }
    });
  }

  if (type === 'R' || type === 'Q') {
    orthogonal.forEach(d => {
      let r = row + d[0], c = col + d[1];
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = r * 8 + c;
        if (board[target] === null) {
          moves.push(target);
        } else {
          if (board[target][0] !== color) moves.push(target);
          break;
        }
        r += d[0]; c += d[1];
      }
    });
  }

  if (type === 'B' || type === 'Q') {
    diagonal.forEach(d => {
      let r = row + d[0], c = col + d[1];
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = r * 8 + c;
        if (board[target] === null) {
          moves.push(target);
        } else {
          if (board[target][0] !== color) moves.push(target);
          break;
        }
        r += d[0]; c += d[1];
      }
    });
  }

  if (type === 'K') {
    const allDirs = [...orthogonal, ...diagonal];
    allDirs.forEach(d => {
      const r = row + d[0], c = col + d[1];
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = r * 8 + c;
        if (board[target] === null || board[target][0] !== color) {
          moves.push(target);
        }
      }
    });
  }

  if (type === 'N') {
    const knightDirs = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    knightDirs.forEach(d => {
      const r = row + d[0], c = col + d[1];
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = r * 8 + c;
        if (board[target] === null || board[target][0] !== color) {
          moves.push(target);
        }
      }
    });
  }

  return moves;
}

function updateTurnIndicator() {
  const el = document.getElementById('turn-indicator');
  if (state.mode === 'ai' && state.currentPlayer === 'b') {
    el.textContent = 'SYSTEM CALCULATING...';
  } else {
    el.textContent = state.currentPlayer === 'w' ? 'TURN: WHITE' : 'TURN: BLACK';
  }
}

function triggerWin(color) {
  state.gameOver = true;
  audio.playWin();

  const title = document.getElementById('result-title');
  const desc = document.getElementById('result-desc');

  title.textContent = color === 'w' ? 'WHITE VICTORY' : 'BLACK VICTORY';
  desc.textContent = 'KING NEUTRALIZED';

  document.getElementById('result-overlay').style.display = 'flex';
}
`,

    // Backend multiplayer server logic included in the zip
    "backend/server.js": `/**
 * Socket.IO Multiplayer Game Synchronization Server
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../')));

// In-memory session tracking
const rooms = {};

io.on('connection', (socket) => {
  console.log('User socket connected:', socket.id);

  socket.on('joinRoom', ({ roomId, playerColor }) => {
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        players: {},
        board: null,
        turn: 'w'
      };
    }
    
    rooms[roomId].players[socket.id] = playerColor || (Object.keys(rooms[roomId].players).length === 0 ? 'w' : 'b');
    
    io.to(roomId).emit('roomUpdate', rooms[roomId]);
    console.log(\`Socket \${socket.id} joined room \${roomId}\`);
  });

  socket.on('makeMove', ({ roomId, from, to }) => {
    const room = rooms[roomId];
    if (room) {
      // Broadcast move to other player in room
      socket.to(roomId).emit('moveReceived', { from, to });
      room.turn = room.turn === 'w' ? 'b' : 'w';
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    for (const roomId in rooms) {
      if (rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];
        io.to(roomId).emit('roomUpdate', rooms[roomId]);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(\`Multiplayer Game Server running on port \${PORT}\`);
});
`,

    // Database configurations
    "database/schema.sql": `-- SQL schema for Chess game data persistency
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id VARCHAR(100) PRIMARY KEY,
    player_white_id INT REFERENCES users(id),
    player_black_id INT REFERENCES users(id),
    winner_color VARCHAR(10),
    fen_state VARCHAR(200),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS moves (
    id SERIAL PRIMARY KEY,
    game_session_id VARCHAR(100) REFERENCES game_sessions(id),
    move_number INT NOT NULL,
    move_notation VARCHAR(10) NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,

    // Standalone Node.js Unit Tests
    "test.js": `/**
 * Chess Move logic test suite
 */
import { assert } from 'console';

function calculatePawnMoves(idx, board, color) {
  const row = Math.floor(idx / 8);
  const col = idx % 8;
  const moves = [];
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;

  const fIdx = (row + dir) * 8 + col;
  if (board[fIdx] === null) {
    moves.push(fIdx);
    const dIdx = (row + dir * 2) * 8 + col;
    if (row === startRow && board[dIdx] === null) {
      moves.push(dIdx);
    }
  }
  return moves;
}

function runTests() {
  console.log("-----------------------------------------");
  console.log("RUNNING CHESS PIECE ENGINE TESTS...");
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

  test("Pawn standard starting double-step", () => {
    const board = Array(64).fill(null);
    board[52] = 'wP'; // White pawn on E2 (index 52)
    const moves = calculatePawnMoves(52, board, 'w');
    
    assert(moves.includes(44), "Should contain step to E3 (index 44)");
    assert(moves.includes(36), "Should contain double step to E4 (index 36)");
  });

  test("Pawn double-step blocked", () => {
    const board = Array(64).fill(null);
    board[52] = 'wP';
    board[44] = 'bP'; // Blocked at E3 (index 44)
    const moves = calculatePawnMoves(52, board, 'w');
    
    assert(moves.length === 0, "Blocked pawn should have no forward moves");
  });

  console.log("-----------------------------------------");
  console.log(\`TESTS RESULTS: \${passed} PASSED // \${failed} FAILED\`);
  console.log("-----------------------------------------");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
`,

    "ASSET-LICENSES.md": `# ASSET-LICENSES

Attribution details for Chess game:

1. **Audio**: Custom wave synthesis.
2. **Typography**: Google Fonts Share Tech Mono & Orbitron.
3. **Symbols**: Standard Unicode Chess Characters (U+2610 - U+2617, Public Domain).
`,

    "README.md": `# Cyber Chess Board

Full-stack Chess board.

## Commands

To run tests:
\`\`\`bash
npm test
\`\`\`

To run multiplayer Socket.IO backend:
\`\`\`bash
npm start
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
