import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { useBoardGameEngine } from '../engine/useBoardGameEngine';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DominoTile {
  id: string;
  left: number;
  right: number;
}

interface DominoMove {
  tileId: string;
  position: 'left' | 'right';
  flip: boolean;
}

interface DominoBoardState {
  placedTiles: DominoTile[];
  userHand: DominoTile[];
  botHand: DominoTile[];
  boneyard: DominoTile[];
}

class DominoAudio {
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
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
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

const audio = new DominoAudio();

export const DominoesGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState<string[]>(['Boneyard initialized. Dealing tiles.']);
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

  const generateFullSet = (): DominoTile[] => {
    const list: DominoTile[] = [];
    let idCounter = 0;
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        list.push({ id: `tile_${idCounter++}`, left: i, right: j });
      }
    }
    // Shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1));
      [list[i], list[k]] = [list[k], list[i]];
    }
    return list;
  };

  // Helper validation: lists moves matching left/right end values of the placed table line
  const getMovesForHand = (hand: DominoTile[], placed: DominoTile[]): DominoMove[] => {
    const valid: DominoMove[] = [];
    if (placed.length === 0) {
      // First tile can be placed anywhere
      hand.forEach((t) => {
        valid.push({ tileId: t.id, position: 'left', flip: false });
      });
      return valid;
    }

    const first = placed[0];
    const last = placed[placed.length - 1];

    hand.forEach((t) => {
      // Left end placement checks
      if (t.left === first.left) valid.push({ tileId: t.id, position: 'left', flip: true });
      if (t.right === first.left) valid.push({ tileId: t.id, position: 'left', flip: false });

      // Right end placement checks
      if (t.left === last.right) valid.push({ tileId: t.id, position: 'right', flip: false });
      if (t.right === last.right) valid.push({ tileId: t.id, position: 'right', flip: true });
    });

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
  } = useBoardGameEngine<DominoBoardState, DominoMove>({
    gameName: 'Dominoes',
    initialBoardState: () => ({ placedTiles: [], userHand: [], botHand: [], boneyard: [] }),
    getValidMoves: (pIdx, board) => {
      const hand = pIdx === 0 ? board.userHand : board.botHand;
      return getMovesForHand(hand, board.placedTiles);
    },
    applyMove: (board, move, pIdx) => {
      const nextBoard = { ...board };
      const hand = pIdx === 0 ? [...board.userHand] : [...board.botHand];
      const tile = hand.find(t => t.id === move.tileId)!;

      // Remove from hand
      const nextHand = hand.filter(t => t.id !== move.tileId);
      if (pIdx === 0) nextBoard.userHand = nextHand;
      else nextBoard.botHand = nextHand;

      const placed = [...board.placedTiles];
      const mappedTile = move.flip ? { ...tile, left: tile.right, right: tile.left } : tile;

      if (move.position === 'left') {
        placed.unshift(mappedTile);
      } else {
        placed.push(mappedTile);
      }

      nextBoard.placedTiles = placed;
      return nextBoard;
    },
    checkWin: (board, pIdx) => {
      const hand = pIdx === 0 ? board.userHand : board.botHand;
      if (hand.length === 0) return true;

      // Check blocked deadlock win condition (lowest dots wins)
      const p1Valid = getMovesForHand(board.userHand, board.placedTiles).length;
      const p2Valid = getMovesForHand(board.botHand, board.placedTiles).length;
      if (p1Valid === 0 && p2Valid === 0 && board.boneyard.length === 0) {
        const sumUser = board.userHand.reduce((acc, t) => acc + t.left + t.right, 0);
        const sumBot = board.botHand.reduce((acc, t) => acc + t.left + t.right, 0);
        if (pIdx === 0 && sumUser < sumBot) return true;
        if (pIdx === 1 && sumBot < sumUser) return true;
      }
      return false;
    },
    checkDraw: (board) => {
      const p1Valid = getMovesForHand(board.userHand, board.placedTiles).length;
      const p2Valid = getMovesForHand(board.botHand, board.placedTiles).length;
      if (p1Valid === 0 && p2Valid === 0 && board.boneyard.length === 0) {
        const sumUser = board.userHand.reduce((acc, t) => acc + t.left + t.right, 0);
        const sumBot = board.botHand.reduce((acc, t) => acc + t.left + t.right, 0);
        return sumUser === sumBot;
      }
      return false;
    }
  });

  const initGame = () => {
    const fullDeck = generateFullSet();
    const userHand = fullDeck.splice(0, 7);
    const botHand = fullDeck.splice(0, 7);
    
    setupGame([
      { id: 'player_user', name: user?.username || 'Vortex', avatar: user?.avatarUrl || '', color: 'blue', rank: user?.stats.rank || 1500, isBot: false, timeRemaining: 300 },
      { id: 'bot_dominoes', name: 'NEXUS_BOT', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKS2zywQA4tK355lM3NQI0J9G2IHRAwGhAcGCxIowggFAtPbrbkE4uZ6RXasRg0y3cYws8sPtCTfhW0ZEBnmU917mUVLq4A673waOp4lB51a_RGkLJO9GI3Pe5nIEXMSdgCZsGpXTarGFElfWWgzQk6Nbvq7GDDQquP9E5lktR164m09RKkBzEtfWPvXWphBg8bM2fdcKZAfdcg0ljWKiPOS7ebdLdAAxl8XAb5QNROiq62LgKTvFn', color: 'pink', rank: 1400, isBot: true, timeRemaining: 300 }
    ], 300);

    // Patch boardState directly inside component setup parameters
    boardState.placedTiles = [];
    boardState.userHand = userHand;
    boardState.botHand = botHand;
    boardState.boneyard = fullDeck;

    setLogs(['Session started. Deal completed. Play matching dominoes.']);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Bot Automatic Draw/Play Check loop
  useEffect(() => {
    if (gameState !== 'playing' || activePlayerIndex !== 1) return;
    const moves = getMovesForHand(boardState.botHand, boardState.placedTiles);

    if (moves.length === 0) {
      if (boardState.boneyard.length > 0) {
        // Draw card
        const nextBoneyard = [...boardState.boneyard];
        const drawn = nextBoneyard.shift()!;
        boardState.boneyard = nextBoneyard;
        boardState.botHand.push(drawn);
        setLogs(prev => [...prev, 'AI drew a tile from boneyard.']);
        // Trigger dummy turn refresh
        makeMove(1, { tileId: '', position: 'left', flip: false }, 'AI Pass Draw');
      } else {
        setLogs(prev => [...prev, 'AI passed. Boneyard empty.']);
        makeMove(1, { tileId: '', position: 'left', flip: false }, 'AI Blocked Pass');
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
        audio.playPlace();
        setLogs(prev => [...prev, 'Session Lost. AI secured grid connection.']);
      }
    }
  }, [gameState, winnerIndex]);

  const playTile = (tileId: string, position: 'left' | 'right') => {
    if (gameState !== 'playing' || activePlayerIndex !== 0) return;

    const moves = getMovesForHand(boardState.userHand, boardState.placedTiles);
    const validMove = moves.find(m => m.tileId === tileId && m.position === position);

    if (!validMove) {
      setLogs(prev => [...prev, 'Placement alignment mismatch. Check matching ends.']);
      return;
    }

    audio.playPlace();
    makeMove(0, validMove, `Play tile ${tileId} ${position}`);
    setLogs(prev => [...prev, `You played a tile at the ${position} end.`]);
  };

  const drawFromBoneyard = () => {
    if (gameState !== 'playing' || activePlayerIndex !== 0 || boardState.boneyard.length === 0) return;

    const drawn = boardState.boneyard.shift()!;
    boardState.userHand.push(drawn);
    setLogs(prev => [...prev, 'You drew a tile from boneyard.']);
    
    // Check if player has playable moves now
    const moves = getMovesForHand(boardState.userHand, boardState.placedTiles);
    if (moves.length === 0) {
      setLogs(prev => [...prev, 'No moves available after drawing. Passing turn.']);
      makeMove(0, { tileId: '', position: 'left', flip: false }, 'Pass Turn');
    } else {
      // Allow them to play
      setLogs(prev => [...prev, 'Play drawn tile or pass.']);
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
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">DOMINOES</h1>
            <p className="text-[10px] text-on-surface-variant">Tabletop Grid • Double Six Chain</p>
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
        
        {/* Left: Table placements chain */}
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

          {/* Placed tiles row chain */}
          <div className="w-full max-w-[480px] h-48 bg-[#0b1326]/40 p-4 rounded-3xl border border-white/10 shadow-2xl relative overflow-x-auto flex items-center gap-4 scrollbar-thin">
            {boardState.placedTiles.length === 0 ? (
              <div className="text-xs text-on-surface-variant w-full text-center">Place your first domino tile here.</div>
            ) : (
              boardState.placedTiles.map((t, idx) => (
                <div key={t.id} className="flex-shrink-0 w-12 h-20 bg-white rounded-lg flex flex-col justify-between border-2 border-primary/45 p-1">
                  <div className="text-center font-bold text-black text-sm">{t.left}</div>
                  <div className="border-t border-black/20 w-full" />
                  <div className="text-center font-bold text-black text-sm">{t.right}</div>
                </div>
              ))
            )}
          </div>

          {/* User Hand container */}
          <div className="w-full border-t border-white/5 pt-6 flex flex-col items-center">
            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mb-4">Your Hand</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {boardState.userHand.map((t) => {
                const playable = getMovesForHand(boardState.userHand, boardState.placedTiles).some(m => m.tileId === t.id);
                return (
                  <div key={t.id} className="relative group">
                    <div className={`w-12 h-20 bg-white rounded-lg flex flex-col justify-between border-2 p-1 ${
                      playable ? 'border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'border-white/5 opacity-60'
                    }`}>
                      <div className="text-center font-bold text-black text-sm">{t.left}</div>
                      <div className="border-t border-black/20 w-full" />
                      <div className="text-center font-bold text-black text-sm">{t.right}</div>
                    </div>
                    {playable && (
                      <div className="absolute inset-0 flex flex-col gap-1 items-center justify-center opacity-0 group-hover:opacity-100 bg-black/80 rounded-lg transition-opacity">
                        <button onClick={() => playTile(t.id, 'left')} className="px-1.5 py-0.5 bg-primary text-[8px] font-bold rounded">LEFT</button>
                        <button onClick={() => playTile(t.id, 'right')} className="px-1.5 py-0.5 bg-primary text-[8px] font-bold rounded">RIGHT</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Boneyard draw deck and logs */}
        <div className="lg:col-span-4 flex flex-col gap-4 w-full">
          
          {/* Boneyard draw button */}
          <div className="flex items-center gap-6 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 shadow-xl">
            <button
              onClick={drawFromBoneyard}
              disabled={activePlayerIndex !== 0 || gameState !== 'playing' || boardState.boneyard.length === 0}
              className="group relative w-16 h-16 bg-surface-container-high rounded-xl flex items-center justify-center border-2 border-primary transition-all overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <div className="text-[10px] font-bold text-white uppercase">DRAW</div>
            </button>

            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">BONEYARD</p>
              <p className="text-sm font-bold text-emerald-400">{boardState.boneyard.length} Tiles Remaining</p>
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
