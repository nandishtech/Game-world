import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useLocation } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { Card as TonalCard } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnoCard {
  id: string;
  color: 'red' | 'green' | 'yellow' | 'blue' | 'wild';
  value: string; // '0'-'9', 'skip', 'reverse', 'draw2', 'wild'
}

const getCardStyle = (color: string, playable?: boolean) => {
  const base = "w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-between p-2.5 transition-all shadow-lg ";
  let colStyle = "";
  if (color === 'red') {
    colStyle = "border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] bg-gradient-to-br from-red-950/40 via-[#050505] to-[#050505]";
  } else if (color === 'green') {
    colStyle = "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] bg-gradient-to-br from-emerald-950/40 via-[#050505] to-[#050505]";
  } else if (color === 'yellow') {
    colStyle = "border-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.4)] bg-gradient-to-br from-yellow-950/40 via-[#050505] to-[#050505]";
  } else if (color === 'blue') {
    colStyle = "border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)] bg-gradient-to-br from-blue-950/40 via-[#050505] to-[#050505]";
  } else {
    colStyle = "border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)] bg-gradient-to-br from-purple-950/40 via-[#050505] to-[#050505]";
  }
  
  if (playable) {
    return base + colStyle + " hover:-translate-y-4 hover:scale-105 cursor-pointer z-10 ring-1 ring-white/10";
  }
  return base + colStyle + " opacity-40 cursor-not-allowed";
};

const getCardSymbol = (value: string) => {
  if (value === 'skip') return '∅';
  if (value === 'reverse') return '⇄';
  if (value === 'draw2') return '+2';
  if (value === 'wild') return '★';
  if (value === 'wild4') return '+4';
  return value;
};

class UnoAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playDraw() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playPlay() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
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
      gain.gain.setValueAtTime(0.1, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.35);
    });
  }
}

const audio = new UnoAudio();

const CARD_COLORS = ['red', 'green', 'yellow', 'blue'] as const;
const CARD_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'] as const;

