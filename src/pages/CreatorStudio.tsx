import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { Sparkles, Upload, BookOpen, Settings, BarChart2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const MY_MODS = [
  { id: 'm1', name: 'Cyberpunk Katana Skin', game: 'Battle Arena', downloads: '1,420', status: 'APPROVED', revenue: '$250' },
  { id: 'm2', name: 'Holographic Chess Set', game: 'Chess Masters', downloads: '320', status: 'PENDING', revenue: '$0' }
];

export const CreatorStudio: React.FC = () => {
  const [modName, setModName] = useState('');
  const [selectedGame, setSelectedGame] = useState('battle_arena');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modName) return;
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
    setModName('');
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-headline-xl font-headline-xl text-white font-bold">Creator Studio</h1>
          <p className="text-xs text-on-surface-variant mt-1.5">Upload custom assets, construct community mods, and monetize content.</p>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          
          {/* Left Column: Upload and Guidelines */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upload form */}
            <Card level={2} className="p-6 border border-white/5 space-y-5">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold">Upload Custom Mod Add-on</h3>
              
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">Asset/Mod Name</label>
                    <input
                      type="text"
                      value={modName}
                      onChange={(e) => setModName(e.target.value)}
                      placeholder="e.g. Laser Rifle Skin Pack"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">Target Title</label>
                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="battle_arena">Battle Arena</option>
                      <option value="chess_masters">Chess Masters</option>
                      <option value="velocity_racing">Velocity Racing</option>
                    </select>
                  </div>
                </div>

                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer">
                  <Upload className="w-8 h-8 text-on-surface-variant/60 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white">Drag & drop package zip file</p>
                  <p className="text-[10px] text-on-surface-variant/40 mt-1">Maximum upload size: 128 MB (asset files only)</p>
                </div>

                {uploadSuccess && (
                  <span className="text-[10px] text-green-400 font-bold block">
                    ✓ Mod package successfully submitted for compliance validation.
                  </span>
                )}

                <div className="flex justify-end">
                  <Button type="submit" variant="neon" className="px-6 py-2.5 text-xs">
                    Upload Dispatch
                  </Button>
                </div>
              </form>
            </Card>

            {/* My Active Projects */}
            <Card level={2} className="p-6 border border-white/5">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold mb-6">Active Creative Projects</h3>
              
              <div className="space-y-4">
                {MY_MODS.map((mod) => (
                  <div 
                    key={mod.id} 
                    className="flex justify-between items-center bg-[#050505]/40 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{mod.name}</div>
                      <div className="text-[9px] text-on-surface-variant mt-1.5 flex items-center gap-2">
                        <span>Game: {mod.game}</span>
                        <span>•</span>
                        <span>Downloads: {mod.downloads}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{mod.revenue}</div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded border mt-1.5 block ${mod.status === 'APPROVED' ? 'bg-green-500/5 text-green-400 border-green-500/20' : 'bg-yellow-500/5 text-yellow-400 border-yellow-500/20'}`}>
                        {mod.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Right Column: Policies */}
          <div className="space-y-6">
            <Card level={2} className="p-6 border border-white/5 space-y-4">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Creator Guide
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Ensure all asset meshes adhere to our performance budgets (maximum 15k polygons per character skin). Transparent maps must not exceed 2048x2048 resolutions.
              </p>
            </Card>

            <Card level={2} className="p-6 border border-white/5 space-y-4">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-secondary" /> Mod Metrics
              </h3>
              <div className="space-y-3 text-xs text-on-surface-variant font-semibold">
                <div className="flex justify-between">
                  <span>Mod Revenue Split</span>
                  <span className="text-white font-bold">85% Creator / 15% Platform</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification SLA</span>
                  <span className="text-white font-bold">24-48 Hours</span>
                </div>
              </div>
            </Card>
          </div>

        </div>

      </main>
    </div>
  );
};
