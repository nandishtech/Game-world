import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ExternalLink, 
  MessageSquare, 
  ShieldAlert, 
  Trophy, 
  Download, 
  Monitor, 
  CheckCircle2,
  Sparkles,
  Tv,
  LayoutGrid,
  Plus,
  Minus
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { useAuthStore } from '../store/useAuthStore';
import { getGameById, GameItem } from '../data/gamesRegistry';
import { antiCheatEngine } from '../services/antiCheatService';

// Function to compute optimal height based on game geometry
const getRecommendedHeight = (gameId: string, genre: string): number => {
  // Vertical/square oriented titles that need substantial height to prevent cutting off
  const tallGames = [
    'classic_2048', 
    'hextris', 
    'pacman', 
    'javascript_tetris', 
    'react_tetris', 
    'blockrain', 
    'clumsy_bird', 
    'floppybird', 
    'react_wordle', 
    'connect_4', 
    'gomoku', 
    'othello', 
    'checkers', 
    'neon_ludo', 
    'hyper_ttt', 
    'adarkroom'
  ];
  if (tallGames.includes(gameId)) {
    return 760; // 760px fits 2048 and arcade grids completely
  }

  // Large desktop/web apps that benefit from deep canvases
  const expansiveGames = [
    'freeciv_web', 
    'lichess', 
    'pokemon_showdown', 
    'browserquest', 
    'openfront_io', 
    'dungeon_crawl', 
    'monkeytype',
    'chess_masters'
  ];
  if (expansiveGames.includes(gameId)) {
    return 780;
  }

  // Racers & horizontal platformers
  return 660;
};

