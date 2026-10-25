import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchmakeStore } from '../store/useMatchmakeStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { motion } from 'framer-motion';
import { Search, Play, Download, Info, Globe, Monitor, Sparkles } from 'lucide-react';
import { GAMES_CATALOG, GameItem } from '../data/gamesRegistry';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const startQueue = useMatchmakeStore((state) => state.startQueue);
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'WEB' | 'DESKTOP' | string>('ALL');

  const filteredGames = GAMES_CATALOG.filter((game) => {
    const matchesSearch = 
      game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.genre.toLowerCase().includes(search.toLowerCase()) ||
      game.desc.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'ALL') return true;
    if (filterType === 'WEB') return game.type === 'web';
    if (filterType === 'DESKTOP') return game.type === 'desktop';

    return game.genre.toUpperCase().replace(/[\s&]+/g, '_') === filterType;
  });

  const handleAction = (game: GameItem) => {
    // Both web (playable in iframe) and desktop (host as downloads) route into the unified player/station
    navigate(`/play/embed/${game.id}`);
  };

  const categories = [
    { label: 'ALL GAMES', value: 'ALL', count: GAMES_CATALOG.length },
    { label: 'BROWSER (IFRAME)', value: 'WEB', count: GAMES_CATALOG.filter(g => g.type === 'web').length },
    { label: 'DESKTOP (DOWNLOADS)', value: 'DESKTOP', count: GAMES_CATALOG.filter(g => g.type === 'desktop').length },
    { label: 'STRATEGY', value: 'STRATEGY' },
    { label: 'ARCADE', value: 'ARCADE' },
    { label: 'ACTION & MOBA', value: 'ACTION_MOBA' },
    { label: 'PUZZLE', value: 'PUZZLE' },
    { label: 'RPG', value: 'RPG' },
    { label: 'RACING', value: 'CAR_RACING' },
    { label: 'BOARD GAME', value: 'BOARD_GAME' }
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      {/* WebGL celestial backdrop */}
      <ShaderBackground type="universe" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title Deck */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-primary/20 text-primary border border-primary/30 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 67 Master Titles Available
              </span>
            </div>
            <h1 className="text-headline-xl font-headline-xl text-white font-bold">Game Universe Library</h1>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Instant in-browser iframe gameplay & direct open-source desktop release downloads.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <Globe className="w-4 h-4 text-primary" /> 45 Web Iframe Titles
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <Monitor className="w-4 h-4 text-emerald-400" /> 22 Desktop Downloads
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-black/15 backdrop-blur-md border border-white/5 p-4 rounded-2xl">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 67 open-source titles..."
              className="w-full bg-black/35 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
            />
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {categories.map((cat) => {
              const active = filterType === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterType(cat.value)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                    active 
                      ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(77,142,255,0.4)]' 
                      : 'bg-transparent text-on-surface-variant border-white/10 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${active ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-white/60'}`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center text-xs text-on-surface-variant px-1">
          <span>Showing <strong className="text-white">{filteredGames.length}</strong> matching titles</span>
          {filterType !== 'ALL' && (
            <button 
              onClick={() => setFilterType('ALL')}
              className="text-primary hover:underline cursor-pointer"
            >
              Reset to All
            </button>
          )}
        </div>

        {/* Dynamic Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {filteredGames.length === 0 ? (
            <div className="col-span-full text-center py-24 text-on-surface-variant text-xs">
              No titles match your query. Try searching for "Doom", "Tetris", "Snake", or "Strategy".
            </div>
          ) : (
            filteredGames.map((game, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.4) }}
                key={game.id}
              >
                <Card level={2} glow={true} className="flex flex-col h-full group">
                  {/* Thumbnail Container */}
                  <div className="relative h-44 w-full overflow-hidden bg-black">
                    <img 
                      src={game.img} 
                      alt={game.name} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" 
                    />
                    
                    {/* Top Left: Type Pill */}
                    <div className="absolute top-3 left-3">
                      {game.type === 'web' ? (
                        <span className="bg-primary/90 text-black backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] uppercase font-extrabold flex items-center gap-1 shadow-md">
                          <Globe className="w-3 h-3" /> Web Iframe
                        </span>
                      ) : (
                        <span className="bg-emerald-500/90 text-black backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] uppercase font-extrabold flex items-center gap-1 shadow-md">
                          <Monitor className="w-3 h-3" /> Desktop
                        </span>
                      )}
                    </div>

                    {/* Top Right: Players Online */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold text-white/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {game.players}
                    </div>

                    {/* Bottom Gradient overlay with Rating */}
                    <div className="absolute bottom-2 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-amber-400 font-bold border border-white/10 flex items-center gap-1">
                      <span>★</span>
                      <span>{game.rating}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">{game.genre}</span>
                      {game.size && (
                        <span className="text-[9px] text-white/50">{game.size}</span>
                      )}
                    </div>
                    
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-primary transition-colors line-clamp-1">{game.name}</h3>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed mt-2.5 mb-6 flex-grow line-clamp-2">{game.desc}</p>
                    
                    {/* Action Bar */}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                      {game.type === 'web' ? (
                        <Button 
                          variant="neon" 
                          onClick={() => handleAction(game)} 
                          className="flex-1 py-2 text-xs cursor-pointer"
                        >
                          Play In Iframe <Play className="w-3.5 h-3.5 fill-current" />
                        </Button>
                      ) : (
                        <Button 
                          variant="glass" 
                          onClick={() => handleAction(game)} 
                          className="flex-1 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer border-0"
                        >
                          Download <Download className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {game.github && (
                        <a
                          href={game.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white"
                          title="View GitHub Repository"
                        >
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}

                      <Button 
                        variant="glass" 
                        onClick={() => navigate(`/game/${game.id}`)}
                        className="px-2.5 py-2 border border-white/10 hover:border-white/20 cursor-pointer"
                        title="View Details & Specs"
                      >
                        <Info className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};
