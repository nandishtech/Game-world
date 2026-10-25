import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Trophy, User } from 'lucide-react';
import confetti from 'canvas-confetti';

class TTTAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playClick(isX: boolean) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isX ? 523.25 : 659.25, this.ctx.currentTime); // C5 or E5
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 major chord arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.15, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.35);
    });
  }

  playDraw() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
}

const audio = new TTTAudio();

type BoardState = (string | null)[];

export const TicTacToeGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user, addXP } = useAuthStore();
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState<'single' | 'local'>('single');
  const [difficulty, setDifficulty] = useState<'medium' | 'impossible'>('impossible');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });
  const [winnerLine, setWinnerLine] = useState<number[] | null>(null);
  const [statusText, setStatusText] = useState('Your turn! Place your X.');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    audio.enabled = soundEnabled;
  }, [soundEnabled]);

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
      size: Math.random() * 1.2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random()
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle neon background sweeps
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, Math.min(width, height) * 0.6);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
      grad.addColorStop(0.5, 'rgba(236, 72, 153, 0.02)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, Math.min(width, height) * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Update & Draw particles
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

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (currentBoard: BoardState) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    return null;
  };

  const isBoardFull = (currentBoard: BoardState) => {
    return currentBoard.every(cell => cell !== null);
  };

  // AI Logic: Minimax or Medium heuristic
  useEffect(() => {
    if (gameMode === 'single' && !isXNext && !winnerLine && !isBoardFull(board)) {
      setStatusText('AI calculating tactical link...');
      const delay = setTimeout(() => {
        makeAIMove();
      }, 600);
      return () => clearTimeout(delay);
    }
  }, [isXNext, gameMode, board]);

  const handleCellClick = (index: number) => {
    if (board[index] || winnerLine || (gameMode === 'single' && !isXNext)) return;

    const currentPlayer = isXNext ? 'X' : 'O';
    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    audio.playClick(isXNext);
    setBoard(newBoard);

    const winResult = checkWinner(newBoard);
    if (winResult) {
      setWinnerLine(winResult.line);
      handleGameEnd(winResult.winner, winResult.line);
      return;
    }

    if (isBoardFull(newBoard)) {
      handleGameEnd('draw', null);
      return;
    }

    setIsXNext(!isXNext);
    setStatusText(gameMode === 'single' ? 'AI Turn...' : `Player ${!isXNext ? 'X' : 'O'}'s turn`);
  };

  const makeAIMove = () => {
    let bestIndex = -1;

    if (difficulty === 'impossible') {
      bestIndex = getBestMinimaxMove(board, 'O').index;
    } else {
      // Medium difficulty: Block or Win if possible, else random
      bestIndex = findWinningOrBlockingMove('O'); // Check win
      if (bestIndex === -1) {
        bestIndex = findWinningOrBlockingMove('X'); // Block opponent win
      }
      if (bestIndex === -1) {
        // Fallback to center or corners
        const cornersAndCenter = [4, 0, 2, 6, 8];
        const available = cornersAndCenter.filter(idx => board[idx] === null);
        if (available.length > 0) {
          bestIndex = available[Math.floor(Math.random() * available.length)];
        } else {
          // Absolute random fallback
          const remaining = board.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null) as number[];
          bestIndex = remaining[Math.floor(Math.random() * remaining.length)];
        }
      }
    }

    if (bestIndex !== -1) {
      const newBoard = [...board];
      newBoard[bestIndex] = 'O';
      audio.playClick(false);
      setBoard(newBoard);

      const winResult = checkWinner(newBoard);
      if (winResult) {
        setWinnerLine(winResult.line);
        handleGameEnd('O', winResult.line);
        return;
      }

      if (isBoardFull(newBoard)) {
        handleGameEnd('draw', null);
        return;
      }

      setIsXNext(true);
      setStatusText('Your turn! Place your X.');
    }
  };

  // Check if there is a cell to win or block
  const findWinningOrBlockingMove = (player: string) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      const cells = [board[a], board[b], board[c]];
      const playerCount = cells.filter(cell => cell === player).length;
      const emptyCount = cells.filter(cell => cell === null).length;

      if (playerCount === 2 && emptyCount === 1) {
        if (board[a] === null) return a;
        if (board[b] === null) return b;
        if (board[c] === null) return c;
      }
    }
    return -1;
  };

  // Minimax Algorithm for Impossible AI
  const getBestMinimaxMove = (tempBoard: BoardState, player: 'O' | 'X'): { score: number; index: number } => {
    const winResult = checkWinner(tempBoard);
    if (winResult) {
      if (winResult.winner === 'O') return { score: 10, index: -1 };
      if (winResult.winner === 'X') return { score: -10, index: -1 };
    }
    if (isBoardFull(tempBoard)) return { score: 0, index: -1 };

    const availSpots: number[] = tempBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    const moves: { score: number; index: number }[] = [];

    for (let i = 0; i < availSpots.length; i++) {
      const currentSpot = availSpots[i];
      const nextBoard = [...tempBoard];
      nextBoard[currentSpot] = player;

      let score = 0;
      if (player === 'O') {
        const result = getBestMinimaxMove(nextBoard, 'X');
        score = result.score;
      } else {
        const result = getBestMinimaxMove(nextBoard, 'O');
        score = result.score;
      }

      moves.push({ score, index: currentSpot });
    }

    let bestMove = 0;
    if (player === 'O') {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  };

  const handleGameEnd = (result: string, line: number[] | null) => {
    if (result === 'draw') {
      audio.playDraw();
      setStatusText('Session draw. Tactical deadlock.');
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
    } else if (result === 'X') {
      audio.playWin();
      setStatusText('Victory Authorized! Sector cleared.');
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      
      // XP reward
      addXP(100);

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      audio.playDraw();
      setStatusText('Session failed. AI secured connection.');
      setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinnerLine(null);
    setIsXNext(true);
    setStatusText('Session reset. Ready for deployment.');
  };

  const changeMode = (mode: 'single' | 'local') => {
    setGameMode(mode);
    setScore({ player: 0, ai: 0, draws: 0 });
    resetBoard();
  };

  return (
    <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] overflow-x-hidden flex flex-col justify-between'}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Top Controls */}
      <header className="relative z-10 max-w-2xl w-full mx-auto px-margin-mobile flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/library')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-pink-500 tracking-wider">HYPER TTT</h1>
            <p className="text-[10px] text-on-surface-variant">Grid Matrix 3x3 • Neon Mode</p>
          </div>
        </div>

        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-on-surface-variant" />}
        </button>
      </header>

      {/* Main Grid Game */}
      <main className="relative z-10 max-w-md w-full mx-auto px-margin-mobile flex flex-col items-center gap-6">
        
        {/* Game Mode / Level Selection */}
        <div className="flex gap-4 w-full bg-white/5 p-1.5 rounded-xl border border-white/10">
          <button 
            onClick={() => changeMode('single')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${gameMode === 'single' ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(77,142,255,0.3)]' : 'bg-transparent text-on-surface-variant hover:text-white'}`}
          >
            VS AI
          </button>
          <button 
            onClick={() => changeMode('local')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${gameMode === 'local' ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(77,142,255,0.3)]' : 'bg-transparent text-on-surface-variant hover:text-white'}`}
          >
            LOCAL 2P
          </button>
        </div>

        {gameMode === 'single' && (
          <div className="flex gap-3 justify-center text-xs">
            <span className="text-on-surface-variant">AI Protocol:</span>
            <button 
              onClick={() => setDifficulty('medium')} 
              className={`font-bold transition-all ${difficulty === 'medium' ? 'text-primary underline' : 'text-on-surface-variant hover:text-white'}`}
            >
              MEDIUM
            </button>
            <button 
              onClick={() => setDifficulty('impossible')} 
              className={`font-bold transition-all ${difficulty === 'impossible' ? 'text-pink-500 underline' : 'text-on-surface-variant hover:text-white'}`}
            >
              IMPOSSIBLE
            </button>
          </div>
        )}

        {/* Score Board */}
        <div className="grid grid-cols-3 gap-4 w-full text-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">PLAYER</p>
            <h4 className="font-headline-lg text-lg text-primary mt-1">{score.player}</h4>
          </div>
          <div className="border-x border-white/5">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">DRAWS</p>
            <h4 className="font-headline-lg text-lg text-white mt-1">{score.draws}</h4>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">{gameMode === 'single' ? 'AI PROTO' : 'PLAYER 2'}</p>
            <h4 className="font-headline-lg text-lg text-pink-500 mt-1">{score.ai}</h4>
          </div>
        </div>

        {/* Interactive Status */}
        <p className={`text-sm font-semibold tracking-wide text-center animate-pulse ${
          winnerLine ? 'text-pink-500' : 'text-primary'
        }`}>
          {statusText}
        </p>

        {/* 3x3 Tic Tac Toe Grid Board */}
        <div className="relative w-full aspect-square bg-[#0b1326]/30 border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center justify-center">
          <div className="grid grid-cols-3 grid-rows-3 gap-3 w-full h-full">
            {board.map((cell, idx) => {
              const isWinnerCell = winnerLine?.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className={`relative rounded-2xl border flex items-center justify-center transition-all aspect-square cursor-pointer active:scale-95 ${
                    isWinnerCell 
                      ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]' 
                      : cell 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-black/40 border-white/5 hover:border-primary/40 hover:bg-[#0b1326]/20'
                  }`}
                >
                  {cell === 'X' && (
                    <svg className="w-3/5 h-3/5 text-primary drop-shadow-[0_0_10px_#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                  {cell === 'O' && (
                    <svg className="w-3/5 h-3/5 text-pink-500 drop-shadow-[0_0_10px_#EC4899]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <circle cx="12" cy="12" r="8"></circle>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset / Action buttons */}
        <button
          onClick={resetBoard}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> RESET MATRIX
        </button>

      </main>
      
      <div />
    </div>
  );
};
