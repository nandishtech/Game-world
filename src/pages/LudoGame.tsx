import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, MessageSquare, RotateCcw, Volume2, VolumeX, Trophy, Users, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- COORDINATE & PATH MAPPING SYSTEM ---
const COMMON_TRACK = [
  { row: 6, col: 1 },  // 0: Red Start / Safe
  { row: 6, col: 2 },  // 1
  { row: 6, col: 3 },  // 2
  { row: 6, col: 4 },  // 3
  { row: 6, col: 5 },  // 4
  { row: 5, col: 6 },  // 5
  { row: 4, col: 6 },  // 6
  { row: 3, col: 6 },  // 7
  { row: 2, col: 6 },  // 8
  { row: 1, col: 6 },  // 9
  { row: 0, col: 6 },  // 10
  { row: 0, col: 7 },  // 11
  { row: 0, col: 8 },  // 12: Green Start
  { row: 1, col: 8 },  // 13: Green Safe
  { row: 2, col: 8 },  // 14
  { row: 3, col: 8 },  // 15
  { row: 4, col: 8 },  // 16
  { row: 5, col: 8 },  // 17
  { row: 6, col: 9 },  // 18
  { row: 6, col: 10 }, // 19
  { row: 6, col: 11 }, // 20
  { row: 6, col: 12 }, // 21
  { row: 6, col: 13 }, // 22
  { row: 6, col: 14 }, // 23
  { row: 7, col: 14 }, // 24
  { row: 8, col: 14 }, // 25: Yellow Start
  { row: 8, col: 13 }, // 26: Yellow Safe
  { row: 8, col: 12 }, // 27
  { row: 8, col: 11 }, // 28
  { row: 8, col: 10 }, // 29
  { row: 8, col: 9 },  // 30
  { row: 9, col: 8 },  // 31
  { row: 10, col: 8 }, // 32
  { row: 11, col: 8 }, // 33
  { row: 12, col: 8 }, // 34
  { row: 13, col: 8 }, // 35
  { row: 14, col: 8 }, // 36
  { row: 14, col: 7 }, // 37
  { row: 14, col: 6 }, // 38: Blue Start
  { row: 13, col: 6 }, // 39: Blue Safe
  { row: 12, col: 6 }, // 40
  { row: 11, col: 6 }, // 41
  { row: 10, col: 6 }, // 42
  { row: 9, col: 6 },  // 43
  { row: 8, col: 5 },  // 44
  { row: 8, col: 4 },  // 45
  { row: 8, col: 3 },  // 46
  { row: 8, col: 2 },  // 47
  { row: 8, col: 1 },  // 48
  { row: 8, col: 0 },  // 49
  { row: 7, col: 0 },  // 50
  { row: 6, col: 0 }   // 51
];

const SAFE_CELLS = [0, 13, 26, 39]; // Safe star cells indices

interface Player {
  id: string;
  name: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  avatar: string;
  startCell: number;
  tokens: number[]; // -1 = home, 0-50 = track, 51-55 = home path, 56 = finished
  isBot: boolean;
}

// Sound Synthesizer via Web Audio API
class LudoAudio {
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
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playMove() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(760, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCapture() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
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

const audio = new LudoAudio();

const DICE_SKIN_IMAGES: Record<string, string> = {
  'Fire Dice': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7nEEHeK52TiY-ghZ41W8wC3MfmdKGIsg4ZEZsXvxPI1ry5YY2jBpQ62LnbPeFKc9nU2TYr96RwuXuknctLtY7EQ3ka4bs_sfAonuwUtxGtIZs8KvFmc1S8AqcLGPEci_y-nTLNMcXGuqi21Jf_V813ejtvDadPuQvNRphUezchcswLk1EJIQ5NLLX7QTgzGt78-cKFxJWQEskWQeDf9CKsLMMeqoO3N4mya1WF19Q7uSsrkPS3FzE',
  'Frostbite Dice': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtw6j7X0KUrZ3vL7aEL_5MyUUwjqd_lefdU5_pORNxF7gbZHn-6EWmC-RZ-MITk-lm0LHXrrFLc2ouJO-X_udz8W2MBOBYHEquKcaJGzLivJV6MQeBthY4DHfPWdWas0nR2--n8sW6hiMZ-XKgb9yvc0PL2QdaR6HYRurLf2gsowcW_9v55dZ8_1ykbeu_A68XwEOTq3o2mgYKrMKQqVF9f5_nQV4rwRQPlF-MuOMjjNu8mRV_9P6I',
  'Nebula Dice': 'https://lh3.googleusercontent.com/aida-public/AB6AXuInlTTr5HVguyOW4e5vhi6oRYtieFrYVVm7gqHTRfvV743TrXVaKk5yG-HZbNklvbWl_K_6UK5ZtnApNyJ7XWJdqfGSTlpiB9Z2DUjJ8Z7aP8vEZj5KMRDvsMDjgsxQ68HlilE7rl-_oX6n9Exu66AEyUChGd4gbG-ToHMi0Z5Ft8s9BcFKWi9oPY_OQR_EvJjvyNA-nkXNyN09xMoDftsC-3ZLVQX6hq8MKrpcuQe49drN5CsTvyc'
};

export const LudoGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user, addXP } = useAuthStore();
  
