/**
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
    
    square.className = `square ${isDark ? 'dark' : 'light'}`;
    square.dataset.idx = idx;

    const piece = state.board[idx];
    if (piece) {
      const pieceEl = document.createElement('span');
      pieceEl.className = `piece ${piece[0] === 'w' ? 'white' : 'black'}`;
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
