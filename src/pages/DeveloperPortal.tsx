import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { Cpu, Terminal, Key, Shield, HelpCircle } from 'lucide-react';

export const DeveloperPortal: React.FC = () => {
  const [apiKey, setApiKey] = useState('gv_sec_live_9f82d1a3b4e5c6d7');
  const [showKey, setShowKey] = useState(false);

  const handleRegenKey = () => {
    const chars = 'abcdef0123456789';
    let newKey = 'gv_sec_live_';
    for (let i = 0; i < 16; i++) {
      newKey += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(newKey);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-headline-xl font-headline-xl text-white font-bold">Developer Portal</h1>
          <p className="text-xs text-on-surface-variant mt-1.5">Configure Game World multiplayer integration, fetch SDKs, and monitor API credentials.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          
          {/* Main developer consoles */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Credentials Card */}
            <Card level={2} className="p-6 border border-white/5 space-y-5">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold">SDK Credentials</h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Application Client ID</label>
                  <input
                    type="text"
                    value="gameworld_app_commander_nexus_01"
                    disabled
                    className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface-variant/70 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">SDK API Key Secret</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      disabled
                      className="w-full bg-[#050505] border border-white/5 rounded-xl pl-4 pr-24 py-2.5 text-xs text-on-surface-variant/70 cursor-not-allowed"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="text-[10px] font-bold text-primary border border-primary/20 px-2.5 py-1 rounded hover:bg-primary/5 transition-all"
                      >
                        {showKey ? 'Hide' : 'Reveal'}
                      </button>
                      <button 
                        onClick={handleRegenKey}
                        className="text-[10px] font-bold text-secondary border border-secondary/20 px-2.5 py-1 rounded hover:bg-secondary/5 transition-all"
                      >
                        Regen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* SDK download endpoints */}
            <Card level={2} className="p-6 border border-white/5">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold mb-6">Multiplayer Integration Kits</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#050505]/40 border border-white/5 p-4 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-white">Next.js / React SDK</div>
                    <div className="text-[9px] text-on-surface-variant mt-1">Version 2.4.1 • WebGL WebRTC adapter</div>
                  </div>
                  <Button variant="neon" className="py-1.5 text-xs">Download Bundle</Button>
                </div>

                <div className="flex justify-between items-center bg-[#050505]/40 border border-white/5 p-4 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-white">C# Unity SDK</div>
                    <div className="text-[9px] text-on-surface-variant mt-1">Version 1.8.0 • Authoritative server UDP plugin</div>
                  </div>
                  <Button variant="neon" className="py-1.5 text-xs">Download Bundle</Button>
                </div>
              </div>
            </Card>

          </div>

          {/* Right Column details */}
          <div className="space-y-6">
            <Card level={2} className="p-6 border border-white/5 space-y-4">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" /> API Guidelines
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                All client requests must contain the `x-gameworld-secret` signature header. Rate limits are throttled at 60 requests/minute per active ELO matchmaking room.
              </p>
            </Card>

            <Card level={2} className="p-6 border border-white/5 space-y-4">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" /> Trust Systems
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Platform matches require integration of the Game World anti-tampering engine. Intercepted violations will automatically notify the Moderation Trust center.
              </p>
            </Card>
          </div>

        </div>

      </main>
    </div>
  );
};
