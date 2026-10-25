import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBoardGameEngine } from '../engine/useBoardGameEngine';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

type Disc = 'r' | 'y' | null;
type Connect4Board = Disc[][]; // 6 rows x 7 cols

class Connect4Audio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playDrop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
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
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
  }
}

const audio = new Connect4Audio();

export const Connect4Game: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState<string[]>(['Match active. Deploying grid matrix.']);
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
    isDraw,
    setupGame,
    makeMove,
    resignGame
  } = useBoardGameEngine<Connect4Board, number>({
    gameName: 'Connect 4',
    initialBoardState: () => Array(6).fill(null).map(() => Array(7).fill(null)),
    getValidMoves: (pIdx, board) => {
      const valid: number[] = [];
      for (let c = 0; c < 7; c++) {
        if (board[0][c] === null) valid.push(c);
      }
      return valid;
    },
    applyMove: (board, col, pIdx) => {
      const nextBoard = board.map(r => [...r]);
      const token = pIdx === 0 ? 'r' : 'y';
      // Find lowest empty row in column
      for (let r = 5; r >= 0; r--) {
        if (nextBoard[r][col] === null) {
          nextBoard[r][col] = token;
          break;
        }
      }
      return nextBoard;
    },
    checkWin: (board, pIdx) => {
      const token = pIdx === 0 ? 'r' : 'y';
      // Horizontal check
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === token && board[r][c+1] === token && board[r][c+2] === token && board[r][c+3] === token) return true;
        }
      }
      // Vertical check
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
          if (board[r][c] === token && board[r+1][c] === token && board[r+2][c] === token && board[r+3][c] === token) return true;
        }
      }
      // Diagonal down-right check
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === token && board[r+1][c+1] === token && board[r+2][c+2] === token && board[r+3][c+3] === token) return true;
        }
      }
      // Diagonal up-right check
      for (let r = 3; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === token && board[r-1][c+1] === token && board[r-2][c+2] === token && board[r-3][c+3] === token) return true;
        }
      }
      return false;
    },
    checkDraw: (board) => {
      return board[0].every(cell => cell !== null);
    }
  });

  // Setup game
  const initGame = () => {
    setupGame([
      { id: 'player_user', name: user?.username || 'Vortex', avatar: user?.avatarUrl || '', color: 'blue', rank: user?.stats.rank || 1500, isBot: false, timeRemaining: 300 },
      { id: 'bot_connect', name: 'NEXUS_AI', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKS2zywQA4tK355lM3NQI0J9G2IHRAwGhAcGCxIowggFAtPbrbkE4uZ6RXasRg0y3cYws8sPtCTfhW0ZEBnmU917mUVLq4A673waOp4lB51a_RGkLJO9GI3Pe5nIEXMSdgCZsGpXTarGFElfWWgzQk6Nbvq7GDDQquP9E5lktR164m09RKkBzEtfWPvXWphBg8bM2fdcKZAfdcg0ljWKiPOS7ebdLdAAxl8XAb5QNROiq62LgKTvFn', color: 'pink', rank: 1450, isBot: true, timeRemaining: 300 }
    ], 300);
    setLogs(['Session started. Click grid columns to drop cyber discs.']);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Update logs when moves happen
  useEffect(() => {
    if (gameState !== 'playing') return;
    const activePlayer = players[activePlayerIndex];
    if (activePlayer) {
      setLogs(prev => [...prev, `${activePlayer.name}'s turn to deploy.`]);
    }
  }, [activePlayerIndex, gameState]);

  // Win effects trigger
  useEffect(() => {
    if (gameState === 'finished') {
      if (winnerIndex === 0) {
        audio.playWin();
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
        setLogs(prev => [...prev, 'VICTORY! Sector secured. +150 XP rewarded.']);
      } else if (winnerIndex === 1) {
        audio.playDrop();
        setLogs(prev => [...prev, 'Session Draw/Loss. AI locked grid.']);
      } else {
        setLogs(prev => [...prev, 'Session ended in a draw.']);
      }
    }
  }, [gameState, winnerIndex]);

  const selectColumn = (col: number) => {
    if (gameState !== 'playing' || players[activePlayerIndex]?.isBot) return;

    audio.playDrop();
    const success = makeMove(0, col, `Drop col ${col}`);
    if (success) {
      setLogs(prev => [...prev, `Dropped disc in column ${col + 1}.`]);
    }
  };

  return (
    <div className={`relative ${isStandalone ? 'w-full h-full p-2 md:p-4 flex flex-col items-center justify-center text-white overflow-hidden bg-[#050505]' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] overflow-x-hidden flex flex-col justify-between'}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Top Header - only in full page mode */}
      {!isStandalone && (
        <header className="relative z-10 max-w-4xl w-full mx-auto px-margin-mobile flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/library')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div>
              <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">CONNECT 4</h1>
              <p className="text-[10px] text-on-surface-variant">Grid Matrix 6x7 • Disc Drop Mode</p>
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
      <main className={`relative z-10 ${isStandalone ? 'w-full max-w-[460px] flex flex-col items-center gap-3 my-auto' : 'max-w-5xl w-full mx-auto px-margin-mobile grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'}`}>
        
        {/* Board column */}
        <div className={`${isStandalone ? 'w-full' : 'lg:col-span-8'} flex flex-col items-center gap-3 w-full`}>
          
          {/* Turn and Status Bar */}
          <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md text-xs font-bold shadow-md">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${activePlayerIndex === 0 ? 'bg-primary animate-pulse shadow-[0_0_8px_#3B82F6]' : 'bg-pink-500 shadow-[0_0_8px_#EC4899]'}`} />
              <span className="text-white text-[11px] uppercase tracking-wide">
                {gameState === 'playing' 
                  ? (activePlayerIndex === 0 ? 'Your Turn (Blue) • Click Column' : 'AI Opponent (Pink) Thinking...') 
                  : (winnerIndex === 0 ? '🎉 Victory! +150 XP' : winnerIndex === 1 ? 'Defeat — AI Connected 4' : 'Game Draw')}
              </span>
            </div>
            <button 
              onClick={initGame} 
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset Match"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {gameState === 'finished' && (
            <div className="w-full p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between shadow-xl">
              <span className="text-xs font-bold text-white">
                {winnerIndex === 0 ? 'Sector secured! Match completed.' : 'Mission failed. Sector locked.'}
              </span>
              <button 
                onClick={initGame}
                className="px-3 py-1 bg-primary text-black text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                PLAY AGAIN
              </button>
            </div>
          )}

          {/* Connect 4 Blue Glass Board */}
          <div className="w-full max-w-[440px] aspect-[7/6] bg-primary/15 p-3 sm:p-4 rounded-3xl border border-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-[#0a1426]/75 z-0 pointer-events-none" />
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 h-full z-10 relative">
              {Array.from({ length: 7 }).map((_, cIdx) => (
                <button
                  key={cIdx}
                  disabled={gameState !== 'playing' || boardState[0][cIdx] !== null}
                  onClick={() => selectColumn(cIdx)}
                  className="flex flex-col justify-between h-full group hover:bg-white/10 rounded-xl p-1 transition-colors cursor-pointer relative"
                  title={`Drop disc in Column ${cIdx + 1}`}
                >
                  {/* Rows */}
                  {Array.from({ length: 6 }).map((_, rIdx) => {
                    const cell = boardState[rIdx][cIdx];
                    return (
                      <div 
                        key={rIdx} 
                        className={`w-full aspect-square rounded-full border-2 flex items-center justify-center transition-all ${
                          cell === 'r' 
                            ? 'bg-primary border-primary shadow-[0_0_12px_#3B82F6]' 
                            : cell === 'y'
                            ? 'bg-pink-500 border-pink-500 shadow-[0_0_12px_#EC4899]'
                            : 'bg-black/50 border-white/10 group-hover:border-primary/40'
                        }`}
                      />
                    );
                  })}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Side Comms - only in full page mode */}
        {!isStandalone && (
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
                  You: Blue
                </span>
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${activePlayerIndex === 1 && gameState === 'playing' ? 'bg-pink-500 animate-pulse' : 'bg-white/10'}`} />
                  Bot: Pink
                </span>
              </div>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
};
