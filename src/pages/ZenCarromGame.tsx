import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';

class CarromAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playStrike() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playPocket() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.2); // C6 sweep
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
}

const audio = new CarromAudio();

interface Puck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  points: number;
  isStriker: boolean;
}

export const ZenCarromGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { addXP } = useAuthStore();

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopId = useRef<number | null>(null);

  // Physical entities state refs
  const pucks = useRef<Puck[]>([]);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragCurrent = useRef({ x: 0, y: 0 });

  useEffect(() => {
    audio.enabled = soundEnabled;
  }, [soundEnabled]);

  const initBoard = () => {
    const W = 400;
    const center = W / 2;

    const list: Puck[] = [];

    // 1. White Pucks (4)
    list.push({ x: center - 16, y: center - 16, vx: 0, vy: 0, radius: 10, color: '#FFFFFF', points: 10, isStriker: false });
    list.push({ x: center + 16, y: center + 16, vx: 0, vy: 0, radius: 10, color: '#FFFFFF', points: 10, isStriker: false });
    list.push({ x: center - 16, y: center + 16, vx: 0, vy: 0, radius: 10, color: '#FFFFFF', points: 10, isStriker: false });
    list.push({ x: center + 16, y: center - 16, vx: 0, vy: 0, radius: 10, color: '#FFFFFF', points: 10, isStriker: false });

    // 2. Black Pucks (4)
    list.push({ x: center, y: center - 22, vx: 0, vy: 0, radius: 10, color: '#0b1326', points: 10, isStriker: false });
    list.push({ x: center, y: center + 22, vx: 0, vy: 0, radius: 10, color: '#0b1326', points: 10, isStriker: false });
    list.push({ x: center - 22, y: center, vx: 0, vy: 0, radius: 10, color: '#0b1326', points: 10, isStriker: false });
    list.push({ x: center + 22, y: center, vx: 0, vy: 0, radius: 10, color: '#0b1326', points: 10, isStriker: false });

    // 3. Red Queen (1)
    list.push({ x: center, y: center, vx: 0, vy: 0, radius: 10, color: '#EF4444', points: 50, isStriker: false });

    // 4. Striker (1)
    list.push({ x: center, y: 320, vx: 0, vy: 0, radius: 14, color: '#3B82F6', points: 0, isStriker: true });

    pucks.current = list;
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initBoard();
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find striker
    const striker = pucks.current.find(p => p.isStriker);
    if (!striker) return;

    // Check if clicked near striker
    const dist = Math.hypot(x - striker.x, y - striker.y);
    if (dist < striker.radius * 2) {
      isDragging.current = true;
      dragStart.current = { x: striker.x, y: striker.y };
      dragCurrent.current = { x, y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragCurrent.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Find striker
    const striker = pucks.current.find(p => p.isStriker);
    if (!striker) return;

    // Apply impulse velocity
    const dx = dragStart.current.x - dragCurrent.current.x;
    const dy = dragStart.current.y - dragCurrent.current.y;
    
    striker.vx = dx * 0.15;
    striker.vy = dy * 0.15;

    audio.playStrike();
  };

  // Physics loop
  const updatePhysics = () => {
    const W = 400;
    const pockets = [
      { x: 25, y: 25 },
      { x: 375, y: 25 },
      { x: 25, y: 375 },
      { x: 375, y: 375 }
    ];

    const list = pucks.current;

    // Move pucks & handle walls
    list.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // Friction
      p.vx *= 0.98;
      p.vy *= 0.98;

      if (Math.abs(p.vx) < 0.05) p.vx = 0;
      if (Math.abs(p.vy) < 0.05) p.vy = 0;

      // Wall reflections
      const border = 18;
      if (p.x - p.radius < border) {
        p.x = border + p.radius;
        p.vx = -p.vx * 0.8;
      }
      if (p.x + p.radius > W - border) {
        p.x = W - border - p.radius;
        p.vx = -p.vx * 0.8;
      }
      if (p.y - p.radius < border) {
        p.y = border + p.radius;
        p.vy = -p.vy * 0.8;
      }
      if (p.y + p.radius > W - border) {
        p.y = W - border - p.radius;
        p.vy = -p.vy * 0.8;
      }
    });

    // Elastic collisions solver (Circle-Circle physics)
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const p1 = list[i];
        const p2 = list[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);

        if (dist < p1.radius + p2.radius) {
          // Push out of overlap
          const overlap = p1.radius + p2.radius - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;

          // Elastic collision vectors
          const kx = p1.vx - p2.vx;
          const ky = p1.vy - p2.vy;
          const p = nx * kx + ny * ky;

          if (p > 0) {
            p1.vx -= nx * p;
            p1.y -= ny * p; // Minor adjustment
            p2.vx += nx * p;
            p2.vy += ny * p;
            audio.playStrike();
          }
        }
      }
    }

    // Check Pocket crossings
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      const isPocketed = pockets.some((pkt) => Math.hypot(p.x - pkt.x, p.y - pkt.y) < 22);

      if (isPocketed) {
        audio.playPocket();
        if (p.isStriker) {
          // Reset striker baseline
          p.x = W / 2;
          p.y = 320;
          p.vx = 0;
          p.vy = 0;
        } else {
          setScore((s) => s + p.points);
          list.splice(i, 1);
        }
      }
    }

    // End condition check: all pucks pocketed
    if (list.length === 1 && list[0].isStriker) {
      setGameOver(true);
      addXP(150);
    }
  };

  // Rendering Loop
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const center = W / 2;

    // Clean board
    ctx.fillStyle = '#1e293b'; // Slate wooden board background
    ctx.fillRect(0, 0, W, W);

    // Draw borders
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 18;
    ctx.strokeRect(0, 0, W, W);

    // Draw pockets
    ctx.fillStyle = '#020617';
    const pocketCoords = [25, 375];
    pocketCoords.forEach((px) => {
      pocketCoords.forEach((py) => {
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    });

    // Draw baseline
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(35, 320);
    ctx.lineTo(365, 320);
    ctx.stroke();

    // Draw center circle
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Draw aiming guideline vector
    if (isDragging.current) {
      const striker = pucks.current.find(p => p.isStriker);
      if (striker) {
        const dx = dragStart.current.x - dragCurrent.current.x;
        const dy = dragStart.current.y - dragCurrent.current.y;
        
        ctx.strokeStyle = '#10B981'; // Green guideline
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(striker.x, striker.y);
        ctx.lineTo(striker.x + dx * 2, striker.y + dy * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw Pucks
    pucks.current.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.isStriker ? 10 : 0;
      ctx.shadowColor = p.color;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner details
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    updatePhysics();
    gameLoopId.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopId.current = requestAnimationFrame(render);
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
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">ZEN CARROM</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 400x400 • Zen Sandbox</p>
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
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">POINTS COLLECTED</p>
            <h4 className="font-headline-lg text-lg text-primary mt-1">{score}</h4>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">STRIKER STATUS</p>
            <h4 className="font-headline-lg text-lg text-emerald-400 mt-1">LOCKED</h4>
          </div>
        </div>

        {/* Board Canvas */}
        <div className="relative w-full aspect-square max-w-[400px] bg-[#0b1326]/30 border border-white/10 rounded-3xl p-3 shadow-2xl flex items-center justify-center overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width="400" 
            height="400" 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full rounded-xl cursor-crosshair" 
          />

          {/* Setup Start Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <Trophy className="w-14 h-14 text-emerald-400 mb-4 animate-pulse" />
              <h2 className="font-headline-lg text-xl font-bold uppercase mb-2">MATRIX CLEARED</h2>
              <p className="text-xs text-on-surface-variant max-w-[280px] mb-6">
                All pucks pocketed cleanly. +150 XP rewarded for Zen mastery.
              </p>
              <Button variant="neon" onClick={initBoard} className="px-8 py-3.5 text-xs font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> RESET BOARD
              </Button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-on-surface-variant text-center max-w-[320px]">
          Drag backward on the blue striker at the baseline to aim. Release to fire the pocket strike!
        </p>

      </main>

      <div />
    </div>
  );
};
