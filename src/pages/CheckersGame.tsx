import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { useBoardGameEngine } from '../engine/useBoardGameEngine';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckerPiece {
  id: string;
  type: 'p' | 'k'; // pawn / king
  color: 'w' | 'b'; // white (player) / black (AI)
}

type CheckersBoard = (CheckerPiece | null)[][];

interface CheckersMove {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  isJump: boolean;
  capturedR?: number;
  capturedC?: number;
}

class CheckersAudio {
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
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 0.1);
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
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
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

const audio = new CheckersAudio();

export const CheckersGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState<string[]>(['Match active. Cyber units deployed.']);
  const [selectedPiece, setSelectedPiece] = useState<{ r: number; c: number } | null>(null);
  const [validDestinations, setValidDestinations] = useState<CheckersMove[]>([]);
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

  // Checkers rule validator: gathers valid diagonal strides or jump captures
  const getMovesList = (board: CheckersBoard, color: 'w' | 'b'): CheckersMove[] => {
    const moves: CheckersMove[] = [];
    const opponent = color === 'w' ? 'b' : 'w';

    const checkSquareMoves = (r: number, c: number) => {
      const piece = board[r][c];
      if (!piece || piece.color !== color) return;

      // Directions: pawns can only go forward, kings can go both directions
      const rowDirs = piece.type === 'k' 
        ? [-1, 1] 
        : (color === 'w' ? [-1] : [1]);
      const colDirs = [-1, 1];

      rowDirs.forEach((dr) => {
        colDirs.forEach((dc) => {
          // 1. Check simple moves (1 step diagonal)
          const targetR = r + dr;
          const targetC = c + dc;
          if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
            if (board[targetR][targetC] === null) {
              moves.push({ fromR: r, fromC: c, toR: targetR, toC: targetC, isJump: false });
            }
          }

          // 2. Check jump moves (2 steps diagonal, jumping opponent)
          const jumpR = r + dr * 2;
          const jumpC = c + dc * 2;
          const trapR = r + dr;
          const trapC = c + dc;

          if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8) {
            const trapPiece = board[trapR][trapC];
            if (trapPiece && trapPiece.color === opponent && board[jumpR][jumpC] === null) {
              moves.push({
                fromR: r, fromC: c, toR: jumpR, toC: jumpC,
                isJump: true, capturedR: trapR, capturedC: trapC
              });
            }
          }
        });
      });
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        checkSquareMoves(r, c);
      }
    }

    // Forced-Jump check: if there are any jumps available, player MUST jump!
    const jumpMoves = moves.filter(m => m.isJump);
    return jumpMoves.length > 0 ? jumpMoves : moves;
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
  } = useBoardGameEngine<CheckersBoard, CheckersMove>({
    gameName: 'Checkers',
    initialBoardState: () => {
      const b = Array(8).fill(null).map(() => Array(8).fill(null));
      let idCounter = 0;
      // Setup Black at top rows 0..2
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
          if ((r + c) % 2 === 1) {
            b[r][c] = { id: `piece_${idCounter++}`, type: 'p', color: 'b' };
          }
        }
      }
      // Setup White at bottom rows 5..7
      for (let r = 5; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if ((r + c) % 2 === 1) {
            b[r][c] = { id: `piece_${idCounter++}`, type: 'p', color: 'w' };
          }
        }
      }
      return b;
    },
    getValidMoves: (pIdx, board) => {
      const color = pIdx === 0 ? 'w' : 'b';
      return getMovesList(board, color);
    },
    applyMove: (board, move, pIdx) => {
      const nextBoard = board.map(r => [...r]);
      const piece = nextBoard[move.fromR][move.fromC]!;

      // Apply move
      nextBoard[move.toR][move.toC] = piece;
      nextBoard[move.fromR][move.fromC] = null;

      // Handle capture remove
      if (move.isJump && move.capturedR !== undefined && move.capturedC !== undefined) {
        nextBoard[move.capturedR][move.capturedC] = null;
      }

      // King promotion baseline check
      if (piece.color === 'w' && move.toR === 0) {
        nextBoard[move.toR][move.toC] = { ...piece, type: 'k' };
      } else if (piece.color === 'b' && move.toR === 7) {
        nextBoard[move.toR][move.toC] = { ...piece, type: 'k' };
      }

      return nextBoard;
    },
    checkWin: (board, pIdx) => {
      const opponentColor = pIdx === 0 ? 'b' : 'w';
      // Opponent loses if they have no pieces or no valid moves remaining
      let pieceCount = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.color === opponentColor) pieceCount++;
        }
      }
      if (pieceCount === 0) return true;

      const validOpponentMoves = getMovesList(board, opponentColor).length;
      return validOpponentMoves === 0;
    },
    checkDraw: () => false
  });

  const initGame = () => {
    setupGame([
      { id: 'player_user', name: user?.username || 'Vortex', avatar: user?.avatarUrl || '', color: 'blue', rank: user?.stats.rank || 1500, isBot: false, timeRemaining: 300 },
      { id: 'bot_checkers', name: 'NEXUS_AI', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKS2zywQA4tK355lM3NQI0J9G2IHRAwGhAcGCxIowggFAtPbrbkE4uZ6RXasRg0y3cYws8sPtCTfhW0ZEBnmU917mUVLq4A673waOp4lB51a_RGkLJO9GI3Pe5nIEXMSdgCZsGpXTarGFElfWWgzQk6Nbvq7GDDQquP9E5lktR164m09RKkBzEtfWPvXWphBg8bM2fdcKZAfdcg0ljWKiPOS7ebdLdAAxl8XAb5QNROiq62LgKTvFn', color: 'pink', rank: 1450, isBot: true, timeRemaining: 300 }
    ], 300);
    setLogs(['Session started. Cyber units deployed.']);
    setSelectedPiece(null);
    setValidDestinations([]);
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
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
        setLogs(prev => [...prev, 'VICTORY! Sector secured. +150 XP rewarded.']);
      } else if (winnerIndex === 1) {
        audio.playCapture();
        setLogs(prev => [...prev, 'Session Lost. AI secured grid connection.']);
      }
    }
  }, [gameState, winnerIndex]);

  const selectSquare = (r: number, c: number) => {
    if (gameState !== 'playing' || players[activePlayerIndex]?.isBot) return;

    // Check if clicking a valid destination move coordinate
    const validMove = validDestinations.find(d => d.toR === r && d.toC === c);
    if (validMove && selectedPiece) {
      // Execute move
      if (validMove.isJump) audio.playCapture();
      else audio.playMove();

      makeMove(0, validMove, `Move from ${selectedPiece.r},${selectedPiece.c} to ${r},${c}`);
      setLogs(prev => [...prev, `You moved a unit to cell ${r + 1}, ${c + 1}.`]);

      setSelectedPiece(null);
      setValidDestinations([]);
      return;
    }

    const cell = boardState[r][c];
    if (cell && cell.color === 'w') {
      const allMoves = getMovesList(boardState, 'w');
      const pieceMoves = allMoves.filter(m => m.fromR === r && m.fromC === c);
      
      setSelectedPiece({ r, c });
      setValidDestinations(pieceMoves);
    } else {
      setSelectedPiece(null);
      setValidDestinations([]);
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
            <h1 className="font-headline-lg text-lg font-bold text-primary tracking-wider">CHECKERS</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 8x8 • Diagonal Capture Mode</p>
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
        
        {/* Left: Board */}
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

          {/* 8x8 checkers board */}
          <div className="w-full max-w-[460px] aspect-square bg-[#0b1326]/40 p-3 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-8 grid-rows-8 gap-0.5 w-full h-full">
              {boardState.map((row, rIdx) => 
                row.map((cell, cIdx) => {
                  const isDarkSquare = (rIdx + cIdx) % 2 === 1;
                  const isSelected = selectedPiece?.r === rIdx && selectedPiece?.c === cIdx;
                  const isValidDest = validDestinations.some(d => d.toR === rIdx && d.toC === cIdx);

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => selectSquare(rIdx, cIdx)}
                      className={`relative flex items-center justify-center aspect-square transition-all ${
                        isDarkSquare ? 'bg-[#0f192e]/60' : 'bg-[#1b2640]/20'
                      } ${
                        isSelected 
                          ? 'ring-2 ring-primary bg-primary/25 z-10' 
                          : isValidDest 
                          ? 'ring-2 ring-emerald-500/50 bg-emerald-500/10 z-10 cursor-pointer' 
                          : ''
                      }`}
                    >
                      {/* Checkers disc pieces */}
                      {cell && (
                        <div className={`w-3/4 h-3/4 rounded-full border-2 flex items-center justify-center transition-all ${
                          cell.color === 'w' 
                            ? 'bg-primary border-white/20 shadow-[0_0_10px_#3B82F6]' 
                            : 'bg-pink-500 border-white/15 shadow-[0_0_10px_#EC4899]'
                        }`}>
                          {cell.type === 'k' && (
                            <span className="text-[10px] font-extrabold text-white">K</span>
                          )}
                        </div>
                      )}

                      {/* Destination dots */}
                      {!cell && isValidDest && (
                        <div className="w-2.5 h-2.5 bg-emerald-500/50 rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Logs */}
        <div className="lg:col-span-4 flex flex-col gap-4 w-full">
          <Card level={3} className="p-5 h-[340px] flex flex-col border border-white/5 bg-black/30">
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
