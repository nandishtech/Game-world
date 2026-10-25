import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommanderDeckStore } from '../../store/useCommanderDeckStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../Button';
import { 
  Gamepad2, 
  X, 
  Sparkles, 
  Trophy, 
  Users, 
  Store, 
  Cloud, 
  Radio, 
  User, 
  LogOut, 
  Play, 
  Flame, 
  Coins, 
  ShieldCheck, 
  ChevronRight, 
  Zap, 
  Activity,
  Layers,
  Compass,
  Cpu
} from 'lucide-react';
import { GAMES_CATALOG } from '../../data/gamesRegistry';

// Featured fast launcher titles
const QUICK_GAMES = [
  { id: 'subway_surfers', name: 'Subway Surfers', genre: 'Arcade', icon: '🛹', color: 'from-amber-500/20 to-orange-700/20' },
  { id: 'temple_run', name: 'Temple Run 2', genre: 'Runner', icon: '🗿', color: 'from-yellow-500/20 to-amber-700/20' },
  { id: 'vectaria', name: 'Vectaria.io', genre: 'Voxel 3D', icon: '⛏️', color: 'from-emerald-500/20 to-teal-700/20' },
  { id: 'classic_2048', name: 'Classic 2048', genre: 'Puzzle', icon: '🔢', color: 'from-amber-500/20 to-amber-700/20' },
  { id: 'void_snake', name: 'Void Snake', genre: 'Arcade', icon: '🐍', color: 'from-emerald-500/20 to-emerald-700/20' },
  { id: 'chess_masters', name: 'Chess Masters', genre: 'Strategy', icon: '♟️', color: 'from-cyan-500/20 to-blue-700/20' },
];

