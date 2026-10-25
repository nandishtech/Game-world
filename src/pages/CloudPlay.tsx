import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { Play, Tv, ArrowLeft, RefreshCw, Cpu, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CLOUD_GAMES = [
  { id: 'bp', name: 'Battle Arena', resolution: '1080p @ 60fps', ping: '12ms', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400' },
  { id: 'cm', name: 'Chess Masters', resolution: '4K @ 60fps', ping: '18ms', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400' },
  { id: 'vr', name: 'Velocity Racing', resolution: '1080p @ 120fps', ping: '8ms', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400' }
];

export const CloudPlay: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(CLOUD_GAMES[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartStream = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsStreaming(true);
    }, 2500);
  };

  const handleStopStream = () => {
    setIsStreaming(false);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background flex flex-col">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop w-full flex-grow grid grid-cols-1 lg:grid-cols-4 gap-gutter items-stretch">
        
        {/* Left column: Choose Game */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card level={2} className="p-4 border border-white/5 flex-grow">
            <h3 className="text-sm font-bold text-white mb-4">Cloud Platforms</h3>
            
            <div className="space-y-3">
              {CLOUD_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    if (isStreaming) handleStopStream();
                    setSelectedGame(game);
                  }}
                  className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center gap-3 ${selectedGame.id === game.id ? 'bg-primary/10 border-primary/30' : 'bg-[#050505]/40 border-white/5 hover:border-white/10'}`}
                >
                  <img src={game.img} alt={game.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                  <div>
                    <div className="text-xs font-bold text-white">{game.name}</div>
                    <div className="text-[9px] text-on-surface-variant mt-1.5 font-semibold">{game.resolution}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center column: Virtual Streaming Monitor */}
        <div className="lg:col-span-3 flex flex-col">
          <Card level={2} className="flex-grow border border-white/5 flex flex-col min-h-[480px]">
            
            {/* Monitor Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050505]/30">
              <div>
                <h2 className="text-sm font-bold text-white">{selectedGame.name} • Instant Stream</h2>
                <p className="text-[10px] text-on-surface-variant flex items-center gap-2 mt-1">
                  <span>Stream Quality: {selectedGame.resolution}</span>
                  <span>•</span>
                  <span className="text-green-400">RTT: {selectedGame.ping}</span>
                </p>
              </div>

              {isStreaming && (
                <Button variant="glass" onClick={handleStopStream} className="py-1.5 px-4 text-xs border-error/25 hover:border-error/45 text-error">
                  Disconnect Stream
                </Button>
              )}
            </div>

            {/* Simulated Stream frame */}
            <div className="flex-grow bg-black relative flex items-center justify-center overflow-hidden min-h-[300px]">
              
              {isLoading && (
                <div className="text-center z-10 space-y-4">
                  <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto filter drop-shadow-[0_0_10px_rgba(77,142,255,0.4)]" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Acquiring Virtual Console Core...</p>
                </div>
              )}

              {!isStreaming && !isLoading && (
                <div className="text-center z-10 space-y-6 max-w-sm px-4">
                  <Tv className="w-16 h-16 text-primary mx-auto opacity-80 filter drop-shadow-[0_0_15px_rgba(77,142,255,0.3)]" />
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white">Ready for Instant Deployment</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Deploy this title instantly on high-end hardware without installation. Recommended network: 15 Mbps+.
                    </p>
                  </div>
                  <Button variant="neon" onClick={handleStartStream} className="px-8 py-3.5 mx-auto">
                    Start Stream now <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              )}

              {isStreaming && !isLoading && (
                <>
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-xs" style={{ backgroundImage: `url(${selectedGame.img})` }} />
                  
                  {/* Glowing core animation */}
                  <div className="relative text-center z-10 space-y-3 bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-md mx-4">
                    <span className="bg-green-400 text-black text-[9px] px-3.5 py-0.5 rounded-full uppercase font-black tracking-widest animate-pulse">Stream Live</span>
                    <h3 className="text-xl font-bold font-headline-sm text-white">Stream Pipeline Established</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Inputs synchronized. Virtual RTX rendering pipeline broadcasting active frame buffer updates. Enjoy gameplay!
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Server Specifications */}
            <div className="px-6 py-4 border-t border-white/5 bg-[#050505]/20 flex flex-wrap gap-6 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Server className="w-4 h-4 text-primary" /> Region: US East Node</span>
              <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-secondary" /> Virtual Core: AMD EPYC / RTX 4090 vGPU</span>
            </div>

          </Card>
        </div>

      </main>
    </div>
  );
};