export const CyberUnoGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone/');
  const { user, addXP } = useAuthStore();

  const [deck, setDeck] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [hands, setHands] = useState<Record<string, UnoCard[]>>({
    user: [], bot1: [], bot2: [], bot3: []
  });
  const [turn, setTurn] = useState<'user' | 'bot1' | 'bot2' | 'bot3'>('user');
  const [activeColor, setActiveColor] = useState<'red' | 'green' | 'yellow' | 'blue'>('blue');
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = clockwise, -1 = counter
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'wild_choice' | 'finished'>('idle');
  const [statusText, setStatusText] = useState('Match initialized. Starting deal.');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  useEffect(() => {
    audio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Bot Auto Play handler
  useEffect(() => {
    if (gameState === 'playing' && turn !== 'user' && !winnerName) {
      const delay = setTimeout(() => {
        makeBotMove();
      }, 1500);
      return () => clearTimeout(delay);
    }
  }, [turn, gameState, winnerName]);

  const generateDeck = (): UnoCard[] => {
    const list: UnoCard[] = [];
    let idCounter = 0;

    CARD_COLORS.forEach((col) => {
      // Numbers
      CARD_VALUES.forEach((val) => {
        list.push({ id: `card_${idCounter++}`, color: col, value: val });
        // Duplicate cards (except 0)
        if (val !== '0') {
          list.push({ id: `card_${idCounter++}`, color: col, value: val });
        }
      });
    });

    // Add Wild Cards
    for (let i = 0; i < 8; i++) {
      list.push({ id: `card_${idCounter++}`, color: 'wild', value: 'wild' });
    }

    // Shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    return list;
  };

  const startNewGame = () => {
    const freshDeck = generateDeck();
    
    // Deal 7 cards to each player
    const userHand = freshDeck.splice(0, 7);
    const bot1Hand = freshDeck.splice(0, 7);
    const bot2Hand = freshDeck.splice(0, 7);
    const bot3Hand = freshDeck.splice(0, 7);

    // Initial discard
    let firstDiscard = freshDeck.shift()!;
    while (firstDiscard.color === 'wild') {
      freshDeck.push(firstDiscard);
      firstDiscard = freshDeck.shift()!;
    }

    setDeck(freshDeck);
    setDiscardPile([firstDiscard]);
    setActiveColor(firstDiscard.color as any);
    setHands({
      user: userHand, bot1: bot1Hand, bot2: bot2Hand, bot3: bot3Hand
    });
    setTurn('user');
    setDirection(1);
    setWinnerName(null);
    setGameState('playing');
    setStatusText("Your turn! Place matching card or draw.");
  };

  const isCardPlayable = (card: UnoCard) => {
    const top = discardPile[discardPile.length - 1];
    if (!top) return false;
    return (
      card.color === 'wild' ||
      card.color === activeColor ||
      card.value === top.value
    );
  };

  const handlePlayCard = (player: string, card: UnoCard) => {
    if (gameState !== 'playing' || turn !== player) return;
    if (!isCardPlayable(card)) {
      if (player === 'user') setStatusText('Card does not match grid signature.');
      return;
    }

    audio.playPlay();

    // Play card
    const updatedHand = hands[player].filter(c => c.id !== card.id);
    const nextHands = { ...hands, [player]: updatedHand };
    const nextDiscard = [...discardPile, card];

    setHands(nextHands);
    setDiscardPile(nextDiscard);

    // Check Win
    if (updatedHand.length === 0) {
      handleGameEnd(player);
      return;
    }

    // Process Actions
    if (card.color === 'wild') {
      if (player === 'user') {
        setGameState('wild_choice');
        setStatusText('Select Wild vector color:');
      } else {
        // AI chooses random color
        const randomColor = CARD_COLORS[Math.floor(Math.random() * 4)];
        setActiveColor(randomColor);
        advanceTurn(card, nextHands);
      }
    } else {
      setActiveColor(card.color as any);
      advanceTurn(card, nextHands);
    }
  };

  const selectWildColor = (col: 'red' | 'green' | 'yellow' | 'blue') => {
    setActiveColor(col);
    setGameState('playing');
    advanceTurn(discardPile[discardPile.length - 1], hands);
  };

  const advanceTurn = (card: UnoCard, currentHands: Record<string, UnoCard[]>) => {
    let nextPlayer = getNextPlayer(turn);

    if (card.value === 'skip') {
      setStatusText(`${nextPlayer.toUpperCase()} was skipped!`);
      nextPlayer = getNextPlayer(nextPlayer);
    } else if (card.value === 'reverse') {
      const nextDir = direction === 1 ? -1 : 1;
      setDirection(nextDir as any);
      setStatusText(`Rotation reversed!`);
      // Recalculate next based on new direction
      nextPlayer = getNextPlayerTurn(turn, nextDir);
    } else if (card.value === 'draw2') {
      setStatusText(`${nextPlayer.toUpperCase()} draws 2 cards!`);
      drawPenalty(nextPlayer, 2, currentHands);
      nextPlayer = getNextPlayer(nextPlayer);
    } else {
      setStatusText(`${nextPlayer.toUpperCase()}'s turn.`);
    }

    setTurn(nextPlayer as any);
  };

  const getNextPlayer = (curr: string) => {
    return getNextPlayerTurn(curr, direction);
  };

  const getNextPlayerTurn = (curr: string, dir: number) => {
    const list = ['user', 'bot1', 'bot2', 'bot3'];
    const idx = list.indexOf(curr);
    let nextIdx = (idx + dir) % 4;
    if (nextIdx < 0) nextIdx = 3;
    return list[nextIdx];
  };

  const drawPenalty = (player: string, count: number, currentHands: Record<string, UnoCard[]>) => {
    const freshDeck = [...deck];
    const drawn: UnoCard[] = [];
    for (let i = 0; i < count; i++) {
      if (freshDeck.length > 0) drawn.push(freshDeck.shift()!);
    }
    setDeck(freshDeck);
    setHands({
      ...currentHands,
      [player]: [...currentHands[player], ...drawn]
    });
  };

  const handleDrawCard = (player: string) => {
    if (gameState !== 'playing' || turn !== player) return;

    audio.playDraw();
    const freshDeck = [...deck];
    if (freshDeck.length === 0) {
      setStatusText('Draw deck empty. Grid exhausted.');
      return;
    }

    const drawnCard = freshDeck.shift()!;
    const nextHands = { ...hands, [player]: [...hands[player], drawnCard] };
    
    setDeck(freshDeck);
    setHands(nextHands);

    // If playable, play automatically for AI, or let user play it
    if (isCardPlayable(drawnCard)) {
      if (player === 'user') {
        setStatusText('Play drawn card or pass.');
      } else {
        setTimeout(() => handlePlayCard(player, drawnCard), 800);
      }
    } else {
      setStatusText(`${player.toUpperCase()} drew and passed.`);
      const nextPlayer = getNextPlayer(turn);
      setTurn(nextPlayer as any);
    }
  };

  const makeBotMove = () => {
    const botHand = hands[turn];
    const playable = botHand.filter(card => isCardPlayable(card));

    if (playable.length > 0) {
      // Bot picks first playable card
      const chosen = playable[0];
      handlePlayCard(turn, chosen);
    } else {
      // Bot draws
      handleDrawCard(turn);
    }
  };

  const handleGameEnd = (player: string) => {
    setGameState('finished');
    if (player === 'user') {
      audio.playWin();
      setWinnerName(user?.username || 'VORTEX');
      addXP(300); // 300 XP awarded for UNO win
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setWinnerName(getBotName(player));
    }
  };

  const getBotName = (id: string) => {
    if (id === 'bot1') return 'DRAGON_99';
    if (id === 'bot2') return 'CYBER_JANE';
    return 'GOLD_KING';
  };

  return (
    <div className={`relative ${isStandalone ? 'w-full h-full p-2 flex flex-col items-center justify-center text-white overflow-hidden' : 'min-h-screen pt-20 pb-28 text-white bg-[#050505] overflow-x-hidden flex flex-col justify-between'}`}>
      {/* Top Header */}
      {!isStandalone && (
      <header className="relative z-10 max-w-4xl w-full mx-auto px-margin-mobile flex justify-between items-center py-4 border-b border-white/5 bg-black/45 backdrop-blur-md rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/library')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-pink-500 tracking-wider">CYBER UNO</h1>
            <p className="text-[10px] text-on-surface-variant">Tabletop Card Matrix • Neon Mode</p>
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
      <main className="relative z-10 max-w-5xl w-full mx-auto px-margin-mobile flex flex-col items-center gap-8 justify-center flex-grow">
        
        {gameState === 'idle' ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-bounce" />
            <h2 className="font-headline-lg text-2xl font-bold uppercase tracking-widest mb-4">Cyber Uno</h2>
            <Button variant="neon" onClick={startNewGame} className="px-8 py-3.5 text-xs font-bold">
              INITIALIZE DEAL
            </Button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6 relative">
            
            {/* Bots Hand Summary HUD */}
            <div className="flex justify-between w-full max-w-md gap-4 text-center">
              {['bot1', 'bot2', 'bot3'].map((bot) => (
                <div key={bot} className={`flex-1 p-2 bg-black/40 border rounded-xl ${
                  turn === bot ? 'border-pink-500 bg-pink-500/10' : 'border-white/5 opacity-70'
                }`}>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase">{getBotName(bot)}</p>
                  <p className="font-headline-sm text-sm text-primary mt-1">{hands[bot]?.length || 0} Cards</p>
                </div>
              ))}
            </div>

            {/* Play Status */}
            <p className="text-xs font-semibold text-primary animate-pulse">{statusText}</p>

            {/* Discard Pile (Center Area) */}
            <div className="flex items-center gap-8 bg-black/45 p-6 rounded-3xl border border-white/5 shadow-2xl relative">
              {/* Draw Pile */}
              <button 
                disabled={turn !== 'user' || gameState !== 'playing'}
                onClick={() => handleDrawCard('user')}
                className={`w-20 h-28 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  turn === 'user' && gameState === 'playing'
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(77,142,255,0.2)] hover:scale-105 active:scale-95 cursor-pointer'
                    : 'border-white/5 bg-black/40 cursor-not-allowed opacity-40'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-primary border border-white/10">
                  DRAW
                </div>
              </button>

              {/* Discard Top Card */}
              {discardPile.length > 0 && (
                <div className={getCardStyle(activeColor, true).replace('w-16 h-24', 'w-20 h-28').replace('hover:-translate-y-4 hover:scale-105', '')}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{activeColor}</span>
                  <h3 className="font-headline-lg text-3xl font-extrabold text-white">
                    {getCardSymbol(discardPile[discardPile.length - 1].value)}
                  </h3>
                  <span className="text-[8px] opacity-40">PILE</span>
                </div>
              )}
            </div>

            {/* Wild Color Selection Overlay */}
            {gameState === 'wild_choice' && (
              <div className="flex gap-3 justify-center">
                {CARD_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => selectWildColor(col)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer border ${
                      col === 'red' ? 'bg-ludo-red text-white border-ludo-red shadow-[0_0_10px_rgba(239,68,68,0.4)]' :
                      col === 'green' ? 'bg-ludo-green text-white border-ludo-green shadow-[0_0_10px_rgba(16,185,129,0.4)]' :
                      col === 'yellow' ? 'bg-ludo-yellow text-white border-ludo-yellow shadow-[0_0_10px_rgba(234,179,8,0.4)]' :
                      'bg-ludo-blue text-white border-ludo-blue shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            )}

            {/* User Hand Deck */}
            <div className="w-full mt-8 border-t border-white/5 pt-6 flex flex-col items-center">
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mb-4">Your Hand</p>
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                {hands.user.map((card) => {
                  const playable = isCardPlayable(card) && turn === 'user' && gameState === 'playing';
                  return (
                    <button
                      key={card.id}
                      disabled={!playable}
                      onClick={() => handlePlayCard('user', card)}
                      className={getCardStyle(card.color, playable)}
                    >
                      <span className={`text-[8px] font-bold uppercase ${
                        card.color === 'red' ? 'text-red-400' :
                        card.color === 'green' ? 'text-emerald-400' :
                        card.color === 'yellow' ? 'text-yellow-400' :
                        card.color === 'blue' ? 'text-blue-400' :
                        'text-purple-400'
                      }`}>{card.color}</span>
                      <h4 className="font-headline-lg text-2xl font-bold text-white">{getCardSymbol(card.value)}</h4>
                      <span className="text-[6px] opacity-40">CARD</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Over modal overlay */}
            {gameState === 'finished' && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-45 flex flex-col items-center justify-center p-8 text-center rounded-3xl">
                <Trophy className="w-16 h-16 text-pink-500 mb-4 animate-pulse" />
                <h2 className="font-headline-lg text-2xl font-bold uppercase mb-2">Vortex Complete</h2>
                <p className="text-sm text-on-surface-variant max-w-sm mb-6">
                  Player <span className="text-primary font-bold">{winnerName}</span> won the Cyber Uno Match!
                  {winnerName === user?.username && <span className="block mt-1 text-emerald-400 font-normal">+300 XP rewarded!</span>}
                </p>
                <Button variant="neon" onClick={startNewGame} className="px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> REDEPLOY DECK
                </Button>
              </div>
            )}

          </div>
        )}

      </main>
      
      <div />
    </div>
  );
};
