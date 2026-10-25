import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { useBoardGameEngine } from '../engine/useBoardGameEngine';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayerPos {
  user: number;
  bot: number;
}

class SLGameAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playRoll() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  playLadder() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [300, 450, 600, 900]; // Climbing arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  playSnake() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.4); // Slide down
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
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

const audio = new SLGameAudio();

// Board Mappings
const SNAKES: Record<number, number> = {
  17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78
};

const LADDERS: Record<number, number> = {
  4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91, 80: 99
};

export const SnakesLaddersGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState(['Session started. Roll dice to advance.']);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
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
  } = useBoardGameEngine<PlayerPos, number>({
    gameName: 'Snakes & Ladders',
    initialBoardState: () => ({ user: 0, bot: 0 }),
    getValidMoves: (pIdx, board) => {
      // Moves are simulated rolls from 1 to 6
      return [1, 2, 3, 4, 5, 6];
    },
    applyMove: (board, roll, pIdx) => {
      const nextBoard = { ...board };
      if (pIdx === 0) {
        let nextPos = nextBoard.user + roll;
        if (nextPos <= 100) {
          // Slide/Climb trigger
          if (SNAKES[nextPos]) {
            nextPos = SNAKES[nextPos];
            audio.playSnake();
          } else if (LADDERS[nextPos]) {
            nextPos = LADDERS[nextPos];
            audio.playLadder();
          }
          nextBoard.user = nextPos;
        }
      } else {
        let nextPos = nextBoard.bot + roll;
        if (nextPos <= 100) {
          if (SNAKES[nextPos]) {
            nextPos = SNAKES[nextPos];
            audio.playSnake();
          } else if (LADDERS[nextPos]) {
            nextPos = LADDERS[nextPos];
            audio.playLadder();
          }
          nextBoard.bot = nextPos;
        }
      }
      return nextBoard;
    },
    checkWin: (board, pIdx) => {
      return pIdx === 0 ? board.user === 100 : board.bot === 100;
    },
    checkDraw: () => false
  });

  const initGame = () => {
    setupGame([
      { id: 'player_user', name: user?.username || 'Vortex', avatar: user?.avatarUrl || '', color: 'blue', rank: user?.stats.rank || 1500, isBot: false, timeRemaining: 300 },
      { id: 'bot_sl', name: 'NEXUS_AI', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKS2zywQA4tK355lM3NQI0J9G2IHRAwGhAcGCxIowggFAtPbrbkE4uZ6RXasRg0y3cYws8sPtCTfhW0ZEBnmU917mUVLq4A673waOp4lB51a_RGkLJO9GI3Pe5nIEXMSdgCZsGpXTarGFElfWWgzQk6Nbvq7GDDQquP9E5lktR164m09RKkBzEtfWPvXWphBg8bM2fdcKZAfdcg0ljWKiPOS7ebdLdAAxl8XAb5QNROiq62LgKTvFn', color: 'pink', rank: 1450, isBot: true, timeRemaining: 300 }
    ], 300);
    setLogs(['Session started. Roll dice to begin.']);
    setDiceRoll(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Bot Automatic Roll action
  useEffect(() => {
    if (gameState === 'playing' && activePlayerIndex === 1) {
      const delay = setTimeout(() => {
        setIsRolling(true);
        audio.playRoll();
        
        setTimeout(() => {
          setIsRolling(false);
          const roll = Math.floor(Math.random() * 6) + 1;
          setDiceRoll(roll);
          makeMove(1, roll, `AI Roll ${roll}`);
          setLogs(prev => [...prev, `AI rolled a ${roll}. Target at cell ${boardState.bot}.`]);
        }, 800);
      }, 1500);

      return () => clearTimeout(delay);
    }
  }, [activePlayerIndex, gameState]);

  useEffect(() => {
    if (gameState === 'finished') {
      if (winnerIndex === 0) {
        audio.playWin();
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
        setLogs(prev => [...prev, 'VICTORY! Sector secured. +150 XP rewarded.']);
      } else {
        audio.playSnake();
        setLogs(prev => [...prev, 'Session Lost. AI secured grid connection.']);
      }
    }
  }, [gameState, winnerIndex]);

  const rollPlayerDice = () => {
    if (gameState !== 'playing' || activePlayerIndex !== 0 || isRolling) return;

    setIsRolling(true);
    audio.playRoll();

    setTimeout(() => {
      setIsRolling(false);
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceRoll(roll);
      makeMove(0, roll, `Roll ${roll}`);
      setLogs(prev => [...prev, `You rolled a ${roll}. Positioned at cell ${boardState.user}.`]);
    }, 800);
  };

  // Translate cell index 1..100 to CSS Grid 10x10 indices (zig-zag pattern)
  const getCellCoords = (cellNum: number) => {
    if (cellNum === 0) return { r: 9, c: -1 }; // Baseline start
    const zeroBased = cellNum - 1;
    const r = 9 - Math.floor(zeroBased / 10);
    const c = (9 - r) % 2 === 1
      ? 9 - (zeroBased % 10)
      : zeroBased % 10;
    return { r, c };
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
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">SNAKES & LADDERS</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 10x10 • Boustrophedon Layout</p>
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
        
        {/* Left: 10x10 Board */}
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

          {/* 10x10 Zig-Zag Grid */}
          <div className="w-full max-w-[460px] aspect-square bg-[#0b1326]/40 p-3 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-10 grid-rows-10 gap-0.5 w-full h-full relative">
              {Array.from({ length: 100 }).map((_, idx) => {
                const cellNum = 100 - idx;
                // Determine r, c layout positions
                const zeroBased = cellNum - 1;
                const r = 9 - Math.floor(zeroBased / 10);
                const c = (9 - r) % 2 === 1 ? 9 - (zeroBased % 10) : zeroBased % 10;
                
                const hasUser = boardState.user === cellNum;
                const hasBot = boardState.bot === cellNum;

                const isSnakeHead = SNAKES[cellNum] !== undefined;
                const isLadderBase = LADDERS[cellNum] !== undefined;

                return (
                  <div
                    key={cellNum}
                    style={{ gridRowStart: r + 1, gridColumnStart: c + 1 }}
                    className={`relative flex flex-col items-center justify-center aspect-square border border-white/5 ${
                      isSnakeHead 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : isLadderBase 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-black/25'
                    }`}
                  >
                    <span className="absolute top-1 left-1 text-[8px] text-on-surface-variant font-bold">{cellNum}</span>

                    {/* Indicators */}
                    {isSnakeHead && <span className="text-[6px] text-red-400 absolute bottom-1 right-1 font-bold">S ➔ {SNAKES[cellNum]}</span>}
                    {isLadderBase && <span className="text-[6px] text-emerald-400 absolute bottom-1 right-1 font-bold">L ➔ {LADDERS[cellNum]}</span>}

                    {/* Tokens */}
                    <div className="flex gap-1 z-10">
                      {hasUser && (
                        <div className="w-3.5 h-3.5 rounded-full bg-primary border border-white shadow-[0_0_8px_#3B82F6]" />
                      )}
                      {hasBot && (
                        <div className="w-3.5 h-3.5 rounded-full bg-pink-500 border border-white shadow-[0_0_8px_#EC4899]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Roll deck and logs */}
        <div className="lg:col-span-4 flex flex-col gap-4 w-full">
          
          {/* Active Dice Roller */}
          <div className="flex items-center gap-6 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 shadow-xl">
            <button
              onClick={rollPlayerDice}
              disabled={activePlayerIndex !== 0 || gameState !== 'playing' || isRolling}
              className={`group relative w-16 h-16 bg-surface-container-high rounded-xl flex items-center justify-center border-2 border-primary transition-all overflow-hidden ${
                activePlayerIndex !== 0 || gameState !== 'playing' || isRolling
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              }`}
            >
              <div className={`relative z-10 transition-transform ${isRolling ? 'animate-spin' : ''}`}>
                <span className="material-symbols-outlined text-4xl text-white font-bold">casino</span>
              </div>
            </button>

            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">DICE STATUS</p>
              {isRolling ? (
                <p className="text-xs text-primary animate-pulse">Rolling dice core...</p>
              ) : diceRoll ? (
                <p className="text-xs text-emerald-400 font-bold">
                  Rolled <span className="text-white text-sm font-extrabold">{diceRoll}</span>!
                </p>
              ) : (
                <p className="text-xs text-on-surface-variant">Waiting for roll</p>
              )}
            </div>
          </div>

          <Card level={3} className="p-5 h-[230px] flex flex-col border border-white/5 bg-black/30">
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
