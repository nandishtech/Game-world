import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Star, Users, Info, Shield, Download, Radio, ExternalLink, Globe, Monitor, CheckCircle2 } from 'lucide-react';
import { getGameById, GameItem } from '../data/gamesRegistry';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const game: GameItem = (id && getGameById(id)) || {
    id: id || 'neo_vanguard',
    name: 'Neo-Vanguard: Prime',
    type: 'web',
    genre: 'Tactical FPS',
    players: '24,150',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
    desc: 'The gold standard of tactical neon shooters. Drop into cybernetic city districts, coordinate drone defenses, and engage in high-precision gun battles. Built on zero-latency networking for absolute competitive fairness.',
    specs: { os: 'Windows 10/11 64-bit', cpu: 'Intel Core i7-9700K / AMD Ryzen 7 3700X', ram: '16 GB DDR4', gpu: 'NVIDIA RTX 2060 / AMD RX 5700 XT' },
    features: ['Low latency server networks', 'Advanced anti-cheat trust controls', 'Visual skin customizer', 'Creator studio mod support']
  };

  const handlePlayInIframe = () => {
    navigate(`/play/embed/${game.id}`);
  };

  return (
    <div className="relative min-h-screen pt-20 pb-12 bg-background">
      <ShaderBackground type="core" />

      {/* Hero Banner Area */}
      <div className="relative h-[320px] md:h-[400px] w-full overflow-hidden z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-xs"
          style={{ backgroundImage: `url(${game.banner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-background/40 to-transparent" />
      </div>

      {/* Content Container */}
      <main className="relative z-10 -mt-32 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/library')}
          className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Library
        </button>

        {/* Card info deck */}
        <Card level={2} className="p-6 md:p-8 border border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Poster Thumbnail */}
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-black">
              <img src={game.img} alt={game.name} className="w-full object-cover aspect-[4/3] md:aspect-[3/4]" />
              <div className="absolute top-3 left-3">
                {game.type === 'web' ? (
                  <span className="bg-primary text-black font-extrabold text-[9px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <Globe className="w-3 h-3" /> Web Iframe
                  </span>
                ) : (
                  <span className="bg-emerald-500 text-black font-extrabold text-[9px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <Monitor className="w-3 h-3" /> Desktop Release
                  </span>
                )}
              </div>
            </div>

            {/* General Bio Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{game.genre}</span>
                  {game.size && (
                    <span className="text-[10px] text-white/40">• Approx {game.size}</span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mt-1.5">{game.name}</h1>
                
                {/* Stats row */}
                <div className="flex gap-6 mt-4 text-xs font-semibold text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white">{game.rating}</span> rating
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-white">{game.players}</span> active players
                  </div>
                  {game.platforms && (
                    <div className="hidden sm:flex items-center gap-1.5 text-white/70">
                      <Monitor className="w-4 h-4 text-emerald-400" />
                      <span>{game.platforms.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-on-surface-variant leading-relaxed">{game.desc}</p>

              {/* Interaction Panel */}
              <div className="flex flex-wrap gap-4 pt-2">
                {game.type === 'web' ? (
                  <Button variant="neon" onClick={handlePlayInIframe} className="px-8 py-3 cursor-pointer">
                    Play In Iframe <Play className="w-4 h-4 fill-current" />
                  </Button>
                ) : (
                  <>
                    {game.downloadUrl && (
                      <a
                        href={game.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download Release
                      </a>
                    )}
                    {game.officialUrl && (
                      <a
                        href={game.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" /> Official Site
                      </a>
                    )}
                  </>
                )}

                {game.github && (
                  <a
                    href={game.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <GithubIcon className="w-4 h-4" /> GitHub Source
                  </a>
                )}

                <Button variant="glass" onClick={() => navigate('/cloud')} className="px-6 py-3 border border-white/10 cursor-pointer">
                  Cloud Stream <Radio className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </div>
        </Card>

        {/* Technical specs and features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          
          {/* Key Features */}
          <Card level={2} className="p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white font-headline-sm flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-primary" /> Key Highlights & Architecture
            </h3>
            <ul className="space-y-3.5 text-xs text-on-surface-variant font-medium">
              {(game.features || [
                'Open-source repository verified architecture',
                'Zero-telemetry privacy safe execution',
                'Community driven roadmap and extensions',
                'High performance engine optimization'
              ]).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* System Spec Matrix */}
          <Card level={2} className="p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white font-headline-sm flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-secondary" /> System Specs Matrix
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#050505]/40 border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">OS Platform</div>
                <div className="text-white mt-1">{game.specs?.os || 'Windows 10/11 / WebGL Browser'}</div>
              </div>
              <div className="bg-[#050505]/40 border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Processor (CPU)</div>
                <div className="text-white mt-1">{game.specs?.cpu || 'Dual-Core 2.0 GHz or WebAssembly Capable'}</div>
              </div>
              <div className="bg-[#050505]/40 border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">System Memory</div>
                <div className="text-white mt-1">{game.specs?.ram || '2 GB RAM'}</div>
              </div>
              <div className="bg-[#050505]/40 border border-white/5 p-3 rounded-lg">
                <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">GPU Graphic Cards</div>
                <div className="text-white mt-1">{game.specs?.gpu || 'WebGL 2.0 / Hardware Acceleration'}</div>
              </div>
            </div>
          </Card>

        </div>

      </main>
    </div>
  );
};