export const EmbedGame: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const secureClaimReward = useAuthStore((state) => state.secureClaimReward);
  const sessionStartTime = useRef<number>(Date.now());
  const [validationBadge, setValidationBadge] = useState<string | null>(null);

  const game: GameItem | undefined = getGameById(gameId || '');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Dynamic flexible iframe height state
  const [iframeHeight, setIframeHeight] = useState<number>(() => {
    return getRecommendedHeight(gameId || '', game?.genre || '');
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update recommended height if game route changes
  useEffect(() => {
    if (gameId && game) {
      setIframeHeight(getRecommendedHeight(gameId, game.genre));
    }
  }, [gameId, game]);

  // Keyboard shortcut listener for Fullscreen toggle (Escape exits fullscreen mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (!game) {
    return (
      <div className="relative min-h-screen pt-24 pb-12 bg-background flex flex-col items-center justify-center text-white">
        <ShaderBackground type="core" />
        <Card level={2} className="p-8 text-center max-w-sm space-y-4">
          <ShieldAlert className="w-12 h-12 text-pink-500 mx-auto" />
          <h2 className="text-xl font-bold uppercase tracking-wider">Title Registry Error</h2>
          <p className="text-xs text-on-surface-variant">The requested title is not registered in our Game World platform nodes.</p>
          <Button variant="neon" onClick={() => navigate('/library')}>BACK TO LIBRARY</Button>
        </Card>
      </div>
    );
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleToggleTheater = () => {
    setIsTheaterMode(!isTheaterMode);
  };

  const handleAdjustHeight = (delta: number) => {
    setIframeHeight((prev) => Math.min(Math.max(prev + delta, 480), 1080));
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    if (game.url) {
      window.open(game.url, '_blank', 'noopener,noreferrer');
    } else if (game.downloadUrl) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // If this is a Desktop Game, render the dedicated Desktop Download View
  if (game.type === 'desktop') {
    return (
      <div className="relative min-h-screen pt-20 pb-12 text-white bg-background overflow-x-hidden flex flex-col justify-between">
        <ShaderBackground type="core" />

        {/* Header Deck */}
        <header className="relative z-10 max-w-7xl w-full mx-auto px-margin-desktop flex justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/library')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  Desktop Game
                </span>
                <h1 className="font-headline-lg text-lg font-bold text-ludo-yellow tracking-wider">{game.name.toUpperCase()}</h1>
              </div>
              <p className="text-[10px] text-on-surface-variant">Official Open-Source Desktop Release Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {game.github && (
              <a
                href={game.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>Source</span>
              </a>
            )}
            {game.downloadUrl && (
              <a
                href={game.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-primary text-black flex items-center gap-1.5 text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Get Release</span>
              </a>
            )}
          </div>
        </header>

        {/* Desktop Presentation Arena */}
        <main className="relative z-10 max-w-7xl w-full mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
          {/* Left: Banner & Download Action */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="relative w-full aspect-video rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-black">
              <img src={game.banner} alt={game.name} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="flex flex-wrap gap-2 mb-3">
                  {game.platforms?.map((p) => (
                    <span key={p} className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wider text-white border border-white/15">
                      {p}
                    </span>
                  ))}
                  {game.size && (
                    <span className="px-2.5 py-1 bg-primary/20 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wider text-primary border border-primary/30">
                      Approx {game.size}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2">{game.name}</h2>
                <p className="text-xs text-white/80 max-w-2xl leading-relaxed">{game.desc}</p>
              </div>
            </div>

            {/* Download CTA Card */}
            <Card level={2} className="p-6 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-black/60 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Direct Open-Source Download</h4>
                </div>
                <p className="text-xs text-on-surface-variant">Host as standalone executable. Enjoy 100% offline gameplay, multiplayer servers, and full modding support.</p>
              </div>
              <div className="flex items-center gap-3">
                {game.officialUrl && (
                  <a
                    href={game.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Official Website
                  </a>
                )}
                {game.downloadUrl && (
                  <a
                    href={game.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    <Download className="w-4 h-4" /> Download Latest Release
                  </a>
                )}
              </div>
            </Card>

            {/* System Specs */}
            {game.specs && (
              <Card level={3} className="p-5 border border-white/5 bg-black/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">System Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-bold">OS</span>
                    <span className="text-white text-xs mt-1 block">{game.specs.os}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-bold">CPU</span>
                    <span className="text-white text-xs mt-1 block">{game.specs.cpu}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Memory</span>
                    <span className="text-white text-xs mt-1 block">{game.specs.ram}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-bold">GPU</span>
                    <span className="text-white text-xs mt-1 block">{game.specs.gpu}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Features & Repository Card */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Card level={3} className="p-5 border border-white/5 bg-black/30 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="font-label-caps text-[9px] text-primary bg-primary/10 px-2.5 py-1 rounded uppercase tracking-widest font-bold">
                  {game.genre}
                </span>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-xs text-ludo-yellow">
                  <span>★</span>
                  <span className="font-bold">{game.rating}</span>
                </div>
              </div>

              {game.features && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Key Highlights</h4>
                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {game.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {game.notes && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <span className="font-bold block mb-0.5">Note:</span>
                  {game.notes}
                </div>
              )}

              {game.github && (
                <div className="pt-2">
                  <a
                    href={game.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" /> View GitHub Repository
                  </a>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // ==================== BROWSER GAME (IFRAME EMBED) ====================
  return (
    <div className="relative min-h-screen pt-20 pb-12 text-white bg-background overflow-x-hidden flex flex-col justify-between">
      {/* Dynamic Background Shader */}
      <ShaderBackground type="core" />

      {/* Fullscreen Overlay Mode */}
      {isFullscreen && (
        <div className="fixed inset-0 w-screen h-screen z-50 bg-black flex flex-col">
          {/* Floating Exit Fullscreen Bar */}
          <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl">
            <button
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-primary transition-colors cursor-pointer"
            >
              <Minimize className="w-4 h-4 text-primary" /> EXIT FULLSCREEN (ESC)
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={handleReload}
              className="text-xs text-white/70 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Reload Frame"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleOpenExternal}
              className="text-xs text-white/70 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Open in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <iframe
            key={`fs-${iframeKey}`}
            ref={iframeRef}
            src={game.url}
            className="w-full h-full border-0 bg-black"
            allow="autoplay; gamepad; fullscreen; focus-without-user-activation"
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
            title={game.name}
          />
        </div>
      )}

      {/* Header Deck */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-margin-desktop flex flex-wrap justify-between items-center py-4 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/library')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 cursor-pointer shadow-md"
            title="Back to Game Library"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest bg-primary/20 text-primary border border-primary/30 uppercase">
                {game.genre}
              </span>
              <h1 className="font-headline-lg text-lg font-bold text-ludo-yellow tracking-wider">{game.name.toUpperCase()}</h1>
            </div>
            <p className="text-[10px] text-on-surface-variant">Live Responsive Iframe Player • Size: {iframeHeight}px</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Height Adjuster Pills */}
          <div className="hidden sm:flex items-center gap-1 bg-black/50 border border-white/10 px-2 py-1 rounded-xl">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider mr-1">Height</span>
            <button
              onClick={() => setIframeHeight(580)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${iframeHeight === 580 ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}
              title="Compact 580px"
            >
              580
            </button>
            <button
              onClick={() => setIframeHeight(680)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${iframeHeight === 680 ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}
              title="Balanced 680px"
            >
              680
            </button>
            <button
              onClick={() => setIframeHeight(760)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${iframeHeight === 760 ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}
              title="Tall / Optimal 760px (Perfect for 2048 & Arcade)"
            >
              760
            </button>
            <button
              onClick={() => setIframeHeight(860)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${iframeHeight === 860 ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}
              title="Expanded 860px"
            >
              860
            </button>
            
            <div className="flex items-center gap-0.5 border-l border-white/10 pl-1 ml-1">
              <button
                onClick={() => handleAdjustHeight(-40)}
                className="w-5 h-5 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Decrease Height (-40px)"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleAdjustHeight(40)}
                className="w-5 h-5 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Increase Height (+40px)"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Theater Mode Toggle */}
          <button 
            onClick={handleToggleTheater}
            className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              isTheaterMode 
                ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20' 
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title="Toggle Theater Mode (100% Full Width)"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Theater</span>
          </button>

          {game.github && (
            <a
              href={game.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex px-3 py-1.5 rounded-full bg-white/5 border border-white/10 items-center gap-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
              title="View Source on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Source</span>
            </a>
          )}

          <button 
            onClick={handleReload}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            title="Restart / Reload Game"
          >
            <RotateCcw className="w-4 h-4 text-white/80" />
          </button>

          <button 
            onClick={handleOpenExternal}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            title="Open in Dedicated Tab"
          >
            <ExternalLink className="w-4 h-4 text-white/80" />
          </button>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            title={soundEnabled ? "Audio Active" : "Audio Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-on-surface-variant" />}
          </button>

          <button 
            onClick={handleToggleFullscreen}
            className="px-3.5 py-1.5 rounded-full bg-primary text-black flex items-center gap-1.5 text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-primary/20"
            title="Play in Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </header>

      {/* Main Arena Grid - Adapts between Split Mode and Theater Mode */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
        
        {/* Game Iframe Frame (Spans full 12 columns in Theater Mode, or 8 in Standard) */}
        <div className={`${isTheaterMode ? 'col-span-12' : 'lg:col-span-8'} flex flex-col gap-4 transition-all duration-300 w-full`}>
          <div 
            className="relative w-full bg-[#060c18] p-2 rounded-3xl border border-white/10 shadow-2xl overflow-hidden group transition-all duration-300"
            style={{ height: `${iframeHeight}px` }}
          >
            <iframe
              id="embed-game-iframe"
              key={iframeKey}
              ref={iframeRef}
              src={game.url}
              className="w-full h-full rounded-2xl border-0 bg-black block"
              allow="autoplay; gamepad; fullscreen; focus-without-user-activation"
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
              title={game.name}
            />

            {/* Quick Controls overlay on bottom right */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => handleAdjustHeight(50)}
                className="px-2.5 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md rounded-lg border border-white/10 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 cursor-pointer shadow-lg"
                title="Increase Height"
              >
                <Plus className="w-3.5 h-3.5" /> Height
              </button>
              <button
                onClick={handleToggleTheater}
                className="px-2.5 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md rounded-lg border border-white/10 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 cursor-pointer shadow-lg"
                title="Toggle Theater Mode"
              >
                <Tv className="w-3.5 h-3.5" /> {isTheaterMode ? 'Compact' : 'Wide'}
              </button>
              <button
                onClick={handleToggleFullscreen}
                className="px-3 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md rounded-lg border border-white/10 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-lg"
                title="Fullscreen (Esc)"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </button>
            </div>
          </div>

          {/* ELO Rewards & Anti-Cheat Validation Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-ludo-yellow flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  Match Rewards Active <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <p className="text-[9px] text-on-surface-variant font-semibold">
                  {validationBadge ? validationBadge : 'Playing earns up to +150 XP and +100 Coins upon anti-cheat exit validation.'}
                </p>
              </div>
            </div>
            <Button 
              variant="neon" 
              className="text-xs whitespace-nowrap" 
              onClick={() => {
                const elapsed = Math.max(1, Math.floor((Date.now() - sessionStartTime.current) / 1000));
                const nonce = Math.random().toString(36).substring(2, 10);
                const check = antiCheatEngine.validateScoreSubmission({
                  gameId: gameId || 'generic',
                  userId: user?.id || 'guest',
                  score: 150,
                  sessionDurationSeconds: elapsed,
                  nonce,
                  clientTimestamp: Date.now()
                });
                if (check.valid) {
                  secureClaimReward(100, 150, nonce);
                  setValidationBadge('✓ Clean Session Verified • +100 Coins & +150 XP Cryptographically Committed');
                } else {
                  setValidationBadge(`⚠ Flagged: ${check.reason}`);
                }
                setTimeout(() => navigate('/library'), 1800);
              }}
            >
              VALIDATE & EXIT
            </Button>
          </div>
        </div>

        {/* Sidebar: Metadata & Live Chat (Relocates cleanly in Theater Mode) */}
        <div className={`${isTheaterMode ? 'col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4' : 'lg:col-span-4 flex flex-col gap-4'} w-full transition-all duration-300`}>
          
          {/* Metadata Card */}
          <Card level={3} className="p-5 border border-white/5 bg-black/30">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-label-caps text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-widest font-bold">{game.genre}</span>
                <h3 className="font-bold text-sm text-white mt-1.5">{game.name}</h3>
              </div>
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-xs text-ludo-yellow">
                <span>★</span>
                <span className="font-bold">{game.rating}</span>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed border-t border-white/5 pt-3">{game.desc}</p>
            
            {game.features && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider block mb-1.5">Features</span>
                <ul className="space-y-1 text-[10px] text-on-surface-variant">
                  {game.features.slice(0, 3).map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {game.github && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <a
                  href={game.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" /> Open GitHub Project
                </a>
              </div>
            )}
          </Card>

          {/* Social Chat */}
          <Card level={3} className={`p-4 flex flex-col ${isTheaterMode ? 'h-auto min-h-[220px]' : 'h-64'} border border-white/5 bg-black/25`}>
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Lobby Chat Room</span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 text-[10px] pr-1 scrollbar-thin">
              <div className="space-y-1.5 pb-2">
                <div>
                  <span className="font-bold mr-1 text-ludo-green">CYBER_JANE:</span>
                  <span className="text-on-surface-variant">The board fits completely now, zero scrollbar needed!</span>
                </div>
                <div>
                  <span className="font-bold mr-1 text-ludo-yellow">GOLD_KING:</span>
                  <span className="text-on-surface-variant">Theater mode gives so much screen space.</span>
                </div>
                <div>
                  <span className="font-bold mr-1 text-primary">NEXUS_ONE:</span>
                  <span className="text-on-surface-variant">Just hit 4096 on the grid! Awesome!</span>
                </div>
              </div>
            </div>
          </Card>

        </div>

      </main>
    </div>
  );
};