  // Game Setup Menu states
  const [inSetup, setInSetup] = useState(true);
  const [selectedColor, setSelectedColor] = useState<'red' | 'green' | 'yellow' | 'blue'>('blue');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);

  // Lobby, Shop & Leaderboard Navigation States (matching files_10 templates)
  const [activeTab, setActiveTab] = useState<'lobby' | 'setup' | 'shop' | 'leaderboards'>('lobby');
  const [purchasedSkins, setPurchasedSkins] = useState<string[]>(['Default Dice']);
  const [equippedSkin, setEquippedSkin] = useState<string>('Default Dice');
  const { spendCoins } = useAuthStore();

  // Game Engine states
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'rolling' | 'moving' | 'finished'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [chats, setChats] = useState<{ sender: string; text: string }[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timerProgress, setTimerProgress] = useState(100);
  const [winner, setWinner] = useState<Player | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    audio.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const parent = logsEndRef.current?.parentElement;
    if (parent) {
      parent.scrollTop = parent.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const parent = chatEndRef.current?.parentElement;
    if (parent) {
      parent.scrollTop = parent.scrollHeight;
    }
  }, [chats]);

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

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random()
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#060e20';
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, Math.min(width, height) * 0.6);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, Math.min(width, height) * 0.6, 0, Math.PI * 2);
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

  // Initialize Game Players based on setup selections
  const startGame = () => {
    const avatars = {
      red: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEvPu4jmwWjvPQ2WkABflQxyhAJE8ERPEqo-kdg_lEighQsOnr7qST6Z9JJSPM_t1WnSMHCsItFPDaJ6rxUr3iMGiGxl14AONbQe2zXC70qDOO15rMmW0o00QrtVI23DBtoRUOkVBwZHfWEyuWsJTYfE-OTSLcpqtTrwcIwBRDf9jtZk_ijTHnJpqv-hdd1fS1arOlmrZDaPIW7U8zHL9VSma3E6wgKddy1ZAkPqiWixv8imqQO72g',
      green: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKS2zywQA4tK355lM3NQI0J9G2IHRAwGhAcGCxIowggFAtPbrbkE4uZ6RXasRg0y3cYws8sPtCTfhW0ZEBnmU917mUVLq4A673waOp4lB51a_RGkLJO9GI3Pe5nIEXMSdgCZsGpXTarGFElfWWgzQk6Nbvq7GDDQquP9E5lktR164m09RKkBzEtfWPvXWphBg8bM2fdcKZAfdcg0ljWKiPOS7ebdLdAAxl8XAb5QNROiq62LgKTvFn',
      yellow: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2kYc6Wb1xoM7pk7o2DTOoAg550p4dPraqo3FFoO8hxhxjuafiizB_CNOz2a0TfGDevbZ5JVV5EKI6_WrEGqh_AFE9PQv2X2feNzwN7QvbrQIUd_eCdu9pOxH1a-pAZ3_p8IMvzeYDRRLvjCk1NxlFgSHeBB8mbiSsaqqFzoEGNMHsPoE-PdfNKhhBi8on9b3WNeDunSYDvCG4JjGNEvOErfEG3_rzMbk-hrZJzfWK9EnpUFxjRoIZ',
      blue: user?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrcfKm4VpRsuEtFxUpAgVuF55-WvsL_274JnhDt7dlJrRkPk8YXvIYCZHGpA4n7LW268c7ui7Pwl4kzUP8Xp4us9k5kUqR-hj_WeImnfsl5Gcr1ikFrCKMuMNrxA3O10o9UFvtyBieGIPTgdTfe-UHSqDs3x9lsCCHafE7Ru6TurR2Asr2CFyv9i5-R1isrwKXMf5Tzprwr5L_Y6fvRTy9u7szUavc9zs64JbboHc9vi5y1Wu0Cc7H'
    };

    const playerList: Player[] = [];
    const colors: ('red' | 'green' | 'yellow' | 'blue')[] = ['red', 'green', 'yellow', 'blue'];

    colors.forEach((col, idx) => {
      const isUserColor = col === selectedColor;
      // Filter players based on playerCount
      if (playerCount === 2 && col !== selectedColor && col !== getOppositeColor(selectedColor)) return;
      if (playerCount === 3 && col === getOppositeColor(selectedColor)) return; // 3 players filter

      playerList.push({
        id: isUserColor ? 'player_user' : `bot_${col}`,
        name: isUserColor ? user?.username || 'VORTEX' : getBotName(col),
        color: col,
        avatar: isUserColor ? avatars[selectedColor] : avatars[col],
        startCell: idx * 13,
        tokens: [-1, -1, -1, -1],
        isBot: !isUserColor
      });
    });

    setPlayers(playerList);
    setInSetup(false);
    setLogs(['Ludo sector links secured. Match active.']);
    
    // Find starting player index
    const userIndex = playerList.findIndex(p => !p.isBot);
    setActivePlayerIndex(userIndex !== -1 ? userIndex : 0);
    setChats([
      { sender: 'CYBER_JANE', text: 'Vanguard protocols initialized. HF!' },
      { sender: 'GOLD_KING', text: 'Roll standard 6 to deploy nodes from base cells.' }
    ]);
  };

  const getOppositeColor = (col: string) => {
    if (col === 'red') return 'yellow';
    if (col === 'blue') return 'green';
    if (col === 'green') return 'blue';
    return 'red';
  };

  const getBotName = (col: string) => {
    if (col === 'red') return 'DRAGON_99';
    if (col === 'green') return 'CYBER_JANE';
    if (col === 'yellow') return 'GOLD_KING';
    return 'NEXUS_BOT';
  };

  // Turn timer ring simulation
  useEffect(() => {
    if (inSetup || gameState === 'finished') return;
    setTimerProgress(100);
    const interval = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev <= 1) {
          handleAutoTimeOut();
          return 100;
        }
        return prev - 2.5;
      });
    }, 500); // 20 second turn limits

    return () => clearInterval(interval);
  }, [activePlayerIndex, gameState, inSetup]);

  // Bot actions trigger
  useEffect(() => {
    if (inSetup) return;
    const activePlayer = players[activePlayerIndex];
    if (activePlayer && activePlayer.isBot && gameState === 'idle') {
      const delay = setTimeout(() => {
        botRollAndMove();
      }, 1200);
      return () => clearTimeout(delay);
    }
  }, [activePlayerIndex, gameState, inSetup]);

  const handleAutoTimeOut = () => {
    const activePlayer = players[activePlayerIndex];
    if (activePlayer && !activePlayer.isBot && gameState === 'idle') {
      addLog(`${activePlayer.name}'s turn timed out. Automatically passing.`);
      nextTurn();
    }
  };

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const triggerBotEmote = (botName: string, type: 'capture' | 'captured' | 'win' | 'roll_6' | 'near_finish') => {
    const phrases: Record<string, string[]> = {
      capture: ['Got you! Clear swipe!', 'Reconstructing opponent cell... done.', 'Vortex shield breached.'],
      captured: ['Wait, that was safe cell? Oh no!', 'Calibrating dice vectors...', 'Rematch is incoming!'],
      win: ['Elite Rank secured GGs!', 'Digital legend established.', 'Matrix cleared successfully.'],
      roll_6: ['Nice, double movement!', 'Rolling standard 6!', 'Nexus overclock active.'],
      near_finish: ['Vortex portal in sight!', 'Securing win coordinates.', 'Power levels high.']
    };
    const options = phrases[type];
    const text = options[Math.floor(Math.random() * options.length)];
    setTimeout(() => {
      setChats((prev) => [...prev, { sender: botName, text }]);
    }, 400);
  };

  // Get exact coordinate of a token based on its current step progress
  const getTokenCoords = (color: 'red' | 'green' | 'yellow' | 'blue', step: number, tokenIndex: number) => {
    if (step === -1) {
      if (color === 'red') return [{ row: 2, col: 2 }, { row: 2, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 3 }][tokenIndex];
      if (color === 'green') return [{ row: 2, col: 11 }, { row: 2, col: 12 }, { row: 3, col: 11 }, { row: 3, col: 12 }][tokenIndex];
      if (color === 'yellow') return [{ row: 11, col: 2 }, { row: 11, col: 3 }, { row: 12, col: 2 }, { row: 12, col: 3 }][tokenIndex];
      return [{ row: 11, col: 11 }, { row: 11, col: 12 }, { row: 12, col: 11 }, { row: 12, col: 12 }][tokenIndex]; // Blue
    }

    if (step === 56) {
      if (color === 'red') return { row: 7, col: 6 };
      if (color === 'green') return { row: 6, col: 7 };
      if (color === 'yellow') return { row: 7, col: 8 };
      return { row: 8, col: 7 }; // Blue
    }

    if (step >= 51 && step <= 55) {
      const h = step - 51;
      if (color === 'red') return { row: 7, col: 1 + h };
      if (color === 'green') return { row: 1 + h, col: 7 };
      if (color === 'yellow') return { row: 7, col: 13 - h };
      return { row: 13 - h, col: 7 }; // Blue
    }

    let trackIndex = 0;
    if (color === 'red') trackIndex = (0 + step) % 52;
    else if (color === 'green') trackIndex = (13 + step) % 52;
    else if (color === 'yellow') trackIndex = (26 + step) % 52;
    else trackIndex = (39 + step) % 52; // Blue

    return COMMON_TRACK[trackIndex];
  };

  const getTrackCellIndex = (color: 'red' | 'green' | 'yellow' | 'blue', step: number) => {
    if (step < 0 || step > 50) return -1;
    if (color === 'red') return (0 + step) % 52;
    if (color === 'green') return (13 + step) % 52;
    if (color === 'yellow') return (26 + step) % 52;
    return (39 + step) % 52;
  };

  const getPlayableTokens = (player: Player, roll: number): number[] => {
    const list: number[] = [];
    player.tokens.forEach((step, idx) => {
      if (step === 56) return;
      if (step === -1) {
        if (roll === 6) list.push(idx);
      } else {
        if (step + roll <= 56) list.push(idx);
      }
    });
    return list;
  };

  const rollDice = () => {
    if (gameState !== 'idle' || players[activePlayerIndex].isBot) return;
    setGameState('rolling');
    audio.playRoll();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceRoll(roll);
      setGameState('moving');
      handleRollResults(roll);
    }, 800);
  };

  const handleRollResults = (roll: number) => {
    const player = players[activePlayerIndex];
    const playable = getPlayableTokens(player, roll);

    addLog(`${player.name} rolled a ${roll}!`);
    if (roll === 6) triggerBotEmote(player.name, 'roll_6');

    if (playable.length === 0) {
      addLog('No valid paths. Passing Turn.');
      setTimeout(() => nextTurn(), 1200);
    } else if (!player.isBot && playable.length === 1) {
      // Auto move if single option
      setTimeout(() => animateTokenMove(activePlayerIndex, playable[0], roll), 600);
    }
  };

  // Proper Ludo Step-by-Step Movement Animation
  const animateTokenMove = (playerIdx: number, tokenIdx: number, roll: number) => {
    const player = players[playerIdx];
    const startStep = player.tokens[tokenIdx];
    
    // Release home token
    if (startStep === -1) {
      moveToken(playerIdx, tokenIdx, 0); // Jump directly to start cell (0)
      return;
    }

    const endStep = startStep + roll;
    setGameState('moving');
    
    let currentStep = startStep;
    const interval = setInterval(() => {
      currentStep++;
      setPlayers(prevPlayers => prevPlayers.map((p, idx) => {
        if (idx !== playerIdx) return p;
        const tokens = [...p.tokens];
        tokens[tokenIdx] = currentStep;
        return { ...p, tokens };
      }));
      audio.playMove();

      if (currentStep >= endStep) {
        clearInterval(interval);
        setTimeout(() => finalizeMove(playerIdx, tokenIdx, endStep, roll), 250);
      }
    }, 150); // Move 1 cell every 150ms for smooth speed
  };

  const moveToken = (playerIdx: number, tokenIdx: number, targetStep: number) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== playerIdx) return p;
      const tokens = [...p.tokens];
      tokens[tokenIdx] = targetStep;
      return { ...p, tokens };
    }));
    audio.playMove();
    setTimeout(() => finalizeMove(playerIdx, tokenIdx, targetStep, 6), 250);
  };

  const finalizeMove = (playerIdx: number, tokenIdx: number, finalStep: number, roll: number) => {
    const player = players[playerIdx];
    const newCoords = getTokenCoords(player.color, finalStep, tokenIdx);
    const newTrackIndex = getTrackCellIndex(player.color, finalStep);

    let captureOccurred = false;

    // Capture Check Loop
    const nextPlayersState = players.map((otherPlayer, otherPlayerIdx) => {
      if (otherPlayerIdx === playerIdx) return otherPlayer;
      
      const updatedTokens = otherPlayer.tokens.map((oStep, oIdx) => {
        if (oStep === -1 || oStep === 56) return oStep;
        
        const otherTrackIndex = getTrackCellIndex(otherPlayer.color, oStep);
        if (
          otherTrackIndex !== -1 && 
          newTrackIndex !== -1 && 
          otherTrackIndex === newTrackIndex && 
          !SAFE_CELLS.includes(newTrackIndex)
        ) {
          captureOccurred = true;
          audio.playCapture();
          addLog(`${player.name} CAPTURED ${otherPlayer.name}'s node at Cell ${newTrackIndex}!`);
          triggerBotEmote(otherPlayer.name, 'captured');
          triggerBotEmote(player.name, 'capture');
          return -1; // Send back to home base
        }
        return oStep;
      });

      return { ...otherPlayer, tokens: updatedTokens };
    });

    setPlayers(nextPlayersState);

    // Win condition check
    if (finalStep === 56) {
      addLog(`${player.name} entered the VORTEX!`);
      const hasWon = nextPlayersState[playerIdx].tokens.every(st => st === 56);
      if (hasWon) {
        handleWin(nextPlayersState[playerIdx]);
        return;
      } else {
        triggerBotEmote(player.name, 'near_finish');
      }
    }

    // Double turns logic
    if ((roll === 6 || captureOccurred) && gameState !== 'finished') {
      addLog(`${player.name} receives bonus roll.`);
      setDiceRoll(null);
      setGameState('idle');
    } else {
      nextTurn();
    }
  };

  const botRollAndMove = () => {
    if (gameState !== 'idle') return;
    setGameState('rolling');
    audio.playRoll();

    const botIdx = activePlayerIndex;
    const bot = players[botIdx];

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceRoll(roll);
      setGameState('moving');
      addLog(`${bot.name} (AI) rolled a ${roll}.`);

      if (roll === 6) triggerBotEmote(bot.name, 'roll_6');

      const playable = getPlayableTokens(bot, roll);

      if (playable.length === 0) {
        addLog(`${bot.name} has no valid paths.`);
        setTimeout(() => nextTurn(), 1000);
      } else {
        // AI Path Decider: Prioritize capturing user first
        let chosenTokenIdx = playable[0];
        
        for (const tIdx of playable) {
          const step = bot.tokens[tIdx];
          const nextStep = step === -1 ? 0 : step + roll;
          const nextTrackIdx = getTrackCellIndex(bot.color, nextStep);

          const hasTarget = players.some((p, pI) => {
            if (pI === botIdx) return false;
            return p.tokens.some((oStep) => {
              if (oStep === -1 || oStep === 56) return false;
              const oTrackIdx = getTrackCellIndex(p.color, oStep);
              return oTrackIdx !== -1 && nextTrackIdx !== -1 && oTrackIdx === nextTrackIdx && !SAFE_CELLS.includes(nextTrackIdx);
            });
          });

          if (hasTarget) {
            chosenTokenIdx = tIdx;
            break;
          }
        }

        // Auto release home if 6 rolled
        if (roll === 6 && bot.tokens.some(st => st === -1)) {
          const homeIdx = bot.tokens.findIndex(st => st === -1);
          if (playable.includes(homeIdx)) chosenTokenIdx = homeIdx;
        }

        setTimeout(() => animateTokenMove(botIdx, chosenTokenIdx, roll), 600);
      }
    }, 1000);
  };

  const nextTurn = () => {
    setDiceRoll(null);
    setGameState('idle');
    setActivePlayerIndex(prev => (prev + 1) % players.length);
  };

  const handleWin = (player: Player) => {
    setWinner(player);
    setGameState('finished');
    audio.playWin();

    if (player.id === 'player_user') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      addXP(500);
      addLog(`VICTORY! You won Ludo Royal! +500 XP rewarded.`);
    } else {
      addLog(`GAME OVER. Commander ${player.name} won.`);
    }
  };

  const resetGame = () => {
    setPlayers([]);
    setWinner(null);
    setDiceRoll(null);
    setGameState('idle');
    setInSetup(true);
  };

  // Helper cell-based query: gathers all tokens at specified row/col coordinates
  const getTokensAtCell = (row: number, col: number) => {
    const list: { pIdx: number; tIdx: number; color: 'red'|'green'|'yellow'|'blue'; isBot: boolean }[] = [];
    players.forEach((p, pIdx) => {
      p.tokens.forEach((step, tIdx) => {
        const coords = getTokenCoords(p.color, step, tIdx);
        if (coords && coords.row === row && coords.col === col) {
          list.push({ pIdx, tIdx, color: p.color, isBot: p.isBot });
        }
      });
    });
    return list;
  };

  // Handles clicking a grid square directly to move the active player's playable tokens
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'moving' || players[activePlayerIndex].isBot) return;

    const cellTokens = getTokensAtCell(row, col);
    const playableUserToken = cellTokens.find(
      t => t.pIdx === activePlayerIndex && userPlayableTokens.includes(t.tIdx)
    );

    if (playableUserToken) {
      animateTokenMove(activePlayerIndex, playableUserToken.tIdx, diceRoll!);
    }
  };

  if (inSetup) {
    if (activeTab === 'lobby') {
      return (
        <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] flex flex-col justify-between'}`}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
          
          <header className="relative z-10 max-w-2xl w-full mx-auto px-6 flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/library')}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer shadow-md"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div>
                <a className="block text-[8px] text-on-surface-variant/60 uppercase tracking-widest" href="#/library">&larr; Game World</a>
                <h1 className="font-headline-lg text-lg font-bold text-ludo-yellow tracking-wider">LUDO ROYAL</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#222a3d] px-3 py-1.5 rounded-full border border-white/10 cursor-pointer hover:border-primary/45 transition-all" onClick={() => setActiveTab('shop')}>
                <span className="material-symbols-outlined text-ludo-yellow text-[16px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                <span className="font-stat-value text-xs text-on-surface font-mono font-bold">{user?.coins || 1250}</span>
              </div>
            </div>
          </header>

          <main className="relative z-10 max-w-xl w-full mx-auto px-6 space-y-6 flex-grow">
            {/* Season Battle Pass Hero */}
            <section className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary-container to-surface-container-lowest border border-primary/20 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-ludo-blue/15 blur-2xl rounded-full translate-x-6 -translate-y-6" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-label-caps text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-widest font-bold">Season 4</span>
                  <h2 className="font-headline-md text-lg font-extrabold text-on-primary-container mt-1">CYBER ROYALE</h2>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold text-outline uppercase">Tier 42</p>
                  <p className="font-mono text-xs text-on-surface">XP 1250/3000</p>
                </div>
              </div>
              <div className="w-full h-2.5 bg-[#131b2e] rounded-full overflow-hidden relative mb-4">
                <div className="h-full bg-gradient-to-r from-ludo-blue to-primary animate-pulse" style={{ width: '42%' }} />
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-ludo-blue to-primary hover:scale-[1.02] active:scale-95 transition-all text-on-primary font-bold py-2.5 rounded-xl shadow-lg shadow-ludo-blue/20 text-xs cursor-pointer" onClick={() => navigate('/battlepass')}>
                  VIEW PASS
                </button>
              </div>
            </section>

            {/* Game Modes - Grid */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-white/10 border-b-4 border-ludo-blue active:scale-95 transition-all" onClick={() => setActiveTab('setup')}>
                <div className="w-12 h-12 flex items-center justify-center bg-ludo-blue/10 rounded-full animate-bounce">
                  <span className="material-symbols-outlined text-2xl text-ludo-blue" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
                </div>
                <h3 className="text-xs font-bold text-white">Quick Play</h3>
                <p className="text-[9px] text-on-surface-variant font-medium">2 Min Blitz vs Bots</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-white/10 border-b-4 border-ludo-green active:scale-95 transition-all" onClick={() => setActiveTab('setup')}>
                <div className="w-12 h-12 flex items-center justify-center bg-ludo-green/10 rounded-full">
                  <span className="material-symbols-outlined text-2xl text-ludo-green" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                </div>
                <h3 className="text-xs font-bold text-white">Play Online</h3>
                <p className="text-[9px] text-on-surface-variant font-medium">VS Global Users</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-white/10 border-b-4 border-ludo-yellow active:scale-95 transition-all" onClick={() => setActiveTab('leaderboards')}>
                <div className="w-12 h-12 flex items-center justify-center bg-ludo-yellow/10 rounded-full">
                  <span className="material-symbols-outlined text-2xl text-ludo-yellow" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                </div>
                <h3 className="text-xs font-bold text-white">Tournaments</h3>
                <p className="text-[9px] text-on-surface-variant font-medium">Win Big Rewards</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-white/10 border-b-4 border-ludo-red active:scale-95 transition-all" onClick={() => setActiveTab('shop')}>
                <div className="w-12 h-12 flex items-center justify-center bg-ludo-red/10 rounded-full">
                  <span className="material-symbols-outlined text-2xl text-ludo-red" style={{ fontVariationSettings: "'FILL' 1" }}>local_mall</span>
                </div>
                <h3 className="text-xs font-bold text-white">Shop & Skins</h3>
                <p className="text-[9px] text-on-surface-variant font-medium">Unlock Dice Skins</p>
              </div>
            </section>

            {/* Daily Missions */}
            <section className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white tracking-wide">DAILY PROTOCOL MISSIONS</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-black/25 px-3 py-2 rounded-xl text-[10px]">
                  <span>Play 3 blitz matches</span>
                  <span className="text-ludo-green font-bold font-mono">1/3</span>
                </div>
                <div className="flex justify-between items-center bg-black/25 px-3 py-2 rounded-xl text-[10px]">
                  <span>Roll double-six in board</span>
                  <span className="text-on-surface-variant font-mono">0/2</span>
                </div>
              </div>
            </section>
          </main>
        </div>
      );
    }

    if (activeTab === 'shop') {
      const skinsList = [
        { name: 'Fire Dice', price: 1200, rarity: 'RARE', color: 'ludo-red', desc: 'Molten lava core', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7nEEHeK52TiY-ghZ41W8wC3MfmdKGIsg4ZEZsXvxPI1ry5YY2jBpQ62LnbPeFKc9nU2TYr96RwuXuknctLtY7EQ3ka4bs_sfAonuwUtxGtIZs8KvFmc1S8AqcLGPEci_y-nTLNMcXGuqi21Jf_V813ejtvDadPuQvNRphUezchcswLk1EJIQ5NLLX7QTgzGt78-cKFxJWQEskWQeDf9CKsLMMeqoO3N4mya1WF19Q7uSsrkPS3FzE' },
        { name: 'Frostbite Dice', price: 1500, rarity: 'EPIC', color: 'ludo-blue', desc: 'Enchanted arctic ice', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtw6j7X0KUrZ3vL7aEL_5MyUUwjqd_lefdU5_pORNxF7gbZHn-6EWmC-RZ-MITk-lm0LHXrrFLc2ouJO-X_udz8W2MBOBYHEquKcaJGzLivJV6MQeBthY4DHfPWdWas0nR2--n8sW6hiMZ-XKgb9yvc0PL2QdaR6HYRurLf2gsowcW_9v55dZ8_1ykbeu_A68XwEOTq3o2mgYKrMKQqVF9f5_nQV4rwRQPlF-MuOMjjNu8mRV_9P6I' },
        { name: 'Nebula Dice', price: 5000, rarity: 'LEGENDARY', color: 'tertiary', desc: 'Miniature swirling galaxy core', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAInlTTr5HVguyOW4e5vhi6oRYtieFrYVVm7gqHTRfvV743TrXVaKk5yG-HZbNklvbWl_K_6UK5ZtnApNyJ7XWJdqfGSTlpiB9Z2DUjJ8Z7aP8vEZj5KMRDvsMDjgsxQ68HlilE7rl-_oX6n9Exu66AEyUChGd4gbG-ToHMi0Z5Ft8s9BcFKWi9oPY_OQR_EvJjvyNA-nkXNyN09xMoDftsC-3ZLVQX6hq8MKrpcuQe49drN5CsTvyc' },
      ];

      const buySkin = (skinName: string, price: number) => {
        if (purchasedSkins.includes(skinName)) {
          setEquippedSkin(skinName);
          return;
        }
        const success = spendCoins(price);
        if (success) {
          setPurchasedSkins([...purchasedSkins, skinName]);
          setEquippedSkin(skinName);
        } else {
          alert('Insufficient coins for purchase!');
        }
      };

      return (
        <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] flex flex-col justify-between'}`}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
          
          <header className="relative z-10 max-w-2xl w-full mx-auto px-6 flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('lobby')}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div>
                <a className="block text-[8px] text-on-surface-variant/60 uppercase tracking-widest" href="#/lobby" onClick={() => setActiveTab('lobby')}>&larr; Ludo Royal Home</a>
                <h1 className="font-headline-lg text-lg font-bold text-ludo-yellow tracking-wider">LUDO SHOP</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#222a3d] px-3 py-1.5 rounded-full border border-white/10 cursor-pointer">
              <span className="material-symbols-outlined text-ludo-yellow text-base mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="font-stat-value text-xs text-primary font-mono font-bold">{user?.coins || 1250}</span>
            </div>
          </header>

          <main className="relative z-10 max-w-xl w-full mx-auto px-6 space-y-6 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skinsList.map((s) => {
                const isOwned = purchasedSkins.includes(s.name);
                const isEquipped = equippedSkin === s.name;
                return (
                  <div key={s.name} className="bg-white/5 rounded-2xl p-4 flex flex-col items-center text-center border border-white/10">
                    <div className="w-full aspect-square relative mb-4 rounded-xl bg-[#222a3d] flex items-center justify-center overflow-hidden">
                      <img className="w-24 h-24 object-contain" src={s.img} alt={s.name} />
                    </div>
                    <span className="text-[8px] font-bold text-primary tracking-wider uppercase mb-1">{s.rarity}</span>
                    <h4 className="font-bold text-white text-xs mb-1">{s.name}</h4>
                    <p className="text-[10px] text-on-surface-variant mb-4">{s.desc}</p>
                    
                    <button
                      onClick={() => buySkin(s.name, s.price)}
                      className={`w-full py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all ${
                        isEquipped 
                          ? 'bg-ludo-green text-white shadow-md' 
                          : isOwned 
                          ? 'bg-white/10 hover:bg-white/20 border border-white/25 text-white' 
                          : 'bg-primary text-on-primary hover:scale-105 active:scale-95 font-bold'
                      }`}
                    >
                      {isEquipped ? 'EQUIPPED' : isOwned ? 'EQUIP' : `${s.price} COINS`}
                    </button>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      );
    }

    if (activeTab === 'leaderboards') {
      const leaderData = [
        { rank: '01', name: 'QueenGambit', xp: '4.2M XP', rate: '74% Win Rate', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk9hZFoPBql-6OBl8U5wQKLCipVjRYqeyQL6fGkrUsdx8tvR9EXqUtoTejp9acUQSR2aAyyYAY4KwYGNEpv9Ru0HNnLnoe_mfyn1KCOQOZXkscUAi8vOQhDyGyTOREptnhihle2vpCn9Ingk-8EexWVwsszS-4n-6ri-_4P9dr-eH4eztgodj0B_rSq4wrM-0L2OguhtQUJm05ACsO15O7kMq49Vf6_HggYxmfilSIf2oV8Gpk0qjs' },
        { rank: '02', name: 'CyberOdin', xp: '3.9M XP', rate: '71% Win Rate', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0Tz5xJqPofORy1gtrODTpwrt6Rb9DnBlbjvQqe8p3zLzkaN8QiE_K_uuR9KZkc0jd5jYZADf-07fgob18RL_hwDxTy4UPI9dzNjE6Q2hB_HgDkioGbECn-iSVrgZWkppBebdWxL64aeABkeosMOehpU29EYgnhEKR8804mk0Mb1x6gVTOnAnnTiOVh_liGiDRb8mdrYHSWLOl73rpJBtyMd0JIYWvf-uYfA03vZSpeUkbGoP5gXgt' },
        { rank: '03', name: 'DRAGON_99', xp: '3.1M XP', rate: '68% Win Rate', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEvPu4jmwWjvPQ2WkABflQxyhAJE8ERPEqo-kdg_lEighQsOnr7qST6Z9JJSPM_t1WnSMHCsItFPDaJ6rxUr3iMGiGxl14AONbQe2zXC70qDOO15rMmW0o00QrtVI23DBtoRUOkVBwZHfWEyuWsJTYfE-OTSLcpqtTrwcIwBRDf9jtZk_ijTHnJpqv-hdd1fS1arOlmrZDaPIW7U8zHL9VSma3E6wgKddy1ZAkPqiWixv8imqQO72g' }
      ];

      return (
        <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] flex flex-col justify-between'}`}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
          
          <header className="relative z-10 max-w-2xl w-full mx-auto px-6 flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('lobby')}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div>
                <a className="block text-[8px] text-on-surface-variant/60 uppercase tracking-widest" href="#/lobby" onClick={() => setActiveTab('lobby')}>&larr; Ludo Royal Home</a>
                <h1 className="font-headline-lg text-lg font-bold text-ludo-yellow tracking-wider">LUDO HALL OF FAME</h1>
              </div>
            </div>
          </header>

          <main className="relative z-10 max-w-xl w-full mx-auto px-6 space-y-6 flex-grow">
            <nav className="flex space-x-2 bg-[#131b2e]/50 p-1.5 rounded-xl border border-white/5">
              <button className="flex-1 py-2 text-xs font-bold text-primary bg-[#1e3a8a]/40 rounded-lg">GLOBAL</button>
              <button className="flex-1 py-2 text-xs font-bold text-on-surface-variant">FRIENDS</button>
              <button className="flex-1 py-2 text-xs font-bold text-on-surface-variant">CLANS</button>
            </nav>

            <div className="space-y-3">
              {leaderData.map((lb) => (
                <div key={lb.name} className="bg-white/5 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-ludo-yellow font-sans">
                  <div className="font-bold text-sm text-ludo-yellow w-6 text-center">{lb.rank}</div>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                    <img className="w-full h-full object-cover" src={lb.avatar} alt={lb.name} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-white text-xs">{lb.name}</h4>
                    <p className="text-[10px] text-on-surface-variant">{lb.xp} • {lb.rate}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      );
    }

    // Setup configuration screen tab = 'setup'
    return (
      <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] flex flex-col justify-between'}`}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
        
        <header className="relative z-10 max-w-2xl w-full mx-auto px-6 flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('lobby')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div>
              <a className="block text-[8px] text-on-surface-variant/60 uppercase tracking-widest" href="#/lobby" onClick={() => setActiveTab('lobby')}>&larr; Ludo Lobby</a>
              <h1 className="font-headline-lg text-lg font-bold text-ludo-yellow tracking-wider">LUDO CONFIG</h1>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-md w-full mx-auto px-6 flex-grow flex items-center justify-center">
          <Card level={2} className="w-full p-8 border border-white/10 bg-black/40 backdrop-blur-md">
            <div className="text-center mb-8">
              <h2 className="font-headline-lg text-2xl font-bold text-ludo-yellow uppercase tracking-widest">DEPLOYMENT SPEC</h2>
              <p className="text-xs text-on-surface-variant mt-2">Configure board parameters to begin deployment</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-white tracking-widest uppercase block mb-3">Player Color</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['red', 'green', 'yellow', 'blue'] as const).map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`py-3 rounded-xl border-2 capitalize font-bold transition-all text-xs cursor-pointer ${
                        selectedColor === col 
                          ? `bg-${col === 'blue' ? 'primary' : `ludo-${col}`}/20 border-${col === 'blue' ? 'primary' : `ludo-${col}`}` 
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white tracking-widest uppercase block mb-3">Opponent Count</label>
                <div className="grid grid-cols-3 gap-3">
                  {([2, 3, 4] as const).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setPlayerCount(cnt)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all text-xs cursor-pointer ${
                        playerCount === cnt 
                          ? 'bg-primary/20 border-primary' 
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      {cnt} Players
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="neon" onClick={startGame} className="w-full py-4 text-xs font-bold mt-4 flex justify-center items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> SECURE LINK & START
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const activePlayer = players[activePlayerIndex];
  const userPlayableTokens = !activePlayer?.isBot && diceRoll ? getPlayableTokens(activePlayer, diceRoll) : [];

  const getTokensAtHome = (color: 'red' | 'green' | 'yellow' | 'blue'): number => {
    const player = players.find(p => p.color === color);
    if (!player) return 0;
    return player.tokens.filter(t => t === 56).length;
  };

  const renderPlayerHUD = (color: 'red' | 'green' | 'yellow' | 'blue') => {
    const pIdx = players.findIndex(p => p.color === color);
    if (pIdx === -1) return null;
    const p = players[pIdx];
    const isActive = pIdx === activePlayerIndex;
    
    let cornerClass = "";
    if (color === 'red') cornerClass = "absolute top-24 left-6 z-20";
    else if (color === 'green') cornerClass = "absolute top-24 right-6 z-20";
    else if (color === 'yellow') cornerClass = "absolute bottom-28 left-6 z-20";
    else cornerClass = "absolute bottom-28 right-6 z-20 scale-110";

    const themeColorClass = `ludo-${color}`;

    return (
      <div className={cornerClass}>
        <div className={`relative p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border-2 flex flex-col items-center transition-all duration-300 ${
          isActive 
            ? `border-${themeColorClass} bg-${themeColorClass}/5 shadow-[0_0_15px_rgba(59,130,246,0.2)]` 
            : 'border-white/5 opacity-65'
        }`}>
          {isActive && (
            <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${themeColorClass} rounded-full border-2 border-black animate-pulse`} />
          )}
          <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 border-${themeColorClass} mb-2`}>
            <img src={p.avatar} className="w-full h-full object-cover" alt={p.name} />
          </div>
          <div className="text-center">
            <p className="font-label-caps text-[9px] text-white font-bold truncate max-w-[80px]">{p.name}</p>
            <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className={`h-full bg-${themeColorClass} ${isActive ? 'animate-pulse' : ''}`} style={{ width: isActive ? `${timerProgress}%` : '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen pt-20 pb-28 text-white bg-[#050505] overflow-x-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Top Header */}
      {!isStandalone && (
      <header className="relative z-10 max-w-7xl mx-auto px-margin-desktop flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={resetGame}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-ludo-yellow tracking-wider">LUDO ROYAL</h1>
            <p className="text-[10px] text-on-surface-variant">Lobby Room #0425 • Proper Grid Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-on-surface-variant" />}
          </button>
          
        </div>
      </header>


      )}      <style>{`
        .dice-roll-animation {
          animation: diceRotate 0.4s ease-in-out infinite;
        }
        @keyframes diceRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .token-glow-red { filter: drop-shadow(0 0 8px #EF4444); }
        .token-glow-green { filter: drop-shadow(0 0 8px #10B981); }
        .token-glow-yellow { filter: drop-shadow(0 0 8px #F59E0B); }
        .token-glow-blue { filter: drop-shadow(0 0 8px #3B82F6); }
      `}</style>

      {/* Main Game Interface */}
      <main className="relative z-10 w-full h-[calc(100vh-100px)] flex items-center justify-center pt-8 pb-12 px-4 overflow-hidden">
        
        {/* Absolute Corner HUD Cards */}
        {renderPlayerHUD('red')}
        {renderPlayerHUD('green')}
        {renderPlayerHUD('yellow')}
        {renderPlayerHUD('blue')}

        {/* Floating Chat / Log Panel on Left margin */}
        <div className="absolute left-6 top-[28%] bottom-[32%] w-60 z-20 flex flex-col gap-4">
          <Card level={3} className="p-4 flex flex-col h-full border border-white/5 bg-black/35 backdrop-blur-md">
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Vanguard Comms</span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 text-[9px] pr-1 scrollbar-thin">
              <div className="space-y-1.5 border-b border-white/5 pb-2 mb-2">
                {chats.map((c, idx) => (
                  <div key={idx}>
                    <span className={`font-bold mr-1 ${
                      c.sender === 'CYBER_JANE' ? 'text-ludo-green' : c.sender === 'GOLD_KING' ? 'text-ludo-yellow' : 'text-primary'
                    }`}>{c.sender}:</span>
                    <span className="text-on-surface-variant">{c.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="space-y-1 text-on-surface-variant/75 font-mono">
                {logs.map((l, idx) => (
                  <div key={idx} className="border-l border-primary/20 pl-1.5 py-0.5">
                    {l}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </Card>
        </div>

        {/* Floating Controls at bottom-left */}
        <div className="absolute bottom-10 left-36 z-30 flex items-center gap-3">
          <button 
            onClick={resetGame}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-lg group cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-primary group-hover:rotate-45 transition-transform" />
          </button>
        </div>

        {/* Floating Dice rolling deck next to bottom-right Blue player */}
        <div className="absolute bottom-10 right-36 z-30 flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5 shadow-xl">
          <button
            onClick={rollDice}
            disabled={activePlayer?.isBot || gameState !== 'idle'}
            className={`group relative w-14 h-14 bg-surface-container-high rounded-xl flex items-center justify-center border-2 border-ludo-blue transition-all overflow-hidden ${
              activePlayer?.isBot || gameState !== 'idle' 
                ? 'opacity-40 cursor-not-allowed' 
                : 'hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]'
            }`}
          >
            <div className={`relative z-10 transition-transform ${gameState === 'rolling' ? 'dice-roll-animation' : ''} w-10 h-10 flex items-center justify-center`}>
              {DICE_SKIN_IMAGES[equippedSkin] ? (
                <img src={DICE_SKIN_IMAGES[equippedSkin]} className="w-full h-full object-contain" alt={equippedSkin} />
              ) : (
                <span className="material-symbols-outlined text-3xl text-white font-bold">casino</span>
              )}
            </div>
          </button>

          <div className="text-left">
            <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-wider">DICE STATUS</p>
            {gameState === 'rolling' ? (
              <p className="text-[10px] text-primary animate-pulse">Rolling...</p>
            ) : diceRoll ? (
              <p className="text-[10px] text-ludo-yellow font-bold">
                Rolled <span className="text-white text-xs font-extrabold">{diceRoll}</span>!
              </p>
            ) : (
              <p className="text-[10px] text-on-surface-variant">Waiting</p>
            )}
          </div>
        </div>

        {/* Center Col: Board grid */}
        <div className="flex flex-col items-center justify-center relative w-full max-w-[480px]">
          {winner && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-white/10 shadow-2xl">
              <Trophy className="w-16 h-16 text-ludo-yellow mb-4 animate-bounce" />
              <h2 className="font-headline-lg text-2xl font-bold text-white mb-2 uppercase">Vortex Complete</h2>
              <p className="text-sm text-on-surface-variant max-w-sm mb-6">
                Commander <span className="text-primary font-bold">{winner.name}</span> has cleared the Ludo Matrix!
              </p>
              <button 
                onClick={resetGame}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> PLAY AGAIN
              </button>
            </div>
          )}

          {/* Ludo Board */}
          <div className="relative w-full aspect-square bg-[#0b1326] p-2 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-0.5 relative">
              
              {/* --- RED HOME (Top Left) --- */}
              <div className="col-span-6 row-span-6 bg-ludo-red/10 rounded-xl border border-ludo-red/20 p-4 grid grid-cols-2 gap-4 relative">
                <div className="absolute -top-1 -left-1 px-2 py-0.5 rounded-br-lg bg-ludo-red text-[8px] font-bold text-white uppercase tracking-wider">RED SECTOR</div>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const hasToken = getTokensAtCell(2 + Math.floor(idx/2), 2 + (idx%2)).length > 0;
                  const isUserActiveToken = activePlayerIndex === players.findIndex(p => p.color === 'red') && userPlayableTokens.includes(idx);
                  return (
                    <button
                      key={idx}
                      disabled={!isUserActiveToken || gameState !== 'moving'}
                      onClick={() => moveToken(activePlayerIndex, idx, diceRoll!)}
                      className={`bg-ludo-red/15 rounded-full border border-ludo-red/30 flex items-center justify-center aspect-square relative ${
                        isUserActiveToken ? 'ring-2 ring-white animate-bounce cursor-pointer' : ''
                      }`}
                    >
                      {hasToken && (
                        <span className="material-symbols-outlined text-ludo-red scale-[1.8] token-glow-red animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>token</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* --- TOP TRACK (Cols 6-8, Rows 0-5) --- */}
              <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 gap-0.5">
                {Array.from({ length: 18 }).map((_, i) => {
                  const r = Math.floor(i / 3);
                  const c = 6 + (i % 3);
                  
                  const isRedStar = r === 2 && c === 6;
                  const isGreenStar = r === 1 && c === 8;
                  const isPathRed = c === 7 && r > 0;
                  const isSafeCell = (r === 1 && c === 6) || (r === 2 && c === 6) || (r === 1 && c === 8);

                  const cellTokens = getTokensAtCell(r, c);

                  return (
                    <div 
                      key={i} 
                      className={`rounded-sm border border-white/5 flex items-center justify-center relative ${
                        isPathRed ? 'bg-ludo-red/30 border-ludo-red/40' : 
                        isSafeCell ? 'bg-[#0f1b35] border-white/10' : 'bg-black/20'
                      }`}
                    >
                      {isGreenStar && <span className="material-symbols-outlined text-ludo-green text-[10px] absolute" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                      {cellTokens.map((t, idx) => (
                        <span 
                          key={idx} 
                          className={`material-symbols-outlined text-base absolute ${
                            t.color === 'red' ? 'text-ludo-red token-glow-red' :
                            t.color === 'green' ? 'text-ludo-green token-glow-green' :
                            t.color === 'yellow' ? 'text-ludo-yellow token-glow-yellow' :
                            'text-ludo-blue token-glow-blue'
                          } animate-pulse`} 
                          style={{ 
                            fontVariationSettings: "'FILL' 1",
                            transform: `translate(${idx * 4}px, ${idx * 4}px)` 
                          }}
                        >
                          token
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* --- GREEN HOME (Top Right) --- */}
              <div className="col-span-6 row-span-6 bg-ludo-green/10 rounded-xl border border-ludo-green/20 p-4 grid grid-cols-2 gap-4 relative">
                <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-bl-lg bg-ludo-green text-[8px] font-bold text-white uppercase tracking-wider">GREEN SECTOR</div>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const hasToken = getTokensAtCell(2 + Math.floor(idx/2), 11 + (idx%2)).length > 0;
                  const isUserActiveToken = activePlayerIndex === players.findIndex(p => p.color === 'green') && userPlayableTokens.includes(idx);
                  return (
                    <button
                      key={idx}
                      disabled={!isUserActiveToken || gameState !== 'moving'}
                      onClick={() => moveToken(activePlayerIndex, idx, diceRoll!)}
                      className={`bg-ludo-green/15 rounded-full border border-ludo-green/30 flex items-center justify-center aspect-square relative ${
                        isUserActiveToken ? 'ring-2 ring-white animate-bounce cursor-pointer' : ''
                      }`}
                    >
                      {hasToken && (
                        <span className="material-symbols-outlined text-ludo-green scale-[1.8] token-glow-green animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>token</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* --- LEFT TRACK (Cols 0-5, Rows 6-8) --- */}
              <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 gap-0.5">
                {Array.from({ length: 18 }).map((_, i) => {
                  const r = 6 + Math.floor(i / 6);
                  const c = i % 6;

                  const isRedStar = r === 6 && c === 1;
                  const isYellowStar = r === 8 && c === 2;
                  const isPathYellow = r === 7 && c > 0;
                  const isSafeCell = (r === 6 && c === 1) || (r === 8 && c === 2) || (r === 6 && c === 2);

                  const cellTokens = getTokensAtCell(r, c);

                  return (
                    <div 
                      key={i} 
                      className={`rounded-sm border border-white/5 flex items-center justify-center relative ${
                        isPathYellow ? 'bg-ludo-yellow/30 border-ludo-yellow/40' : 
                        isSafeCell ? 'bg-[#0f1b35] border-white/10' : 'bg-black/20'
                      }`}
                    >
                      {isRedStar && <span className="material-symbols-outlined text-ludo-red text-[10px] absolute" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                      {cellTokens.map((t, idx) => (
                        <span 
                          key={idx} 
                          className={`material-symbols-outlined text-base absolute ${
                            t.color === 'red' ? 'text-ludo-red token-glow-red' :
                            t.color === 'green' ? 'text-ludo-green token-glow-green' :
                            t.color === 'yellow' ? 'text-ludo-yellow token-glow-yellow' :
                            'text-ludo-blue token-glow-blue'
                          } animate-pulse`} 
                          style={{ 
                            fontVariationSettings: "'FILL' 1",
                            transform: `translate(${idx * 4}px, ${idx * 4}px)` 
                          }}
                        >
                          token
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* --- CENTER AREA (Cols 6-8, Rows 6-8) --- */}
              <div className="col-span-3 row-span-3 bg-[#0d1629] border border-white/10 relative flex items-center justify-center rounded-lg shadow-inner overflow-hidden">
                <span className="material-symbols-outlined text-white/20 scale-[2.2] absolute pointer-events-none animate-spin" style={{ animationDuration: '24s', fontVariationSettings: "'FILL' 1" }}>
                  hourglass_empty
                </span>
                
                <div className="grid grid-cols-2 gap-1.5 z-10">
                  <div className="w-5 h-5 bg-ludo-red/25 border border-ludo-red/40 rounded flex items-center justify-center">
                    <span className="text-[8px] text-ludo-red font-bold">{getTokensAtHome('red')}</span>
                  </div>
                  <div className="w-5 h-5 bg-ludo-green/25 border border-ludo-green/40 rounded flex items-center justify-center">
                    <span className="text-[8px] text-ludo-green font-bold">{getTokensAtHome('green')}</span>
                  </div>
                  <div className="w-5 h-5 bg-ludo-yellow/25 border border-ludo-yellow/40 rounded flex items-center justify-center">
                    <span className="text-[8px] text-ludo-yellow font-bold">{getTokensAtHome('yellow')}</span>
                  </div>
                  <div className="w-5 h-5 bg-ludo-blue/25 border border-ludo-blue/40 rounded flex items-center justify-center">
                    <span className="text-[8px] text-ludo-blue font-bold">{getTokensAtHome('blue')}</span>
                  </div>
                </div>
              </div>

              {/* --- RIGHT TRACK (Cols 9-14, Rows 6-8) --- */}
              <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 gap-0.5">
                {Array.from({ length: 18 }).map((_, i) => {
                  const r = 6 + Math.floor(i / 6);
                  const c = 9 + (i % 6);

                  const isGreenStar = r === 6 && c === 12;
                  const isBlueStar = r === 8 && c === 13;
                  const isPathBlue = r === 7 && c < 14;
                  const isSafeCell = (r === 6 && c === 12) || (r === 8 && c === 13) || (r === 8 && c === 12);

                  const cellTokens = getTokensAtCell(r, c);

                  return (
                    <div 
                      key={i} 
                      className={`rounded-sm border border-white/5 flex items-center justify-center relative ${
                        isPathBlue ? 'bg-ludo-blue/30 border-ludo-blue/40' : 
                        isSafeCell ? 'bg-[#0f1b35] border-white/10' : 'bg-black/20'
                      }`}
                    >
                      {isBlueStar && <span className="material-symbols-outlined text-ludo-blue text-[10px] absolute" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                      {cellTokens.map((t, idx) => (
                        <span 
                          key={idx} 
                          className={`material-symbols-outlined text-base absolute ${
                            t.color === 'red' ? 'text-ludo-red token-glow-red' :
                            t.color === 'green' ? 'text-ludo-green token-glow-green' :
                            t.color === 'yellow' ? 'text-ludo-yellow token-glow-yellow' :
                            'text-ludo-blue token-glow-blue'
                          } animate-pulse`} 
                          style={{ 
                            fontVariationSettings: "'FILL' 1",
                            transform: `translate(${idx * 4}px, ${idx * 4}px)` 
                          }}
                        >
                          token
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* --- YELLOW HOME (Bottom Left) --- */}
              <div className="col-span-6 row-span-6 bg-ludo-yellow/10 rounded-xl border border-ludo-yellow/20 p-4 grid grid-cols-2 gap-4 relative">
                <div className="absolute -bottom-1 -left-1 px-2 py-0.5 rounded-tr-lg bg-ludo-yellow text-[8px] font-bold text-white uppercase tracking-wider">YELLOW SECTOR</div>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const hasToken = getTokensAtCell(11 + Math.floor(idx/2), 2 + (idx%2)).length > 0;
                  const isUserActiveToken = activePlayerIndex === players.findIndex(p => p.color === 'yellow') && userPlayableTokens.includes(idx);
                  return (
                    <button
                      key={idx}
                      disabled={!isUserActiveToken || gameState !== 'moving'}
                      onClick={() => moveToken(activePlayerIndex, idx, diceRoll!)}
                      className={`bg-ludo-yellow/15 rounded-full border border-ludo-yellow/30 flex items-center justify-center aspect-square relative ${
                        isUserActiveToken ? 'ring-2 ring-white animate-bounce cursor-pointer' : ''
                      }`}
                    >
                      {hasToken && (
                        <span className="material-symbols-outlined text-ludo-yellow scale-[1.8] token-glow-yellow animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>token</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* --- BOTTOM TRACK (Cols 6-8, Rows 9-14) --- */}
              <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 gap-0.5">
                {Array.from({ length: 18 }).map((_, i) => {
                  const r = 9 + Math.floor(i / 3);
                  const c = 6 + (i % 3);

                  const isYellowStar = r === 12 && c === 8;
                  const isBlueStar = r === 11 && c === 6;
                  const isPathBlue = c === 7 && r < 14;
                  const isSafeCell = (r === 12 && c === 8) || (r === 11 && c === 6) || (r === 12 && c === 6);

                  const cellTokens = getTokensAtCell(r, c);

                  return (
                    <div 
                      key={i} 
                      className={`rounded-sm border border-white/5 flex items-center justify-center relative ${
                        isPathBlue ? 'bg-ludo-blue/30 border-ludo-blue/40' : 
                        isSafeCell ? 'bg-[#0f1b35] border-white/10' : 'bg-black/20'
                      }`}
                    >
                      {isYellowStar && <span className="material-symbols-outlined text-ludo-yellow text-[10px] absolute" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                      {cellTokens.map((t, idx) => (
                        <span 
                          key={idx} 
                          className={`material-symbols-outlined text-base absolute ${
                            t.color === 'red' ? 'text-ludo-red token-glow-red' :
                            t.color === 'green' ? 'text-ludo-green token-glow-green' :
                            t.color === 'yellow' ? 'text-ludo-yellow token-glow-yellow' :
                            'text-ludo-blue token-glow-blue'
                          } animate-pulse`} 
                          style={{ 
                            fontVariationSettings: "'FILL' 1",
                            transform: `translate(${idx * 4}px, ${idx * 4}px)` 
                          }}
                        >
                          token
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* --- BLUE HOME (Bottom Right) --- */}
              <div className="col-span-6 row-span-6 bg-ludo-blue/10 rounded-xl border border-ludo-blue/20 p-4 grid grid-cols-2 gap-4 relative">
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-tl-lg bg-ludo-blue text-[8px] font-bold text-white uppercase tracking-wider">BLUE SECTOR</div>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const hasToken = getTokensAtCell(11 + Math.floor(idx/2), 11 + (idx%2)).length > 0;
                  const isUserActiveToken = activePlayerIndex === players.findIndex(p => p.color === 'blue') && userPlayableTokens.includes(idx);
                  return (
                    <button
                      key={idx}
                      disabled={!isUserActiveToken || gameState !== 'moving'}
                      onClick={() => moveToken(activePlayerIndex, idx, diceRoll!)}
                      className={`bg-ludo-blue/15 rounded-full border border-ludo-blue/30 flex items-center justify-center aspect-square relative ${
                        isUserActiveToken ? 'ring-2 ring-white animate-bounce cursor-pointer' : ''
                      }`}
                    >
                      {hasToken && (
                        <span className="material-symbols-outlined text-ludo-blue scale-[1.8] token-glow-blue animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>token</span>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
