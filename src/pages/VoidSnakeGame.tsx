import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy, Shield, 
  Clock, Zap, ZapOff, Sparkles, Play, Pause, X, Maximize, Minimize,
  ArrowUp, ArrowDown, ArrowLeft as LeftIcon, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Synthesis Audio Engine ---
class SnakeAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playEat() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1040, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  playCrash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.46);
  }

  playPowerup() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.31);
  }
}

const audio = new SnakeAudio();

// --- Game Settings Types ---
type GameState = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
type GameMode = 'Classic' | 'Time Attack' | 'Endless' | 'Speed Mode' | 'Challenge' | 'Practice';
type Position = { x: number; y: number };
type PowerupType = 'Shield' | '2x Multiplier' | 'Slow Motion' | 'Ghost Mode' | 'Speed Boost';

export const VoidSnakeGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { addXP, addCoins } = useAuthStore();

  // Setup Options States
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [gameMode, setGameMode] = useState<GameMode>('Classic');
  const [difficulty, setDifficulty] = useState<'Normal' | 'Hard' | 'Extreme'>('Normal');

  // Game metrics
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Active power-up track
  const [activePowerup, setActivePowerup] = useState<PowerupType | null>(null);
  const [powerupDuration, setPowerupDuration] = useState(0); // in ticks/seconds

  // Refs for Game Loop Canvas tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const isPlayingRef = useRef(false);
  const dir = useRef<Position>({ x: 0, y: -1 }); // Initial up direction
  const nextDirRef = useRef<Position>({ x: 0, y: -1 });

  // Powerup item tracking
  type PowerupItem = { x: number; y: number; type: PowerupType; radius: number; collected: boolean };
  const powerupItem = useRef<PowerupItem | null>(null);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem(`void_snake_high_${gameMode}`);
    if (saved) setHighScore(parseInt(saved));
    audio.enabled = soundEnabled;
  }, [gameMode, soundEnabled]);

  // Handle Fullscreen Exit Listeners
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Listen to keyboard steers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      const currentDir = dir.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'KeyW':
          if (currentDir.y === 0) nextDirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (currentDir.y === 0) nextDirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (currentDir.x === 0) nextDirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (currentDir.x === 0) nextDirRef.current = { x: 1, y: 0 };
          break;
        case 'KeyP':
          pauseGame();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const manualSteer = (dx: number, dy: number) => {
    if (gameState !== 'PLAYING') return;
    const currentDir = dir.current;
    if (currentDir.x === 0 && dx !== 0) nextDirRef.current = { x: dx, y: dy };
    if (currentDir.y === 0 && dy !== 0) nextDirRef.current = { x: dx, y: dy };
  };

  // Fullscreen toggle API request
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen permission rejected or not supported", err);
    }
  };

  // Setup/Start game
  const requestStartFlow = () => {
    toggleFullscreen();
    setGameState('COUNTDOWN');
    setCountdown(3);
  };

  // Countdown timer loop
  useEffect(() => {
    if (gameState !== 'COUNTDOWN') return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    // Physics Init
    setSnake([{ x: 10, y: 10 }]);
    dir.current = { x: 0, y: -1 };
    nextDirRef.current = { x: 0, y: -1 };
    scoreRef.current = 0;
    setScore(0);
    setTimeSurvived(0);
    setCurrentLevel(1);

    // Initial food spawn
    setFood({ x: 5, y: 5 });

    // Powerup spawn configuration
    powerupItem.current = null;
    setActivePowerup(null);
    setPowerupDuration(0);

    isPlayingRef.current = true;
    setGameState('PLAYING');

    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    tick();
  };

  const pauseGame = () => {
    isPlayingRef.current = false;
    setGameState('PAUSED');
  };

  const resumeGame = () => {
    isPlayingRef.current = true;
    setGameState('PLAYING');
    tick();
  };

  const handleGameOver = () => {
    isPlayingRef.current = false;
    setGameState('GAME_OVER');
    audio.playCrash();

    // Reward ELO Coins + XP
    const bonusMultiplier = gameMode === 'Challenge' ? 2.0 : (difficulty === 'Hard' ? 1.5 : (difficulty === 'Extreme' ? 2.0 : 1.0));
    const xp = Math.floor(scoreRef.current * 0.8 * bonusMultiplier);
    const coins = Math.floor(scoreRef.current * 0.4 * bonusMultiplier);

    setXpEarned(xp);
    setCoinsEarned(coins);

    if (xp > 0) addXP(xp);
    if (coins > 0) addCoins(coins);

    // High score log update
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem(`void_snake_high_${gameMode}`, scoreRef.current.toString());
      confetti({ particleCount: 120, spread: 60 });
    }
  };

  // Main game frame tick loop
  const tick = () => {
    if (!isPlayingRef.current) return;

    let baseSpeed = difficulty === 'Normal' ? 150 : (difficulty === 'Hard' ? 110 : 80);
    // Adjust speed based on levels
    baseSpeed = Math.max(50, baseSpeed - scoreRef.current * 1.5);

    // Apply Active Power-up speed modifiers
    if (activePowerup === 'Slow Motion') {
      baseSpeed *= 1.8;
    } else if (activePowerup === 'Speed Boost') {
      baseSpeed *= 0.65;
    }

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const nextDir = nextDirRef.current;
      dir.current = nextDir;

      const newHead = { x: head.x + nextDir.x, y: head.y + nextDir.y };

      // Boundaries collision check (Wrap coordinates in Endless Mode)
      if (newHead.x < 0 || newHead.x >= 20 || newHead.y < 0 || newHead.y >= 20) {
        if (gameMode === 'Endless') {
          newHead.x = (newHead.x + 20) % 20;
          newHead.y = (newHead.y + 20) % 20;
        } else {
          if (activePowerup === 'Shield') {
            setActivePowerup(null);
            // Bounce snake back opposite
            newHead.x = head.x - nextDir.x;
            newHead.y = head.y - nextDir.y;
            nextDirRef.current = { x: -nextDir.x, y: -nextDir.y };
          } else {
            handleGameOver();
            return prevSnake;
          }
        }
      }

      // Self body collision check (Ignore in Ghost Mode / Practice Mode)
      const collisionOccurred = prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y);
      if (collisionOccurred && gameMode !== 'Practice' && activePowerup !== 'Ghost Mode') {
        if (activePowerup === 'Shield') {
          setActivePowerup(null);
        } else {
          handleGameOver();
          return prevSnake;
        }
      }

      const newSnake = [newHead, ...prevSnake];

      // Food Eaten check
      if (newHead.x === food.x && newHead.y === food.y) {
        audio.playEat();
        scoreRef.current += activePowerup === '2x Multiplier' ? 20 : 10;
        setScore(scoreRef.current);
        
        // Spawning new food
        let nextPos: Position;
        while (true) {
          nextPos = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
          };
          if (!newSnake.some((seg) => seg.x === nextPos.x && seg.y === nextPos.y)) {
            break;
          }
        }
        setFood(nextPos);

        // Spawn power-up with 25% probability
        if (Math.random() < 0.25 && !powerupItem.current && !activePowerup) {
          const types: PowerupType[] = ['Shield', '2x Multiplier', 'Slow Motion', 'Ghost Mode', 'Speed Boost'];
          powerupItem.current = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
            type: types[Math.floor(Math.random() * types.length)],
            radius: 8,
            collected: false
          };
        }
      } else {
        newSnake.pop(); // Remove tail segment
      }

      // Powerup item collision collection check
      const power = powerupItem.current;
      if (power && newHead.x === power.x && newHead.y === power.y) {
        power.collected = true;
        audio.playPowerup();
        setActivePowerup(power.type);
        setPowerupDuration(10); // 10 seconds duration
        powerupItem.current = null;
      }

      return newSnake;
    });

    setTimeSurvived((t) => t + baseSpeed / 1000);

    // Duration timer ticks
    setPowerupDuration((d) => {
      if (d <= 1) {
        setActivePowerup(null);
        return 0;
      }
      return d - 1;
    });

    gameLoopRef.current = window.setTimeout(tick, baseSpeed);
  };

  // Canvas drawing loop listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cellSize = size / 20;

    // Draw Background Grid
    ctx.fillStyle = '#060e20';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 20; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    // Draw Food Node
    ctx.fillStyle = '#10B981';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#10B981';
    ctx.beginPath();
    ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw active Powerup item
    const power = powerupItem.current;
    if (power && !power.collected) {
      ctx.shadowBlur = 12;
      ctx.fillStyle = power.type === 'Shield' ? '#f59e0b' : (power.type === '2x Multiplier' ? '#10b981' : '#ec4899');
      ctx.shadowColor = ctx.fillStyle as string;

      ctx.beginPath();
      ctx.arc(power.x * cellSize + cellSize / 2, power.y * cellSize + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw Snake chain
    snake.forEach((seg, idx) => {
      const isHead = idx === 0;
      ctx.fillStyle = isHead ? '#3B82F6' : '#b6c4ff';
      ctx.shadowBlur = isHead ? 10 : 0;
      ctx.shadowColor = '#3B82F6';

      ctx.beginPath();
      ctx.roundRect(seg.x * cellSize + 1.5, seg.y * cellSize + 1.5, cellSize - 3, cellSize - 3, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

  }, [snake, food]);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative min-h-screen text-white bg-[#050505] flex flex-col justify-between select-none ${
        isFullscreen ? 'w-screen h-screen' : 'pt-20 pb-20'
      }`}
    >
      {/* HUD Header Bar */}
      <header className="relative z-10 max-w-xl w-full mx-auto px-margin-mobile flex justify-between items-center py-3.5 border-b border-white/5 bg-black/45 backdrop-blur-md rounded-2xl mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/library')}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
          </button>
          <div>
            <h1 className="font-headline-md text-sm font-bold text-primary tracking-wider uppercase">Void Snake Pro</h1>
            <p className="text-[9px] text-on-surface-variant">Neural Grid Simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-primary" /> : <VolumeX className="w-3.5 h-3.5 text-on-surface-variant" />}
          </button>
          <button 
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-primary" /> : <Maximize className="w-3.5 h-3.5 text-primary" />}
          </button>
        </div>
      </header>

      {/* Main Game Container */}
      <main className="relative z-10 max-w-md w-full mx-auto px-margin-mobile flex flex-col items-center gap-6">
        
        {/* Score and Powerups Dashboard */}
        <div className="flex items-center justify-between w-full bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
          <div className="text-left">
            <p className="text-[9px] text-on-surface-variant font-bold uppercase">SCORE</p>
            <h4 className="font-headline-lg text-lg text-primary mt-0.5">{score}</h4>
          </div>

          {/* Active Powerup indicator */}
          {activePowerup && (
            <div className="flex items-center gap-1.5 bg-primary-container/30 px-3 py-1 rounded-full border border-primary/20 animate-pulse text-[10px]">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="font-bold text-white uppercase">{activePowerup}</span>
              <span className="text-[9px] text-primary">({powerupDuration}s)</span>
            </div>
          )}

          <div className="text-right">
            <p className="text-[9px] text-on-surface-variant font-bold uppercase">HIGH SCORE</p>
            <h4 className="font-headline-lg text-lg text-emerald-400 mt-0.5">{highScore}</h4>
          </div>
        </div>

        {/* Canvas Arena Frame */}
        <div className="relative w-full aspect-square bg-[#0b1326]/30 border border-white/10 rounded-3xl p-2.5 shadow-2xl flex items-center justify-center overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width="400" 
            height="400" 
            className="w-full h-full rounded-2xl bg-[#060e20]" 
          />

          {/* 1. Setup / Idle menu overlay */}
          {gameState === 'IDLE' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col justify-between p-6 rounded-3xl">
              <div className="text-center space-y-1">
                <Trophy className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                <h2 className="font-headline-lg text-base font-extrabold uppercase text-white tracking-widest">SNAKE VOID DECK</h2>
                <p className="text-[9px] text-on-surface-variant">Configure parameters to deploy your light cycle.</p>
              </div>

              {/* Toggles Panel */}
              <div className="grid grid-cols-2 gap-3 my-2 text-[10px] text-left">
                {/* Mode Choice */}
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-1">
                  <label className="font-bold text-amber-400 block text-[8px] uppercase">GAME MODE</label>
                  <select 
                    value={gameMode} 
                    onChange={(e) => setGameMode(e.target.value as GameMode)}
                    className="w-full bg-[#0c0c1b] text-white border border-white/10 rounded px-1 py-0.5"
                  >
                    <option value="Classic">Classic Mode</option>
                    <option value="Endless">Endless (Wrap Borders)</option>
                    <option value="Time Attack">Time Attack</option>
                    <option value="Speed Mode">Speed Mode</option>
                    <option value="Challenge">Challenge Mode</option>
                    <option value="Practice">Practice Mode</option>
                  </select>
                </div>

                {/* Difficulty Choice */}
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-1">
                  <label className="font-bold text-pink-500 block text-[8px] uppercase">SPEED DENSITY</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-[#0c0c1b] text-white border border-white/10 rounded px-1 py-0.5"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Hard">Hard</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
              </div>

              <Button 
                variant="neon" 
                onClick={requestStartFlow} 
                className="w-full py-3.5 text-[11px] font-bold tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> INITIATE DEPLOYMENT
              </Button>
            </div>
          )}

          {/* 2. Countdown Overlay */}
          {gameState === 'COUNTDOWN' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl">
              <h1 className="text-display-lg text-6xl text-primary font-black scale-up-animation">{countdown}</h1>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-2 tracking-widest">STEER WITH WASD / ARROWS / DPAD</p>
            </div>
          )}

          {/* 3. Paused Overlay */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4 rounded-3xl">
              <h2 className="text-xl font-bold uppercase tracking-wider">GRID TRANSMISSION PAUSED</h2>
              <div className="flex gap-4">
                <Button variant="neon" onClick={resumeGame} className="px-6 py-2.5 text-[10px] font-bold">RESUME</Button>
                <Button variant="ghost" onClick={startGame} className="px-6 py-2.5 text-[10px] font-bold">RESTART</Button>
              </div>
            </div>
          )}

          {/* 4. Game Over results screen */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col justify-between p-6 rounded-3xl text-center">
              <div className="space-y-1">
                <X className="w-10 h-10 text-pink-500 mx-auto" />
                <h2 className="font-headline-lg text-base font-extrabold uppercase text-pink-500 tracking-wider">GRID COLLISION DETECTED</h2>
                <p className="text-[9px] text-on-surface-variant">Core cycle structural damage reached at score {score}.</p>
              </div>

              {/* Score analytics deck */}
              <div className="grid grid-cols-2 gap-3 my-2 text-[10px] text-left">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-on-surface-variant text-[8px] uppercase font-bold">Surviving Time</span>
                  <p className="text-white font-bold text-xs mt-0.5">{Math.floor(timeSurvived)}s</p>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-on-surface-variant text-[8px] uppercase font-bold">Cycle Length</span>
                  <p className="text-white font-bold text-xs mt-0.5">{snake.length} nodes</p>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center justify-between col-span-2">
                  <div>
                    <span className="text-on-surface-variant text-[8px] uppercase font-bold">Vanguard Rewards</span>
                    <p className="text-white font-bold text-xs mt-0.5">+{xpEarned} XP • +{coinsEarned} Coins</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 text-[9px] font-bold">SAVED ✔</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="neon" onClick={startGame} className="flex-1 py-3 text-[10px] font-bold tracking-wider cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5 mx-auto" />
                </Button>
                <Button variant="ghost" onClick={() => setGameState('IDLE')} className="flex-1 py-3 text-[10px] font-bold tracking-wider cursor-pointer">
                  MAIN MENU
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile touch D-pad Controls */}
        <div className="flex flex-col items-center gap-1.5 w-full max-w-[180px] mt-2">
          <button 
            onClick={() => manualSteer(0, -1)}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <ArrowUp className="w-4 h-4 text-primary" />
          </button>
          <div className="flex gap-8">
            <button 
              onClick={() => manualSteer(-1, 0)}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <LeftIcon className="w-4 h-4 text-primary" />
            </button>
            <button 
              onClick={() => manualSteer(1, 0)}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-primary" />
            </button>
          </div>
          <button 
            onClick={() => manualSteer(0, 1)}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:scale-95 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-primary" />
          </button>
        </div>

      </main>

      <div />
    </div>
  );
};
