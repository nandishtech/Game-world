import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { useBoardGameEngine } from '../engine/useBoardGameEngine';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

type Disc = 'w' | 'b' | null;
type OthelloBoard = Disc[][];

interface OthelloMove {
  r: number;
  c: number;
}

class OthelloAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
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
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.12, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }
}

const audio = new OthelloAudio();

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export const OthelloGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState(['Session initialized. Center nodes deployed.']);
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
  }, [logs]);

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

  // Helper validation: gathers trapped opponent discs along direction vectors
  const getFlippedDiscsForMove = (board: OthelloBoard, r: number, c: number, color: 'w' | 'b'): OthelloMove[] => {
    if (board[r][c] !== null) return [];
    
    const opponent = color === 'w' ? 'b' : 'w';
    const flipped: OthelloMove[] = [];

    for (const [dr, dc] of DIRECTIONS) {
      const dirFlipped: OthelloMove[] = [];
      let step = 1;

      while (true) {
        const nextR = r + dr * step;
        const nextC = c + dc * step;

        if (nextR < 0 || nextR >= 8 || nextC < 0 || nextC >= 8) break;
        const cell = board[nextR][nextC];

        if (cell === opponent) {
          dirFlipped.push({ r: nextR, c: nextC });
        } else if (cell === color) {
          if (dirFlipped.length > 0) {
            flipped.push(...dirFlipped);
          }
          break;
        } else {
          break; // Empty cell
        }
        step++;
      }
    }

    return flipped;
  };

  const getValidMovesList = (board: OthelloBoard, color: 'w' | 'b'): OthelloMove[] => {
    const valid: OthelloMove[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (getFlippedDiscsForMove(board, r, c, color).length > 0) {
          valid.push({ r, c });
        }
      }
    }
    return valid;
  };

  // Board Game Engine Integration
  const {
    boardState,
    players,
    activePlayerIndex,
    gameState,
    winnerIndex,
    setupGame,
    makeMove
  } = useBoardGameEngine<OthelloBoard, OthelloMove>({
    gameName: 'Othello',
    initialBoardState: () => {
      const b = Array(8).fill(null).map(() => Array(8).fill(null));
      b[3][3] = 'w';
      b[3][4] = 'b';
      b[4][3] = 'b';
      b[4][4] = 'w';
      return b;
    },
    getValidMoves: (pIdx, board) => {
      const color = pIdx === 0 ? 'w' : 'b';
      return getValidMovesList(board, color);
    },
    applyMove: (board, move, pIdx) => {
      const nextBoard = board.map(r => [...r]);
      const color = pIdx === 0 ? 'w' : 'b';
      const flipped = getFlippedDiscsForMove(board, move.r, move.c, color);
      
      nextBoard[move.r][move.c] = color;
      flipped.forEach((f) => {
        nextBoard[f.r][f.c] = color;
      });
      return nextBoard;
    },
    checkWin: (board, pIdx) => {
      // Check if neither player has valid moves
      const p1Valid = getValidMovesList(board, 'w').length;
      const p2Valid = getValidMovesList(board, 'b').length;
      if (p1Valid === 0 && p2Valid === 0) {
        // Count pieces
        let whiteCount = 0;
        let blackCount = 0;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] === 'w') whiteCount++;
            if (board[r][c] === 'b') blackCount++;
          }
        }
        if (pIdx === 0 && whiteCount > blackCount) return true;
        if (pIdx === 1 && blackCount > whiteCount) return true;
      }
      return false;
    },
    checkDraw: (board) => {
      const p1Valid = getValidMovesList(board, 'w').length;
      const p2Valid = getValidMovesList(board, 'b').length;
      if (p1Valid === 0 && p2Valid === 0) {
        let whiteCount = 0;
        let blackCount = 0;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] === 'w') whiteCount++;
            if (board[r][c] === 'b') blackCount++;
          }
        }
        return whiteCount === blackCount;
      }
      return false;
    }
  });

  const initGame = () => {
    setupGame([
      { id: 'player_user', name: user?.username || 'Vortex', avatar: user?.avatarUrl || '', color: 'blue', rank: user?.stats.rank || 1500, isBot: false, timeRemaining: 300 },
      { id: 'bot_othello', name: 'NEXUS_AI', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKS2zywQA4tK355lM3NQI0J9G2IHRAwGhAcGCxIowggFAtPbrbkE4uZ6RXasRg0y3cYws8sPtCTfhW0ZEBnmU917mUVLq4A673waOp4lB51a_RGkLJO9GI3Pe5nIEXMSdgCZsGpXTarGFElfWWgzQk6Nbvq7GDDQquP9E5lktR164m09RKkBzEtfWPvXWphBg8bM2fdcKZAfdcg0ljWKiPOS7ebdLdAAxl8XAb5QNROiq62LgKTvFn', color: 'pink', rank: 1450, isBot: true, timeRemaining: 300 }
    ], 300);
    setLogs(['Session started. Trapped pieces flip color profiles.']);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Pass turn automatic loop check
  useEffect(() => {
    if (gameState !== 'playing') return;
    const color = activePlayerIndex === 0 ? 'w' : 'b';
    const moves = getValidMovesList(boardState, color);

    if (moves.length === 0) {
      // Automatic pass
      const opponent = color === 'w' ? 'b' : 'w';
      const opponentMoves = getValidMovesList(boardState, opponent);
      if (opponentMoves.length === 0) {
        // Double pass - end game
        setLogs(prev => [...prev, 'Neither player has valid moves. Finalizing scores.']);
      } else {
        setLogs(prev => [...prev, `${color === 'w' ? 'You have' : 'AI has'} no valid moves. Passing turn.`]);
        // Trigger dummy move or let engine swap activePlayerIndex
        makeMove(activePlayerIndex, { r: -1, c: -1 }, 'Pass Turn'); // Note: handle pass inside makeMove fallback
      }
    }
  }, [activePlayerIndex, gameState]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (winnerIndex === 0) {
        audio.playWin();
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
        setLogs(prev => [...prev, 'VICTORY! Sector secured. +150 XP rewarded.']);
      } else if (winnerIndex === 1) {
        audio.playFlip();
        setLogs(prev => [...prev, 'Session Lost. AI secured grid connection.']);
      }
    }
  }, [gameState, winnerIndex]);

  const selectSquare = (r: number, c: number) => {
    if (gameState !== 'playing' || players[activePlayerIndex]?.isBot) return;

    audio.playFlip();
    const success = makeMove(0, { r, c }, `Place stone at ${r},${c}`);
    if (success) {
      setLogs(prev => [...prev, `Placed disc at cell ${r + 1}, ${c + 1}.`]);
    }
  };

  // Score count counters
  let whiteCount = 0;
  let blackCount = 0;
  boardState.forEach(row => row.forEach(cell => {
    if (cell === 'w') whiteCount++;
    if (cell === 'b') blackCount++;
  }));

  const playerColor = activePlayerIndex === 0 ? 'w' : 'b';
  const userValidMoves = gameState === 'playing' && activePlayerIndex === 0 ? getValidMovesList(boardState, 'w') : [];

  return (
    <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] overflow-x-hidden flex flex-col justify-between'}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Top Header */}
      {!isStandalone && (
      <header className="relative z-10 max-w-4xl w-full mx-auto px-margin-mobile flex justify-between items-center py-4 border-b border-white/5 bg-black/44 backdrop-blur-md rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/library')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">OTHELLO</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 8x8 • Disc Flip Mode</p>
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
        
        {/* Left: Othello board */}
        <div className="lg:col-span-8 flex flex-col items-center gap-6">
          {gameState === 'finished' && (
            <div className="w-full p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between shadow-xl">
              <span className="text-sm font-bold">
                {winnerIndex === 0 ? 'Tactical victory registered! +150 XP' : 'Mission failed. AI secured connection.'}
              </span>
              <button 
                onClick={initGame}
                className="px-4 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:scale-105 active:scale-95 transition-transform"
              >
                RELAUNCH
              </button>
            </div>
          )}

          {/* Othello 8x8 Grid */}
          <div className="w-full max-w-[460px] aspect-square bg-[#0b1326]/40 p-3 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-8 grid-rows-8 gap-1 w-full h-full">
              {boardState.map((row, rIdx) => 
                row.map((cell, cIdx) => {
                  const isValid = userValidMoves.some(mv => mv.r === rIdx && mv.c === cIdx);
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      disabled={!isValid}
                      onClick={() => selectSquare(rIdx, cIdx)}
                      className={`relative flex items-center justify-center aspect-square transition-all border border-white/5 bg-[#0f192e]/60 hover:bg-[#1b2640]/60 ${
                        isValid ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5 cursor-pointer z-10' : ''
                      }`}
                    >
                      {/* Discs */}
                      {cell === 'w' && (
                        <div className="w-4/5 h-4/5 rounded-full bg-primary shadow-[0_0_10px_#3B82F6] border border-white/20" />
                      )}
                      {cell === 'b' && (
                        <div className="w-4/5 h-4/5 rounded-full bg-pink-500 shadow-[0_0_10px_#EC4899] border border-white/15" />
                      )}
                      {/* Valid move target dots */}
                      {!cell && isValid && (
                        <div className="w-2.5 h-2.5 bg-emerald-500/40 rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Scores / Comms */}
        <div className="lg:col-span-4 flex flex-col gap-4 w-full">
          {/* Counters */}
          <div className="grid grid-cols-2 gap-4 w-full text-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <div>
              <p className="text-[10px] text-primary font-bold uppercase">YOU (CYAN)</p>
              <h4 className="font-headline-lg text-lg text-white mt-1">{whiteCount}</h4>
            </div>
            <div>
              <p className="text-[10px] text-pink-500 font-bold uppercase">AI (PINK)</p>
              <h4 className="font-headline-lg text-lg text-white mt-1">{blackCount}</h4>
            </div>
          </div>

          <Card level={3} className="p-5 h-[270px] flex flex-col border border-white/5 bg-black/30">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5 mb-3">Tactical Log Feed</span>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto space-y-2.5 text-[10px] font-mono text-on-surface-variant pr-1 scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className="border-l border-primary/20 pl-2 py-0.5">{log}</div>
              ))}
            </div>
          </Card>
        </div>

      </main>
    </div>
  );
};