export const CommanderDeck: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, isCombining, closeDeck } = useCommanderDeckStore();
  const { user, logout } = useAuthStore();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isOpen || isCombining)) {
        closeDeck();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCombining, closeDeck]);

  const handleLaunchGame = (gameId: string) => {
    closeDeck();
    navigate(`/play/embed/${gameId}`);
  };

  const handleQuickRandomPlay = () => {
    closeDeck();
    const randomIndex = Math.floor(Math.random() * GAMES_CATALOG.length);
    const randomGame = GAMES_CATALOG[randomIndex];
    if (randomGame) {
      navigate(`/play/embed/${randomGame.id}`);
    } else {
      navigate('/library');
    }
  };

  const handleNavigate = (path: string) => {
    closeDeck();
    navigate(path);
  };

  return (
    <>
      {/* =========================================================================
          STAGE 1: THE COMBINING ANIMATION OVERLAY (0ms to ~500ms)
          "the game controles and games are combaning and then in a 5th sec the side manu shows"
      ========================================================================= */}
      <AnimatePresence>
        {isCombining && (
          <motion.div
            key="combining-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl pointer-events-auto overflow-hidden"
          >
            {/* Cyber Grid Lines Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,120,246,0.25)_0%,transparent_70%)] animate-pulse" />
            
            {/* Assembly Convergence Zone */}
            <div className="relative w-full max-w-4xl h-96 flex items-center justify-center">
              
              {/* LEFT SIDE: GAME CONTROLS INCOMING (Flying inward to center) */}
              <motion.div
                initial={{ x: -450, opacity: 0, scale: 0.6, rotate: -25 }}
                animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute flex flex-col items-center gap-3"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 border-cyan-400 p-4 shadow-[0_0_40px_rgba(34,211,238,0.7)] flex flex-col items-center justify-center text-cyan-300">
                  <Gamepad2 className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.5]" />
                  <span className="text-[9px] font-black tracking-widest uppercase mt-1">CONTROLS</span>
                </div>
              </motion.div>

              {/* RIGHT SIDE: GAMES INCOMING (Flying inward to center) */}
              <motion.div
                initial={{ x: 450, opacity: 0, scale: 0.6, rotate: 25 }}
                animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute flex flex-col items-center gap-3"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-purple-500/30 to-indigo-600/30 border-2 border-purple-400 p-4 shadow-[0_0_40px_rgba(168,85,247,0.7)] flex flex-col items-center justify-center text-purple-300">
                  <Layers className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.5]" />
                  <span className="text-[9px] font-black tracking-widest uppercase mt-1">GAMES</span>
                </div>
              </motion.div>

              {/* CENTER FUSION CORE: Energy Burst & Shockwave Rings */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1.8], opacity: [0, 1, 0.8] }}
                transition={{ duration: 0.48, delay: 0.15 }}
                className="w-40 h-40 rounded-full border-4 border-cyan-400 shadow-[0_0_60px_rgba(52,120,246,0.9)] flex items-center justify-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 animate-spin blur-md opacity-80" />
              </motion.div>

              {/* Status HUD readout */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute bottom-6 text-center space-y-1.5"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-black text-cyan-300 uppercase tracking-widest shadow-lg">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  COMBINING GAME CONTROLS & UNIVERSE MATRIX...
                </div>
                <p className="text-[11px] text-white/70 font-semibold tracking-wider">
                  INITIALIZING COMMANDER DECK (0.5s)
                </p>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          STAGE 2: THE COMMANDER DECK SIDE MENU (Reveals smoothly from left)
      ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              key="deck-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeDeck}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Slide-out Deck Drawer */}
            <motion.aside
              key="deck-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-full sm:w-[420px] md:w-[460px] bg-[#070b14]/95 backdrop-blur-2xl border-r border-cyan-500/20 shadow-[0_0_50px_rgba(0,180,255,0.25)] flex flex-col text-white overflow-hidden"
            >
              
              {/* Header: Title + Cyber Status + Close Button */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                    <Gamepad2 className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black tracking-wider text-white uppercase">COMMANDER DECK</h2>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                      Station Control Active
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeDeck}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
                  title="Close Deck (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Command Center Deck Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                
                {/* 1. Commander Identity Card */}
                {user ? (
                  <div 
                    onClick={() => handleNavigate('/profile')}
                    className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-black/40 to-black/60 border border-primary/30 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all group"
                  >
                    <div className="relative w-14 h-14 rounded-xl border-2 border-primary overflow-hidden flex-shrink-0 bg-black">
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 bg-primary text-black text-[8px] font-black px-1 rounded-tl">
                        L{user.level}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {user.displayName || user.username}
                        </h3>
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                          Verified
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mt-1">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Flame className="w-3 h-3" /> {user.stats.rank} ELO
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-yellow-400 font-bold">
                          <Coins className="w-3 h-3" /> {user.coins}
                        </span>
                      </div>

                      {/* XP Progress Bar */}
                      <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.max(0, user.xp % 100))}%` }}
                        />
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Guest Commander</h4>
                      <p className="text-[10px] text-white/60">Sign in to save matches and climb ranks.</p>
                    </div>
                    <Button variant="neon" onClick={() => handleNavigate('/auth')} className="text-xs py-2 px-4 font-bold">
                      SIGN IN
                    </Button>
                  </div>
                )}

                {/* 2. Instant Action: Quick Launch Any Game */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-white/60 px-1">
                    <span>Tactical Launch</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Instant
                    </span>
                  </div>

                  <button
                    onClick={handleQuickRandomPlay}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    QUICK PLAY RANDOM TITLE
                  </button>
                </div>

                {/* 3. Fast Launcher: 6 Top Titles */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-white/60 px-1">
                    <span>Quick Game Grid</span>
                    <button 
                      onClick={() => handleNavigate('/library')}
                      className="text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      All {GAMES_CATALOG.length} Games →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_GAMES.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleLaunchGame(game.id)}
                        className={`p-3 rounded-xl bg-gradient-to-br ${game.color} border border-white/10 hover:border-cyan-400/50 flex items-center gap-2.5 transition-all text-left group cursor-pointer hover:scale-[1.02]`}
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{game.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {game.name}
                          </h4>
                          <span className="text-[9px] text-white/50 uppercase font-semibold">
                            {game.genre}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Deck Stations & Operations */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-white/60 px-1">
                    Commander Modules
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => handleNavigate('/library')}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Gamepad2 className="w-4 h-4 text-cyan-400" />
                        <span>Game Universe Library</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                        67 Games
                      </span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/tournaments')}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Tournaments & Brackets</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Active
                      </span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/friends')}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Squad & Friends Hub</span>
                      </div>
                      <span className="text-[9px] text-white/40">Comrades</span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/marketplace')}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Store className="w-4 h-4 text-purple-400" />
                        <span>Cosmetics Shop</span>
                      </div>
                      <span className="text-[9px] text-white/40">Skins & SFX</span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/cloud')}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Cloud className="w-4 h-4 text-blue-400" />
                        <span>Cloud Play Engine</span>
                      </div>
                      <span className="text-[9px] text-white/40">Zero Install</span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/live')}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Radio className="w-4 h-4 text-rose-400" />
                        <span>Esports Live Broadcast</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                        Live
                      </span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/profile')}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-yellow-400" />
                        <span>Profile & CallSign</span>
                      </div>
                      <span className="text-[9px] text-white/40">Customize</span>
                    </button>
                  </div>
                </div>

                {/* 5. System Diagnostics & Telemetry */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-[10px]">
                  <div className="flex justify-between items-center text-white/60 font-bold uppercase tracking-wider">
                    <span>Node Telemetry</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Global Nexus
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-bold">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-white/40 block text-[8px] uppercase">Ping</span>
                      <span className="text-emerald-400 text-xs">12 ms</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-white/40 block text-[8px] uppercase">Catalog</span>
                      <span className="text-cyan-300 text-xs">{GAMES_CATALOG.length} Titles</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-white/40 block text-[8px] uppercase">Status</span>
                      <span className="text-primary text-xs">100% Up</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Quick Bar */}
              <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleNavigate('/library')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-primary" /> Browse Catalog
                </button>

                {user && (
                  <button
                    onClick={() => {
                      logout();
                      closeDeck();
                      navigate('/auth');
                    }}
                    className="p-2.5 rounded-xl bg-error/10 hover:bg-error/20 border border-error/20 text-error transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
