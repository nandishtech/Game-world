import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { Sparkles, Trophy, Lock, Unlock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PassTier {
  tier: number;
  name: string;
  type: 'SKIN' | 'COINS' | 'BOOSTER' | 'FRAME';
  isPremium: boolean;
  requiredLevel: number;
  img: string;
}

const BATTLEPASS_TIERS: PassTier[] = [
  { tier: 1, name: 'Cyber Neon Avatar', type: 'FRAME', isPremium: false, requiredLevel: 1, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100' },
  { tier: 2, name: '100 Core Coins', type: 'COINS', isPremium: false, requiredLevel: 5, img: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=100' },
  { tier: 3, name: 'Holo-Decal Strike', type: 'SKIN', isPremium: true, requiredLevel: 10, img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100' },
  { tier: 4, name: 'XP Overdrive (1h)', type: 'BOOSTER', isPremium: false, requiredLevel: 15, img: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100' },
  { tier: 5, name: 'Vanguard Saber Skin', type: 'SKIN', isPremium: true, requiredLevel: 25, img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100' }
];

export const BattlePass: React.FC = () => {
  const { user } = useAuthStore();
  const currentLevel = user ? user.level : 1;

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title Banner */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-surface-container-low border border-white/5 p-6 rounded-2xl">
          <div className="space-y-2">
            <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] px-3.5 py-0.5 rounded-full uppercase font-bold tracking-widest">
              Season 4 Active
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-headline-sm">Neon Uprising Battlepass</h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Earn XP in tactical matches to climb battle tiers and claim premium cosmetic items.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#050505]/60 border border-white/10 px-6 py-4 rounded-xl">
            <div>
              <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Your Level</div>
              <div className="text-2xl font-bold text-white font-headline-sm mt-0.5">Tier {currentLevel}</div>
            </div>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Tiers List Row */}
        <Card level={2} className="p-6 border border-white/5 space-y-6">
          <h3 className="text-headline-sm font-headline-sm text-white font-bold">Seasonal Progression Tiers</h3>
          
          <div className="space-y-4">
            {BATTLEPASS_TIERS.map((tierItem) => {
              const isUnlocked = currentLevel >= tierItem.requiredLevel;
              return (
                <div 
                  key={tierItem.tier} 
                  className={`flex flex-col md:flex-row items-center justify-between p-4.5 rounded-xl border transition-all gap-4 ${isUnlocked ? 'bg-primary/5 border-primary/25' : 'bg-[#050505]/40 border-white/5 opacity-70'}`}
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Level Hexagon Icon */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm font-headline-sm border ${isUnlocked ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-on-surface-variant'}`}>
                      <div className="text-[9px] uppercase font-bold">Tier</div>
                      <div>{tierItem.tier}</div>
                    </div>

                    <img src={tierItem.img} alt={tierItem.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />

                    <div>
                      <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{tierItem.type}</div>
                      <h4 className="text-sm font-bold text-white leading-normal mt-0.5">{tierItem.name}</h4>
                      <p className="text-[9px] text-on-surface-variant font-semibold mt-1">Requires Player Level {tierItem.requiredLevel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${tierItem.isPremium ? 'text-secondary border-secondary/20 bg-secondary/5' : 'text-primary border-primary/20 bg-primary/5'}`}>
                      {tierItem.isPremium ? 'Premium' : 'Free'}
                    </span>

                    {isUnlocked ? (
                      <span className="text-green-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-400" /> Claimed
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/40 font-bold text-xs flex items-center gap-1.5">
                        <Lock className="w-4 h-4" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </main>
    </div>
  );
};
