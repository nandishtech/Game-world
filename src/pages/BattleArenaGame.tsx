import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

class BattleAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  playExplode() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }
}

const audio = new BattleAudio();

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  isBoss: boolean;
}

interface Laser {
  x: number;
  y: number;
  vy: number;
  color: string;
  isEnemy: boolean;
}

export const BattleArenaGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { addXP } = useAuthStore();

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopId = useRef<number | null>(null);

  // Space coordinates refs
  const px = useRef(200);
  const py = useRef(380);
  const shield = useRef(100);
  const lasers = useRef<Laser[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const keysPressed = useRef<Record<string, boolean>>({});
  const lastShot = useRef(0);
  const localScore = useRef(0);
  const bossSpawned = useRef(false);

  useEffect(() => {
    audio.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const saved = localStorage.getItem('battle_arena_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Listen to spaceship keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60FPS Game Loop
  const loop = () => {
    if (gameOver || hasWon || !isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // --- 1. PROCESS PLAYER steering ---
    const speed = 4.5;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
      px.current = Math.max(15, px.current - speed);
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
      px.current = Math.min(W - 15, px.current + speed);
    }
    if (keysPressed.current['ArrowUp'] || keysPressed.current['w']) {
      py.current = Math.max(100, py.current - speed);
    }
    if (keysPressed.current['ArrowDown'] || keysPressed.current['s']) {
      py.current = Math.min(H - 25, py.current + speed);
    }

    // Firing lasers (Spacebar or Mouse click)
    const now = Date.now();
    if (keysPressed.current[' '] && now - lastShot.current > 180) {
      lasers.current.push({ x: px.current, y: py.current - 12, vy: -7, color: '#3B82F6', isEnemy: false });
      audio.playLaser();
      lastShot.current = now;
    }

    // --- 2. UPDATE ENTITIES ---
    // Spawn standard Drones
    if (!bossSpawned.current && Math.random() < 0.025) {
      enemies.current.push({
        x: Math.random() * (W - 30) + 15,
        y: -20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.2 + 1,
        radius: 12,
        hp: 1,
        isBoss: false
      });
    }

    // Spawn Boss Core at 500 score points
    if (localScore.current >= 500 && !bossSpawned.current) {
      bossSpawned.current = true;
      enemies.current.push({
        x: W / 2,
        y: 80,
        vx: 1.2,
        vy: 0,
        radius: 35,
        hp: 35,
        isBoss: true
      });
    }

    // Boss Core firing lasers
    enemies.current.forEach((e) => {
      if (e.isBoss && Math.random() < 0.04) {
        lasers.current.push({ x: e.x, y: e.y + 35, vy: 5, color: '#EF4444', isEnemy: true });
        audio.playLaser();
      }
    });

    // Move lasers
    lasers.current.forEach((l) => {
      l.y += l.vy;
    });

    // Move enemies
    enemies.current.forEach((e) => {
      e.x += e.vx;
      e.y += e.vy;

      // Bounce boss core off side walls
      if (e.isBoss) {
        if (e.x - e.radius < 10 || e.x + e.radius > W - 10) {
          e.vx = -e.vx;
        }
      }
    });

    // Clean out-of-bounds items
    lasers.current = lasers.current.filter((l) => l.y > -20 && l.y < H + 20);
    enemies.current = enemies.current.filter((e) => e.y < H + 30);

    // Collisions check
    // A. Player Lasers hitting enemies
    for (let lIdx = lasers.current.length - 1; lIdx >= 0; lIdx--) {
      const l = lasers.current[lIdx];
      if (l.isEnemy) continue;

      for (let eIdx = enemies.current.length - 1; eIdx >= 0; eIdx--) {
        const e = enemies.current[eIdx];
        const dist = Math.hypot(l.x - e.x, l.y - e.y);

        if (dist < e.radius + 3) {
          // HIT!
          e.hp -= 1;
          lasers.current.splice(lIdx, 1);

          if (e.hp <= 0) {
            audio.playExplode();
            enemies.current.splice(eIdx, 1);
            if (e.isBoss) {
              handleGameWin();
              return;
            } else {
              localScore.current += 20;
              setScore(localScore.current);
            }
          }
          break;
        }
      }
    }

    // B. Enemy Drones / Lasers hitting player
    // Lasers hitting player
    for (let lIdx = lasers.current.length - 1; lIdx >= 0; lIdx--) {
      const l = lasers.current[lIdx];
      if (!l.isEnemy) continue;

      const dist = Math.hypot(l.x - px.current, l.y - py.current);
      if (dist < 18) {
        shield.current = Math.max(0, shield.current - 15);
        lasers.current.splice(lIdx, 1);
        audio.playExplode();
        if (shield.current <= 0) {
          handleGameOver();
          return;
        }
      }
    }

    // Drones crashing into player
    for (let eIdx = enemies.current.length - 1; eIdx >= 0; eIdx--) {
      const e = enemies.current[eIdx];
      const dist = Math.hypot(e.x - px.current, e.y - py.current);

      if (dist < e.radius + 14) {
        shield.current = Math.max(0, shield.current - 25);
        enemies.current.splice(eIdx, 1);
        audio.playExplode();
        if (shield.current <= 0) {
          handleGameOver();
          return;
        }
      }
    }

    // --- 3. RENDER GAME SCENE ---
    ctx.fillStyle = '#060e20';
    ctx.fillRect(0, 0, W, H);

    // Draw grid matrix background
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= W; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    for (let i = 0; i <= H; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(W, i);
      ctx.stroke();
    }

    // Draw Lasers
    lasers.current.forEach((l) => {
      ctx.fillStyle = l.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = l.color;
      ctx.fillRect(l.x - 1.5, l.y, 3, 10);
      ctx.shadowBlur = 0;
    });

    // Draw Enemies
    enemies.current.forEach((e) => {
      if (e.isBoss) {
        // Red glowing core boss
        ctx.fillStyle = '#EF4444';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#EF4444';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Boss Health Bar overlay
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(e.x - 20, e.y - 45, 40, 4);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(e.x - 20, e.y - 45, 40 * (e.hp / 35), 4);
      } else {
        // Drone cycles
        ctx.fillStyle = '#f39461';
        ctx.beginPath();
        ctx.moveTo(e.x, e.y + e.radius);
        ctx.lineTo(e.x - e.radius, e.y - e.radius);
        ctx.lineTo(e.x + e.radius, e.y - e.radius);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Draw Player Spaceship (Glowing blue wedge triangle)
    ctx.fillStyle = '#3B82F6';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(px.current, py.current - 12);
    ctx.lineTo(px.current - 12, py.current + 12);
    ctx.lineTo(px.current + 12, py.current + 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw side thruster sparks
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(px.current - 3, py.current + 13, 6, 4);

    loopId.current = requestAnimationFrame(loop);
  };

  const handleGameWin = () => {
    setHasWon(true);
    setIsPlaying(false);
    audio.playExplode();
    addXP(500); // Triumphant win reward
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  };

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
    audio.playExplode();
    if (localScore.current > 0) {
      addXP(Math.floor(localScore.current * 0.5));
    }
  };

  const startGame = () => {
    px.current = 200;
    py.current = 380;
    shield.current = 100;
    lasers.current = [];
    enemies.current = [];
    localScore.current = 0;
    bossSpawned.current = false;
    setScore(0);
    setGameOver(false);
    setHasWon(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && !gameOver && !hasWon) {
      loopId.current = requestAnimationFrame(loop);
    }
    return () => {
      if (loopId.current) cancelAnimationFrame(loopId.current);
    };
  }, [isPlaying, gameOver, hasWon]);

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
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">BATTLE ARENA</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 400x500 • MOBA Core Shooter</p>
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
        
        {/* Score & Shield Board */}
        <div className="grid grid-cols-2 gap-4 w-full text-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">ARENA SCORE</p>
            <h4 className="font-headline-lg text-lg text-primary mt-1">{score}</h4>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">SHIELD CORE</p>
            <h4 className="font-headline-lg text-lg text-red-500 mt-1">{isPlaying ? shield.current : 0}%</h4>
          </div>
        </div>

        {/* Board Canvas */}
        <div className="relative w-full aspect-[4/5] max-w-[400px] bg-[#0b1326]/30 border border-white/10 rounded-3xl p-3 shadow-2xl flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} width="400" height="500" className="w-full h-full rounded-xl bg-[#060e20]" />

          {/* Setup Start Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <Trophy className="w-14 h-14 text-primary mb-4 animate-bounce" />
              <h2 className="font-headline-lg text-xl font-bold uppercase mb-2">
                {hasWon ? 'MISSION CLEAR' : gameOver ? 'SHIELD CORE COLLAPSED' : 'DEPARTURE GATES'}
              </h2>
              <p className="text-xs text-on-surface-variant max-w-[280px] mb-6">
                {hasWon 
                  ? 'Boss Core neutralized successfully! +500 XP rewarded.' 
                  : gameOver 
                  ? `Ship crashed at score ${score}. +${Math.floor(score * 0.5)} XP rewarded.` 
                  : 'Use W/A/S/D or Arrow keys to steer your ship. Hold Spacebar to fire lasers and destroy the Boss Core at 500 points!'
                }
              </p>
              <Button variant="neon" onClick={startGame} className="px-8 py-3.5 text-xs font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> {hasWon || gameOver ? 'LAUNCH REDEPLOY' : 'ENGAGE THRUSTERS'}
              </Button>
            </div>
          )}
        </div>

      </main>

      <div />
    </div>
  );
};
