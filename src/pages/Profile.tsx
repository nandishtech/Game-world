import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { 
  Award, 
  User, 
  Globe, 
  ShieldCheck, 
  Save, 
  Sparkles,
  Gamepad2,
  Trophy,
  Coins,
  Flame,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'pilot', name: 'Pilot Alpha', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PilotAlpha' },
  { id: 'phoenix', name: 'Cyber Phoenix', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberPhoenix' },
  { id: 'shadow', name: 'Shadow Striker', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowStriker' },
  { id: 'valkyrie', name: 'Neon Valkyrie', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonValkyrie' },
  { id: 'titan', name: 'Mech Titan', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MechTitan' },
  { id: 'ghost', name: 'Cyber Ghost', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberGhost' },
  { id: 'quantum', name: 'Quantum Pulse', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumPulse' },
  { id: 'apex', name: 'Apex Legend', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexLegend' }
];

const getRankTier = (rank: number): { tier: string; color: string } => {
  if (rank >= 1000) return { tier: 'Apex Legend', color: 'text-amber-400' };
  if (rank >= 500) return { tier: 'Diamond Master', color: 'text-cyan-400' };
  if (rank >= 250) return { tier: 'Platinum Pilot', color: 'text-emerald-400' };
  if (rank >= 100) return { tier: 'Gold Vanguard', color: 'text-yellow-400' };
  if (rank >= 30) return { tier: 'Silver Scout', color: 'text-slate-300' };
  return { tier: 'Bronze Initiate', color: 'text-amber-600' };
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateProfile } = useAuthStore();
  const isFirstLogin = searchParams.get('firstLogin') === 'true' || Boolean(user?.isFirstLogin);

  // Editable Form State
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
  const [age, setAge] = useState<number>(user?.age ?? 18);
  const [country, setCountry] = useState(user?.country || 'Global Node');
  const [bio, setBio] = useState(user?.bio || 'Climbing ranks in Game World. Ready for live matches!');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || PRESET_AVATARS[0].url);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) return null;

  const totalMatches = user.stats.wins + user.stats.losses;
  const winRate = totalMatches > 0 ? Math.round((user.stats.wins / totalMatches) * 100) : 0;
  const rankTier = getRankTier(user.stats.rank);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim() || user.username,
      age: Number(age) || 18,
      country: country.trim() || 'Global Node',
      bio: bio.trim(),
      avatarUrl: selectedAvatar
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Onboarding Welcome Banner for First-Time Users */}
        {isFirstLogin && (
          <Card level={1} className="p-6 border-2 border-primary/50 bg-primary/10 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary flex-shrink-0">
                <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Welcome, Commander! <span className="text-[10px] bg-primary text-black font-black px-2 py-0.5 rounded-full">New Pilot</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Set your Gamer Name, Age, and Avatar below. When you're ready, jump directly into the action!
                </p>
              </div>
            </div>
            <Button
              variant="neon"
              className="text-xs py-3 px-6 whitespace-nowrap cursor-pointer shrink-0 font-bold tracking-wider"
              onClick={() => {
                updateProfile({
                  displayName: displayName.trim() || user.username,
                  age: Number(age) || 18,
                  country: country.trim() || 'Global Node',
                  bio: bio.trim(),
                  avatarUrl: selectedAvatar
                });
                navigate('/library');
              }}
            >
              START PLAYING GAMES →
            </Button>
          </Card>
        )}

        {/* Hero Gamer Profile Banner */}
        <Card level={2} className="p-6 md:p-8 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Avatar & Player Quick Info */}
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full">
              <div className="relative w-28 h-28 rounded-2xl border-2 border-primary overflow-hidden shadow-lg shadow-primary/20 bg-black/80 flex-shrink-0">
                <img src={selectedAvatar} alt={displayName} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-primary text-black text-[9px] font-black uppercase">
                  LVL {user.level}
                </span>
              </div>

              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-none">
                    {displayName || user.username}
                  </h1>
                  <span className={`border border-current px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${rankTier.color}`}>
                    {rankTier.tier}
                  </span>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED PLAYER
                  </span>
                </div>
                
                <p className="text-xs text-on-surface-variant flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-white/80">
                    <Globe className="w-3.5 h-3.5 text-primary" /> {country}
                  </span>
                  <span>•</span>
                  <span className="text-white/80 font-medium">Age: {age}</span>
                  <span>•</span>
                  <span className="text-white/60">ID: {user.id.substring(0, 12)}</span>
                </p>

                {/* Level & XP Progress */}
                <div className="w-full max-w-md pt-2">
                  <div className="flex justify-between text-[11px] text-on-surface-variant font-bold mb-1.5">
                    <span className="text-white">Level {user.level} Combatant</span>
                    <span className="text-primary font-bold">{user.xp} / 100 XP</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-primary to-cyan-400 h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(0, user.xp % 100))}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto flex-shrink-0">
              <Button
                variant="neon"
                onClick={() => navigate('/library')}
                className="py-3 px-6 text-xs font-bold tracking-wider cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" /> PLAY GAMES NOW
              </Button>
            </div>

          </div>
        </Card>

        {/* Main Content Grid: Profile Settings & Player Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Profile Editor & Avatar Picker */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Avatar Selector */}
            <Card level={2} className="p-6 border border-white/10 bg-black/40 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Choose Your Gamer Avatar
                </h3>
                <span className="text-[10px] text-on-surface-variant">Click any avatar to select</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-2">
                {PRESET_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-1 bg-black/50 hover:scale-105 cursor-pointer ${
                        isSelected 
                          ? 'border-primary shadow-[0_0_15px_rgba(77,142,255,0.6)] scale-105' 
                          : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                      }`}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-lg" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary text-black rounded-full p-0.5 shadow-md">
                          <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Profile Form Details */}
            <Card level={2} className="p-6 md:p-8 border border-white/10 bg-black/40 backdrop-blur-md space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Gamer Profile Information
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Personalize your gamer callsign, age, and profile motto.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Gamer Name / Callsign */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                      Gamer Callsign / Name <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={24}
                      placeholder="e.g. ShadowHunter"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                      required
                    />
                  </div>

                  {/* Player Age */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                      Player Age <span className="text-primary">*</span>
                    </label>
                    <input
                      type="number"
                      min={6}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      placeholder="e.g. 18"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Country / Region */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                      Country / Region
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States, India, Germany..."
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                    />
                  </div>

                  {/* Account Email (Read-Only) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 block">
                      Registered Email (Protected)
                    </label>
                    <input
                      type="text"
                      value={user.email}
                      disabled
                      className="w-full bg-[#050505]/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Gamer Bio / Motto */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                      Gamer Bio & Motto
                    </label>
                    <span className="text-[10px] text-on-surface-variant">{bio.length}/160</span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={160}
                    placeholder="Enter your favorite gaming quote, playstyle, or battle motto..."
                    className="w-full bg-[#050505] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-primary transition-all resize-none placeholder-white/20"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                  {saveSuccess ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
                    </span>
                  ) : (
                    <span className="text-[11px] text-on-surface-variant">
                      Changes are immediately saved to your gaming account.
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <Button 
                      type="submit" 
                      variant="neon" 
                      className="py-2.5 px-6 text-xs font-bold tracking-wider cursor-pointer shadow-lg shadow-primary/20"
                    >
                      SAVE PROFILE <Save className="w-4 h-4 ml-1.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="glass"
                      onClick={() => navigate('/library')}
                      className="py-2.5 px-6 text-xs font-bold tracking-wider cursor-pointer border border-white/10"
                    >
                      BROWSE GAMES →
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

          </div>

          {/* Right Column (4 cols): Gamer Stats & Performance Breakdown */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Stats Overview Card */}
            <Card level={2} className="p-6 border border-white/10 bg-black/40 backdrop-blur-md space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                <Trophy className="w-4 h-4 text-amber-400" /> Platform Statistics
              </h3>

              <div className="space-y-4 text-xs">
                {/* Rank Points */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-white/80 font-medium">Rank Score</span>
                  </div>
                  <span className="font-extrabold text-white text-sm">{user.stats.rank} ELO</span>
                </div>

                {/* Coins Balance */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/80 font-medium">Coins Balance</span>
                  </div>
                  <span className="font-extrabold text-yellow-400 text-sm">{user.coins} Coins</span>
                </div>

                {/* Matches Played */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Gamepad2 className="w-4 h-4 text-primary" />
                    <span className="text-white/80 font-medium">Matches Played</span>
                  </div>
                  <span className="font-extrabold text-white text-sm">{totalMatches} matches</span>
                </div>

                {/* Win Rate */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/80 font-medium">Win Rate</span>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {winRate}% ({user.stats.wins}W / {user.stats.losses}L)
                  </span>
                </div>

                {/* Play Time */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-white/80 font-medium">Time In Matches</span>
                  </div>
                  <span className="font-extrabold text-white text-sm">{user.stats.hoursPlayed} hrs</span>
                </div>
              </div>
            </Card>

            {/* Quick Play Card */}
            <Card level={2} className="p-6 border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ready to Climb?</h4>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Compete in over 67 master titles. Win matches to level up your combatant status and claim coins on the global leaderboard.
              </p>
              <Button
                variant="neon"
                onClick={() => navigate('/library')}
                className="w-full py-3 text-xs font-bold tracking-wider cursor-pointer"
              >
                ENTER GAMES LIBRARY →
              </Button>
            </Card>

          </div>

        </div>

      </main>
    </div>
  );
};
