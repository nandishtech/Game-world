import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy, ArrowLeft as LeftIcon, ArrowRight } from 'lucide-react';

class RaceAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playOrb() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, this.ctx.currentTime + 0.1);
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
    // Exploding synth sound using noise simulation
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.55);
  }
}

const audio = new RaceAudio();

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'car' | 'orb';
}

export const VelocityRacingGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { addXP } = useAuthStore();

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopId = useRef<number | null>(null);

  // Game coordinates state refs to avoid state-lag in requestAnimationFrame
  const playerX = useRef(150); // Center of 300px track
  const obstacles = useRef<Obstacle[]>([]);
  const scrollOffset = useRef(0);
  const localScore = useRef(0);

  useEffect(() => {
    audio.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const saved = localStorage.getItem('velocity_racing_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Listen to steering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      if (e.key === 'ArrowLeft') {
        playerX.current = Math.max(20, playerX.current - 25);
      } else if (e.key === 'ArrowRight') {
        playerX.current = Math.min(250, playerX.current + 25);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  // Main 60FPS Game Loop
  const loop = () => {
    if (gameOver || !isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // --- 1. UPDATE STATE ---
    // Speed increases as score grows
    const currentSpeed = 5 + Math.floor(localScore.current / 80);
    scrollOffset.current = (scrollOffset.current + currentSpeed) % H;

    // Spawn obstacles/orbs
    if (Math.random() < 0.02) {
      const type = Math.random() < 0.35 ? 'orb' : 'car';
      const laneWidth = W / 3;
      const lane = Math.floor(Math.random() * 3);
      const obsX = lane * laneWidth + laneWidth / 2 - 15;

      // Ensure no overlapping spawns in the same frame
      if (!obstacles.current.some(o => o.y < 100 && o.x === obsX)) {
        obstacles.current.push({
          x: obsX,
          y: -50,
          width: 30,
          height: type === 'car' ? 50 : 25,
          speed: type === 'car' ? currentSpeed + 1 : currentSpeed,
          type
        });
      }
    }

    // Move entities
    obstacles.current.forEach((o) => {
      o.y += o.speed;
    });

    // Check collisions
    const playerBox = { x: playerX.current, y: H - 80, width: 30, height: 60 };

    for (let i = obstacles.current.length - 1; i >= 0; i--) {
      const o = obstacles.current[i];

      // AABB Box Collisions check
      const collides = (
        playerBox.x < o.x + o.width &&
        playerBox.x + playerBox.width > o.x &&
        playerBox.y < o.y + o.height &&
        playerBox.y + playerBox.height > o.y
      );

      if (collides) {
        if (o.type === 'orb') {
          audio.playOrb();
          localScore.current += 10;
          setScore(localScore.current);
          if (localScore.current > highScore) {
            setHighScore(localScore.current);
            localStorage.setItem('velocity_racing_highscore', localScore.current.toString());
          }
          obstacles.current.splice(i, 1);
        } else {
          handleGameOver();
          return;
        }
      } else if (o.y > H) {
        // Safe dodge adds score
        if (o.type === 'car') {
          localScore.current += 5;
          setScore(localScore.current);
        }
        obstacles.current.splice(i, 1);
      }
    }

    // --- 2. RENDER BOARD ---
    ctx.fillStyle = '#060e20';
    ctx.fillRect(0, 0, W, H);

    // Draw scrolling highway lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    
    // Left lane division
    ctx.beginPath();
    ctx.moveTo(W / 3, scrollOffset.current);
    ctx.lineTo(W / 3, H);
    ctx.moveTo(W / 3, 0);
    ctx.lineTo(W / 3, scrollOffset.current);
    ctx.stroke();

    // Right lane division
    ctx.beginPath();
    ctx.moveTo((W * 2) / 3, scrollOffset.current);
    ctx.lineTo((W * 2) / 3, H);
    ctx.moveTo((W * 2) / 3, 0);
    ctx.lineTo((W * 2) / 3, scrollOffset.current);
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dashes

    // Draw Obstacles (cars & energy orbs)
    obstacles.current.forEach((o) => {
      if (o.type === 'car') {
        // Red enemy cyber car
        ctx.fillStyle = '#EF4444';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#EF4444';
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.width, o.height, 6);
        ctx.fill();
        
        // Draw headlights
        ctx.fillStyle = '#FFF';
        ctx.fillRect(o.x + 4, o.y + o.height - 4, 4, 3);
        ctx.fillRect(o.x + o.width - 8, o.y + o.height - 4, 4, 3);
      } else {
        // Green energy core
        ctx.fillStyle = '#10B981';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#10B981';
        ctx.beginPath();
        ctx.arc(o.x + o.width/2, o.y + o.height/2, o.width/2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    });

    // Draw Player cyber vehicle (blue)
    ctx.fillStyle = '#3B82F6';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#3B82F6';
    ctx.beginPath();
    ctx.roundRect(playerBox.x, playerBox.y, playerBox.width, playerBox.height, 8);
    ctx.fill();
    
    // Headlight overlays
    ctx.fillStyle = '#FFF';
    ctx.fillRect(playerBox.x + 4, playerBox.y + 4, 4, 4);
    ctx.fillRect(playerBox.x + playerBox.width - 8, playerBox.y + 4, 4, 4);

    ctx.shadowBlur = 0;

    gameLoopId.current = requestAnimationFrame(loop);
  };

  const handleGameOver = () => {
    audio.playCrash();
    setGameOver(true);
    setIsPlaying(false);
    if (localScore.current > 0) {
      addXP(Math.floor(localScore.current * 0.4));
    }
  };

  const startGame = () => {
    playerX.current = 135;
    obstacles.current = [];
    localScore.current = 0;
    scrollOffset.current = 0;
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  // Trigger loop startup
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopId.current = requestAnimationFrame(loop);
    }
    return () => {
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
    };
  }, [isPlaying, gameOver]);

  return (
    <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] flex flex-col justify-between'}`}>
      {/* Top Header */}
      {!isStandalone && (
      <header className="relative z-10 max-w-xl w-full mx-auto px-margin-mobile flex justify-between items-center py-4 border-b border-white/5 bg-black/45 backdrop-blur-md rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/library')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">VELOCITY RACING</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 300x500 • Hover Highway</p>
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

      {/* Main Grid Game */}
      <main className="relative z-10 max-w-md w-full mx-auto px-margin-mobile flex flex-col items-center gap-6">
        
        {/* Score Board */}
        <div className="grid grid-cols-2 gap-4 w-full text-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">ENERGY KM</p>
            <h4 className="font-headline-lg text-lg text-primary mt-1">{score}</h4>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">MAX VELOCITY</p>
            <h4 className="font-headline-lg text-lg text-emerald-400 mt-1">{highScore}</h4>
          </div>
        </div>

        {/* Board Canvas */}
        <div className="relative w-full aspect-[3/5] max-w-[300px] bg-[#0b1326]/30 border border-white/10 rounded-3xl p-3 shadow-2xl flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} width="300" height="500" className="w-full h-full rounded-xl bg-[#060e20]" />

          {/* Setup Start Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <Trophy className="w-14 h-14 text-emerald-400 mb-4 animate-pulse" />
              <h2 className="font-headline-lg text-xl font-bold uppercase mb-2">
                {gameOver ? 'GRID COLLISION' : 'HIGHWAY START'}
              </h2>
              <p className="text-xs text-on-surface-variant max-w-[280px] mb-6">
                {gameOver 
                  ? `Cycle crashed at speed ${score}. +${Math.floor(score * 0.4)} XP rewarded.` 
                  : 'Steer the hovercar, collect green energy cores, and dodge red hazard cycles.'
                }
              </p>
              <Button variant="neon" onClick={startGame} className="px-8 py-3.5 text-xs font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> {gameOver ? 'RELAUNCH CARS' : 'LAUNCH ENGINE'}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile touch steer buttons */}
        <div className="flex gap-16 mt-4 w-full justify-center">
          <button 
            onTouchStart={() => { playerX.current = Math.max(20, playerX.current - 25); }}
            onClick={() => { playerX.current = Math.max(20, playerX.current - 25); }}
            className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:scale-90 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <LeftIcon className="w-6 h-6 text-primary" />
          </button>
          <button 
            onTouchStart={() => { playerX.current = Math.min(250, playerX.current + 25); }}
            onClick={() => { playerX.current = Math.min(250, playerX.current + 25); }}
            className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:scale-90 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-primary" />
          </button>
        </div>

      </main>

      <div />
    </div>
  );
};
