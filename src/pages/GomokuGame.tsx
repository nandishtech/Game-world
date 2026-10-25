import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { useBoardGameEngine } from '../engine/useBoardGameEngine';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

type Stone = 'w' | 'b' | null;
type GomokuBoard = Stone[][]; // 15x15 grid

interface GomokuMove {
  r: number;
  c: number;
}

class GomokuAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playPlace() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
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

const audio = new GomokuAudio();

export const GomokuGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState(['Session initialized. Grid matrix 15x15.']);
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

  // Board Game Engine Integration
  const {
    boardState,
    players,
    activePlayerIndex,
    gameState,
    winnerIndex,
    setupGame,
    makeMove
  } = useBoardGameEngine<GomokuBoard, GomokuMove>({
    gameName: 'Gomoku',
    initialBoardState: () => Array(15).fill(null).map(() => Array(15).fill(null)),
    getValidMoves: (pIdx, board) => {
      const valid: GomokuMove[] = [];
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          if (board[r][c] === null) valid.push({ r, c });
        }
      }
      return valid;
    },
    applyMove: (board, move, pIdx) => {
      const nextBoard = board.map(r => [...r]);
      nextBoard[move.r][move.c] = pIdx === 0 ? 'w' : 'b';
      return nextBoard;
    },
    checkWin: (board, pIdx) => {
      const stone = pIdx === 0 ? 'w' : 'b';

      const checkDirection = (startR: number, startC: number, dr: number, dc: number): boolean => {
        let count = 0;
        for (let i = 0; i < 5; i++) {
          const r = startR + dr * i;
          const c = startC + dc * i;
          if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === stone) {
            count++;
          } else {
            break;
          }
        }
        return count === 5;
      };

      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          if (board[r][c] !== stone) continue;
          if (checkDirection(r, c, 0, 1)) return true; // Horizontal
          if (checkDirection(r, c, 1, 0)) return true; // Vertical
          if (checkDirection(r, c, 1, 1)) return true; // Diagonal down-right
          if (checkDirection(r, c, -1, 1)) return true; // Diagonal up-right
        }
      }
      return false;
    },
    checkDraw: (board) => {
      return board.every(row => row.every(cell => cell !== null));
    }
  });

  const initGame = () => {
    setupGame([
      { id: 'player_user', name: user?.username || 'Vortex', avatar: user?.avatarUrl || '', color: 'blue', rank: user?.stats.rank || 1500, isBot: false, timeRemaining: 300 },
      { id: 'bot_gomoku', name: 'NEXUS_BOT', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKS2zywQA4tK355lM3NQI0J9G2IHRAwGhAcGCxIowggFAtPbrbkE4uZ6RXasRg0y3cYws8sPtCTfhW0ZEBnmU917mUVLq4A673waOp4lB51a_RGkLJO9GI3Pe5nIEXMSdgCZsGpXTarGFElfWWgzQk6Nbvq7GDDQquP9E5lktR164m09RKkBzEtfWPvXWphBg8bM2fdcKZAfdcg0ljWKiPOS7ebdLdAAxl8XAb5QNROiq62LgKTvFn', color: 'pink', rank: 1400, isBot: true, timeRemaining: 300 }
    ], 300);
    setLogs(['Session started. Align 5 stones in a row to capture grid sector.']);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const activePlayer = players[activePlayerIndex];
    if (activePlayer) {
      setLogs(prev => [...prev, `${activePlayer.name}'s turn to act.`]);
    }
  }, [activePlayerIndex, gameState]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (winnerIndex === 0) {
        audio.playWin();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setLogs(prev => [...prev, 'VICTORY! Sector secured. +150 XP rewarded.']);
      } else if (winnerIndex === 1) {
        audio.playPlace();
        setLogs(prev => [...prev, 'Session Lost. AI secured grid connection.']);
      }
    }
  }, [gameState, winnerIndex]);

  const selectIntersection = (r: number, c: number) => {
    if (gameState !== 'playing' || boardState[r][c] !== null || players[activePlayerIndex]?.isBot) return;

    audio.playPlace();
    const success = makeMove(0, { r, c }, `Place stone at ${r},${c}`);
    if (success) {
      setLogs(prev => [...prev, `Placed stone at cell ${r + 1}, ${c + 1}.`]);
    }
  };

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
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">GOMOKU</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 15x15 • Five-in-a-Row</p>
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
        
        {/* Left: Gomoku Board */}
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

          {/* 15x15 Intersection Grid */}
          <div className="w-full max-w-[480px] aspect-square bg-[#0b1326]/40 p-3 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-15 grid-rows-15 gap-0.5 w-full h-full">
              {boardState.map((row, rIdx) => 
                row.map((cell, cIdx) => (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    disabled={gameState !== 'playing' || cell !== null}
                    onClick={() => selectIntersection(rIdx, cIdx)}
                    className="relative flex items-center justify-center aspect-square transition-all border border-white/5 bg-black/20 hover:bg-primary/5 cursor-pointer"
                  >
                    {/* Stones */}
                    {cell === 'w' && (
                      <div className="w-4/5 h-4/5 rounded-full bg-primary shadow-[0_0_8px_#3B82F6] border border-white/20 animate-pulse" />
                    )}
                    {cell === 'b' && (
                      <div className="w-4/5 h-4/5 rounded-full bg-pink-500 shadow-[0_0_8px_#EC4899] border border-white/15 animate-pulse" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Comms Log */}
        <div className="lg:col-span-4 flex flex-col gap-4 w-full">
          <Card level={3} className="p-5 h-[340px] flex flex-col border border-white/5 bg-black/30">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5 mb-3">Tactical Log Feed</span>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto space-y-2.5 text-[10px] font-mono text-on-surface-variant pr-1 scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className="border-l border-primary/20 pl-2 py-0.5">{log}</div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${activePlayerIndex === 0 && gameState === 'playing' ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
                You: Cyan
              </span>
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${activePlayerIndex === 1 && gameState === 'playing' ? 'bg-pink-500 animate-pulse' : 'bg-white/10'}`} />
                Bot: Pink
              </span>
            </div>
          </Card>
        </div>

      </main>
    </div>
  );
};
