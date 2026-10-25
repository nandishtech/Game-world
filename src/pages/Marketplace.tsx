import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSocialStore } from '../store/useSocialStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { Coins, ShieldAlert, Sparkles, Tag, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface StoreItem {
  id: string;
  name: string;
  type: 'SKIN' | 'AVATAR' | 'FRAME' | 'BOOSTER';
  price: number;
  rarity: 'LEGENDARY' | 'EPIC' | 'RARE';
  img: string;
  unlocked?: boolean;
}

const INITIAL_ITEMS: StoreItem[] = [
  { id: 'item_1', name: 'Neon Samurai V2', type: 'SKIN', price: 650, rarity: 'LEGENDARY', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300' },
  { id: 'item_2', name: 'Cyber Void Decal', type: 'SKIN', price: 400, rarity: 'EPIC', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300' },
  { id: 'item_3', name: 'Holographic Sphere', type: 'AVATAR', price: 200, rarity: 'RARE', img: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=300' },
  { id: 'item_4', name: 'Vanguard Ring Frame', type: 'FRAME', price: 150, rarity: 'RARE', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300' },
  { id: 'item_5', name: 'Double XP Booster (2h)', type: 'BOOSTER', price: 100, rarity: 'RARE', img: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=300' },
  { id: 'item_6', name: 'Shadow Protocol Suit', type: 'SKIN', price: 1200, rarity: 'LEGENDARY', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300' }
];

export const Marketplace: React.FC = () => {
  const { user, spendCoins } = useAuthStore();
  const { addNotification } = useSocialStore();
  const [items, setItems] = useState<StoreItem[]>(INITIAL_ITEMS);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePurchase = (item: StoreItem) => {
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('Session authorized required.');
      return;
    }

    if (user.coins < item.price) {
      setError(`Insufficient E-currency. You need ${item.price - user.coins} more coins.`);
      return;
    }

    const successPurchase = spendCoins(item.price);
    if (successPurchase) {
      // Mark as unlocked locally
      setItems(prevItems =>
        prevItems.map(i => (i.id === item.id ? { ...i, unlocked: true } : i))
      );
      
      setSuccess(`Successfully acquired: ${item.name}! Check your profile loadout.`);
      addNotification('ACHIEVEMENT', `Acquired Marketplace Cosmetic: ${item.name}`);

      // Fun achievement confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      setError('Transaction rejected by billing secure channel.');
    }
  };

  const getRarityColor = (rarity: StoreItem['rarity']) => {
    switch (rarity) {
      case 'LEGENDARY': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
      case 'EPIC': return 'text-secondary border-secondary/20 bg-secondary/5';
      case 'RARE': return 'text-primary border-primary/20 bg-primary/5';
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-headline-xl font-headline-xl text-white font-bold">Player Marketplace</h1>
            <p className="text-xs text-on-surface-variant mt-1.5">Acquire legendary cosmetics, custom user avatars, and leveling boosters.</p>
          </div>
          
          {user && (
            <Card level={1} className="flex items-center gap-3 bg-[#050505]/60 px-4 py-2 border border-white/5">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-white font-bold">{user.coins} Coins Available</span>
            </Card>
          )}
        </div>

        {/* Messaging Feedback */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-error-container/15 border border-error-container/20 p-4 rounded-xl text-error text-xs">
            <ShieldAlert className="w-5 h-5" /> {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-xs font-bold">
            <Sparkles className="w-5 h-5 text-green-400" /> {success}
          </motion.div>
        )}

        {/* Store Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {items.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={item.id}
            >
              <Card level={2} className="flex flex-col h-full group border border-white/5">
                <div className="relative h-44 w-full overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  <span className={`absolute top-4 left-4 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">{item.type}</span>
                  <h3 className="text-sm font-bold text-white mt-1 group-hover:text-primary transition-colors">{item.name}</h3>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <Coins className="w-4 h-4 text-yellow-400" /> {item.price}
                    </div>

                    {item.unlocked ? (
                      <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Acquired
                      </span>
                    ) : (
                      <Button 
                        variant="neon" 
                        onClick={() => handlePurchase(item)}
                        className="py-1.5 px-4 text-xs shadow-[0_0_10px_rgba(77,142,255,0.2)]"
                      >
                        Acquire <Tag className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
};
