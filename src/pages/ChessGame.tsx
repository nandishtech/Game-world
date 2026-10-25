import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Trophy, ShieldAlert, Zap, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Piece {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
  color: 'w' | 'b';
}

type ChessBoardState = (Piece | null)[][];

const INITIAL_BOARD: ChessBoardState = [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ]
];

const PIECE_SYMBOLS: Record<string, string> = {
  w_p: '♙', w_r: '♖', w_n: '♘', w_b: '♗', w_q: '♕', w_k: '♔',
  b_p: '♟', b_r: '♜', b_n: '♞', b_b: '♝', b_q: '♛', b_k: '♚'
};

class ChessAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playMove() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playCapture() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  playCheck() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(443, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.3);
    osc2.stop(this.ctx.currentTime + 0.3);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.15, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.45);
    });
  }
}

const audio = new ChessAudio();

export const ChessGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user } = useAuthStore();

  const [board, setBoard] = useState<ChessBoardState>(INITIAL_BOARD);
  const [selectedSquare, setSelectedSquare] = useState<{ r: number; c: number } | null>(null);
  const [validMoves, setValidMoves] = useState<{ r: number; c: number }[]>([]);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameLogs, setGameLogs] = useState<string[]>(['Match initialized. Ready for deployment.']);
  const [winner, setWinner] = useState<'w' | 'b' | null>(null);
  const [evalScore, setEvalScore] = useState(0); // Pos = white advantage, Neg = black advantage
  const [lastMove, setLastMove] = useState<{ from: { r: number; c: number }; to: { r: number; c: number } } | null>(null);

  // Chess clocks state
  const [clocks, setClocks] = useState({ w: 300, b: 300 }); // Default 5 min
  const clockInterval = useRef<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audio.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const parent = logContainerRef.current;
    if (parent) {
      parent.scrollTop = parent.scrollHeight;
    }
  }, [gameLogs]);

  // Clocks countdown hook
  useEffect(() => {
    if (winner) return;

    clockInterval.current = setInterval(() => {
      setClocks((prev) => {
        if (isWhiteTurn) {
          const nextVal = Math.max(0, prev.w - 1);
          if (nextVal <= 0) handleGameEnd('b'); // Time out loss
          return { ...prev, w: nextVal };
        } else {
          const nextVal = Math.max(0, prev.b - 1);
          if (nextVal <= 0) handleGameEnd('w');
          return { ...prev, b: nextVal };
        }
      });
    }, 1000);

    return () => {
      if (clockInterval.current) clearInterval(clockInterval.current);
    };
  }, [isWhiteTurn, winner]);

  // Starfield particle background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random()
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Radial neon gradient
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, Math.min(width, height) * 0.7);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, Math.min(width, height) * 0.7, 0, Math.PI * 2);
      ctx.fill();

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > width) p.x = Math.random() * width;
        if (p.y < 0 || p.y > height) p.y = Math.random() * height;
        ctx.fillStyle = `rgba(182, 196, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // AI turn automation trigger
  useEffect(() => {
    if (!isWhiteTurn && !winner) {
      const delay = setTimeout(() => {
        makeAIMove();
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [isWhiteTurn, winner]);

  // Helper move generation validation
  const getMovesForPiece = (r: number, c: number, currentBoard: ChessBoardState): { r: number; c: number }[] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];

    const moves: { r: number; c: number }[] = [];
    const color = piece.color;
    const opponent = color === 'w' ? 'b' : 'w';

    const addMove = (targetR: number, targetC: number): boolean => {
      if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) return false;
      const targetCell = currentBoard[targetR][targetC];
      if (!targetCell) {
        moves.push({ r: targetR, c: targetC });
        return true;
      }
      if (targetCell.color === opponent) {
        moves.push({ r: targetR, c: targetC });
      }
      return false; // Blocked by piece
    };

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        // Move 1 forward
        if (r + dir >= 0 && r + dir < 8 && !currentBoard[r + dir][c]) {
          moves.push({ r: r + dir, c });
          // Move 2 forward if start position
          const startRow = color === 'w' ? 6 : 1;
          if (r === startRow && !currentBoard[r + dir][c] && !currentBoard[r + 2 * dir][c]) {
            moves.push({ r: r + 2 * dir, c });
          }
        }
        // Diagonal Captures
        for (const dc of [-1, 1]) {
          const targetR = r + dir;
          const targetC = c + dc;
          if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
            const targetCell = currentBoard[targetR][targetC];
            if (targetCell && targetCell.color === opponent) {
              moves.push({ r: targetR, c: targetC });
            }
          }
        }
        break;
      }
      case 'r': {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
          let step = 1;
          while (true) {
            const targetR = r + dr * step;
            const targetC = c + dc * step;
            if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) break;
            const targetCell = currentBoard[targetR][targetC];
            if (!targetCell) {
              moves.push({ r: targetR, c: targetC });
            } else {
              if (targetCell.color === opponent) moves.push({ r: targetR, c: targetC });
              break; // Blocked
            }
            step++;
          }
        }
        break;
      }
      case 'b': {
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of directions) {
          let step = 1;
          while (true) {
            const targetR = r + dr * step;
            const targetC = c + dc * step;
            if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) break;
            const targetCell = currentBoard[targetR][targetC];
            if (!targetCell) {
              moves.push({ r: targetR, c: targetC });
            } else {
              if (targetCell.color === opponent) moves.push({ r: targetR, c: targetC });
              break; // Blocked
            }
            step++;
          }
        }
        break;
      }
      case 'n': {
        const jumps = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of jumps) {
          addMove(r + dr, c + dc);
        }
        break;
      }
      case 'q': {
        const directions = [
          [-1, 0], [1, 0], [0, -1], [0, 1],
          [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        for (const [dr, dc] of directions) {
          let step = 1;
          while (true) {
            const targetR = r + dr * step;
            const targetC = c + dc * step;
            if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) break;
            const targetCell = currentBoard[targetR][targetC];
            if (!targetCell) {
              moves.push({ r: targetR, c: targetC });
            } else {
              if (targetCell.color === opponent) moves.push({ r: targetR, c: targetC });
              break; // Blocked
            }
            step++;
          }
        }
        break;
      }
      case 'k': {
        const directions = [
          [-1, 0], [1, 0], [0, -1], [0, 1],
          [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        for (const [dr, dc] of directions) {
          addMove(r + dr, c + dc);
        }
        break;
      }
    }

    return moves;
  };

  const selectSquare = (r: number, c: number) => {
    if (winner || !isWhiteTurn) return;

    const isMove = validMoves.some(mv => mv.r === r && mv.c === c);
    if (isMove && selectedSquare) {
      executePlayerMove(selectedSquare.r, selectedSquare.c, r, c);
      return;
    }

    const cell = board[r][c];
    if (cell && cell.color === 'w') {
      setSelectedSquare({ r, c });
      setValidMoves(getMovesForPiece(r, c, board));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const executePlayerMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    const piece = board[fromR][fromC];
    const target = board[toR][toC];
    if (!piece) return;

    const newBoard = board.map(row => [...row]);
    newBoard[toR][toC] = piece;
    newBoard[fromR][fromC] = null;

    // Check last move highlights
    setLastMove({ from: { r: fromR, c: fromC }, to: { r: toR, c: toC } });

    if (target) {
      audio.playCapture();
      addLog(`White ${piece.type.toUpperCase()} captured Black ${target.type.toUpperCase()} at ${getNotation(toR, toC)}.`);
    } else {
      audio.playMove();
      addLog(`White ${piece.type.toUpperCase()} moved to ${getNotation(toR, toC)}.`);
    }

    // Pawn Promotion
    if (piece.type === 'p' && toR === 0) {
      newBoard[toR][toC] = { type: 'q', color: 'w' };
      addLog('White Pawn promoted to Queen!');
    }

    setBoard(newBoard);
    setSelectedSquare(null);
    setValidMoves([]);

    // Update real-time evaluation balance bar
    const score = evaluateBoard(newBoard);
    setEvalScore(score);

    if (isKingCaptured(newBoard, 'b')) {
      handleGameEnd('w');
      return;
    }

    setIsWhiteTurn(false);
  };

  const isKingCaptured = (tempBoard: ChessBoardState, color: 'w' | 'b'): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = tempBoard[r][c];
        if (piece && piece.type === 'k' && piece.color === color) return false;
      }
    }
    return true;
  };

  const evaluateBoard = (tempBoard: ChessBoardState): number => {
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000 };
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = tempBoard[r][c];
        if (piece) {
          const val = values[piece.type] || 0;
          if (piece.color === 'w') score += val;
          else score -= val;
        }
      }
    }
    return score;
  };

  const makeAIMove = () => {
    const aiMoves: { fromR: number; fromC: number; toR: number; toC: number; score: number }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === 'b') {
          const moves = getMovesForPiece(r, c, board);
          for (const mv of moves) {
            const nextBoard = board.map(row => [...row]);
            nextBoard[mv.r][mv.c] = piece;
            nextBoard[r][c] = null;

            const score = evaluateBoard(nextBoard);
            aiMoves.push({ fromR: r, fromC: c, toR: mv.r, toC: mv.c, score });
          }
        }
      }
    }

    if (aiMoves.length === 0) {
      handleGameEnd('w');
      return;
    }

    // Sort: Black wants lower scores (negative ELO evaluation)
    aiMoves.sort((a, b) => a.score - b.score);

    const bestScore = aiMoves[0].score;
    const topMoves = aiMoves.filter(mv => mv.score <= bestScore + 0.5);
    const chosenMove = topMoves[Math.floor(Math.random() * topMoves.length)];

    const aiPiece = board[chosenMove.fromR][chosenMove.fromC]!;
    const targetPiece = board[chosenMove.toR][chosenMove.toC];

    const newBoard = board.map(row => [...row]);
    newBoard[chosenMove.toR][chosenMove.toC] = aiPiece;
    newBoard[chosenMove.fromR][chosenMove.fromC] = null;

    setLastMove({ from: { r: chosenMove.fromR, c: chosenMove.fromC }, to: { r: chosenMove.toR, c: chosenMove.toC } });

    if (aiPiece.type === 'p' && chosenMove.toR === 7) {
      newBoard[chosenMove.toR][chosenMove.toC] = { type: 'q', color: 'b' };
    }

    setBoard(newBoard);

    // Update evaluation bar
    const score = evaluateBoard(newBoard);
    setEvalScore(score);

    if (targetPiece) {
      audio.playCapture();
      addLog(`Black ${aiPiece.type.toUpperCase()} captured White ${targetPiece.type.toUpperCase()} at ${getNotation(chosenMove.toR, chosenMove.toC)}.`);
    } else {
      audio.playMove();
      addLog(`Black ${aiPiece.type.toUpperCase()} moved to ${getNotation(chosenMove.toR, chosenMove.toC)}.`);
    }

    if (isKingCaptured(newBoard, 'w')) {
      handleGameEnd('b');
      return;
    }

    setIsWhiteTurn(true);
  };

  const handleGameEnd = (result: 'w' | 'b') => {
    setWinner(result);
    if (result === 'w') {
      audio.playWin();
      addLog('VICTORY! White checkmated Black.');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } else {
      audio.playCheck();
      addLog('DEFEAT. Black checkmated White.');
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setSelectedSquare(null);
    setValidMoves([]);
    setIsWhiteTurn(true);
    setWinner(null);
    setEvalScore(0);
    setLastMove(null);
    setClocks({ w: 300, b: 300 });
    setGameLogs(['Game reset. Deploying cyber grids.']);
  };

  const addLog = (msg: string) => {
    setGameLogs(prev => [...prev, msg]);
  };

  const getNotation = (r: number, c: number): string => {
    const file = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][c];
    const rank = 8 - r;
    return `${file}${rank}`;
  };

  const formatClockTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const s = secs % 60;
    return `${min}:${s < 10 ? '0' : ''}${s}`;
  };

  // Convert eval score into a bar percentage (clamped between 0 and 100)
  // Zero = center (50%), White winning goes up to 100%, Black winning goes down to 0%
  const whiteAdvantagePercent = Math.max(5, Math.min(95, 50 + evalScore * 5));

  return (
    <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] overflow-x-hidden flex flex-col justify-between'}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Top Header */}
      {!isStandalone && (
      <header className="relative z-10 max-w-5xl w-full mx-auto px-margin-mobile flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/library')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">CHESS MASTERS</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 8x8 • Hologram Mode</p>
          </div>
        </div>

        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-on-surface-variant" />}
        </button>
      </header>


      )}

      {/* Main Board Arena */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-margin-mobile grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Player Cards & Board */}
        <div className="lg:col-span-8 flex flex-col gap-4 items-center">
          
          {/* Opponent Info Bar (Above Board) */}
          <div className="w-full max-w-[440px] flex justify-between items-center bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-pink-400" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">NEXUS_AI</span>
                  <span className="bg-red-500/25 text-red-400 text-[8px] px-1 rounded font-bold uppercase">BOT</span>
                </div>
                <div className="text-[9px] text-on-surface-variant uppercase tracking-wider">ELO 1850</div>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-lg border ${!isWhiteTurn ? 'border-pink-500/40 bg-pink-500/5 shadow-[0_0_10px_rgba(236,72,153,0.15)] animate-pulse' : 'border-white/5 bg-black/25'}`}>
              <span className={`font-mono text-sm leading-none ${!isWhiteTurn ? 'text-pink-400 font-bold' : 'text-on-surface-variant'}`}>{formatClockTime(clocks.b)}</span>
            </div>
          </div>

          <div className="flex gap-4 items-center justify-center relative w-full">
            {/* Vertical Evaluation balance meter */}
            <div className="w-2 h-[380px] rounded-full bg-[#EC4899] shadow-[0_0_10px_rgba(236,72,153,0.2)] relative overflow-hidden flex flex-col justify-end">
              <div 
                style={{ height: `${whiteAdvantagePercent}%` }}
                className="w-full bg-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all duration-500"
              />
            </div>

            <div className="relative">
              {/* Ranks 1..8 Labels (Left border) */}
              <div className="absolute -left-5 top-0 bottom-0 flex flex-col justify-around text-[9px] font-bold text-on-surface-variant z-10 select-none">
                {[8,7,6,5,4,3,2,1].map(n => <span key={n}>{n}</span>)}
              </div>

              {/* Chess board frame */}
              <div className="w-full max-w-[440px] aspect-square bg-[#0b1326]/40 p-2 rounded-3xl border border-white/10 shadow-2xl relative">
                <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0.5 overflow-hidden rounded-xl border border-white/5 bg-[#706659]">
                  {board.map((row, rIdx) => 
                    row.map((cell, cIdx) => {
                      const isDarkSquare = (rIdx + cIdx) % 2 === 1;
                      const isSelected = selectedSquare?.r === rIdx && selectedSquare?.c === cIdx;
                      const isValidDest = validMoves.some(mv => mv.r === rIdx && mv.c === cIdx);
                      
                      // Highlight last move squares
                      const isLastMove = lastMove?.from.r === rIdx && lastMove?.from.c === cIdx ||
                                         lastMove?.to.r === rIdx && lastMove?.to.c === cIdx;

                      return (
                        <button
                          key={`${rIdx}-${cIdx}`}
                          onClick={() => selectSquare(rIdx, cIdx)}
                          className={`relative flex items-center justify-center transition-all cursor-pointer aspect-square ${
                            isDarkSquare ? 'bg-[#706659]' : 'bg-[#EDEED1]'
                          } ${
                            isSelected 
                              ? 'ring-2 ring-primary bg-primary/20 shadow-[0_0_15px_rgba(77,142,255,0.4)] z-10' 
                              : isValidDest 
                              ? 'ring-2 ring-emerald-500/50 bg-emerald-500/10 z-10' 
                              : isLastMove 
                              ? 'ring-1.5 ring-amber-400/40 bg-amber-400/5'
                              : ''
                          }`}
                        >
                          {/* Piece Symbols */}
                          {cell && (
                            <span className={`text-4xl select-none leading-none transition-transform active:scale-95 ${
                              cell.color === 'w' 
                                ? 'text-primary drop-shadow-[0_0_8px_rgba(182,196,255,0.7)] font-bold' 
                                : 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]'
                            }`}>
                              {PIECE_SYMBOLS[`${cell.color}_${cell.type}`]}
                            </span>
                          )}
                          
                          {/* Target dots */}
                          {!cell && isValidDest && (
                            <div className="w-2.5 h-2.5 bg-emerald-500/50 rounded-full animate-pulse" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Files A..H Labels (Bottom border) */}
              <div className="absolute -bottom-5 left-0 right-0 flex justify-around text-[9px] font-bold text-on-surface-variant z-10 select-none px-2">
                {['A','B','C','D','E','F','G','H'].map(l => <span key={l}>{l}</span>)}
              </div>
            </div>
          </div>

          {/* User Info Bar (Below Board) */}
          <div className="w-full max-w-[440px] flex justify-between items-center bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center overflow-hidden">
                <img src={user?.avatarUrl} className="w-full h-full object-cover" alt="User Avatar" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{user?.username || 'COMMANDER'}</span>
                </div>
                <div className="text-[9px] text-on-surface-variant uppercase tracking-wider">ELO {user?.stats.rank || 1500}</div>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-lg border-2 ${isWhiteTurn ? 'border-primary bg-primary/5 shadow-[0_0_10px_rgba(238,204,131,0.25)] animate-pulse' : 'border-white/5 bg-black/25'}`}>
              <span className={`font-mono text-sm leading-none ${isWhiteTurn ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{formatClockTime(clocks.w)}</span>
            </div>
          </div>

        </div>

        {/* Right Col: Move History & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4 w-full h-full">
          
          <Card level={3} className="p-5 flex-grow flex flex-col border border-white/5 bg-black/30 h-[340px]">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5 mb-3">Tactical Log Feed</span>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto space-y-2.5 text-[10px] font-mono text-on-surface-variant pr-1 scrollbar-thin">
              {gameLogs.map((log, idx) => (
                <div key={idx} className="border-l border-primary/20 pl-2 py-0.5">{log}</div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button
              onClick={() => handleGameEnd('b')} // Resign counts as loss
              className="py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-colors active:scale-95"
            >
              RESIGN
            </button>
            <button
              onClick={resetGame}
              className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-colors active:scale-95"
            >
              RESTART
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};
