import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { 
  Users, 
  Trophy, 
  MessageSquare, 
  Send, 
  Calendar, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles, 
  Coins, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Crown, 
  Gamepad2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useClanStore, CLAN_CREATION_CRITERIA, Clan } from '../store/useClanStore';
import { motion, AnimatePresence } from 'framer-motion';

const EMBLEM_OPTIONS = ['⚔️', '🛡️', '👑', '⚡', '🐉', '🚀', '🎮', '💎'];

export const ClanHub: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { clans, myClanId, clanMessages, createClan, joinClan, leaveClan, disbandClan, sendClanMessage } = useClanStore();

  const [activeTab, setActiveTab] = useState<'MY_CLAN' | 'FOUND_CLAN' | 'EXPLORE_CLANS'>('MY_CLAN');
  const [chatInput, setChatInput] = useState('');
  
  // Creation form state
  const [clanName, setClanName] = useState('');
  const [clanTag, setClanTag] = useState('');
  const [clanDesc, setClanDesc] = useState('');
  const [selectedEmblem, setSelectedEmblem] = useState(EMBLEM_OPTIONS[0]);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal confirmations
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDisbandModal, setShowDisbandModal] = useState(false);

  if (!user) return null;

  // Active Clan
  const myClan: Clan | undefined = clans.find((c) => c.id === myClanId);
  const messages = myClan ? (clanMessages[myClan.id] || []) : [];
  const isLeader = myClan?.founderId === user.id;

  // Criteria validation checks
  const meetsLevel = user.level >= CLAN_CREATION_CRITERIA.MIN_LEVEL;
  const meetsCoins = user.coins >= CLAN_CREATION_CRITERIA.COIN_COST;
  const meetsRank = user.stats.rank >= CLAN_CREATION_CRITERIA.MIN_RANK;
  const allCriteriaMet = meetsLevel && meetsCoins && meetsRank;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const res = createClan({
      name: clanName,
      tag: clanTag,
      description: clanDesc,
      emblem: selectedEmblem
    }, user);

    if (res.success) {
      setFormFeedback({ type: 'success', text: res.message });
      setClanName('');
      setClanTag('');
      setClanDesc('');
      setTimeout(() => {
        setActiveTab('MY_CLAN');
      }, 1200);
    } else {
      setFormFeedback({ type: 'error', text: res.message });
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !myClan) return;

    sendClanMessage(myClan.id, chatInput.trim(), user);
    setChatInput('');
  };

  const handleEnlist = (clanId: string) => {
    const res = joinClan(clanId, user);
    if (res.success) {
      setActiveTab('MY_CLAN');
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Top Header Deck & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-primary/20 text-primary border border-primary/30 uppercase flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Guild & Clan Headquarters
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Clan Command Center</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Found your alliance, wage bracket conquests, and climb the guild leaderboards.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 p-1 rounded-xl">
            {myClan && (
              <button
                onClick={() => setActiveTab('MY_CLAN')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'MY_CLAN' ? 'bg-primary text-black shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                My Clan [{myClan.tag}]
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('FOUND_CLAN')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'FOUND_CLAN' ? 'bg-primary text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Found Clan
            </button>

            <button
              onClick={() => setActiveTab('EXPLORE_CLANS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'EXPLORE_CLANS' ? 'bg-primary text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Explore Public Clans
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: MY CLAN (Active Clan Command Headquarters)
        ========================================================================= */}
        {activeTab === 'MY_CLAN' && myClan && (
          <div className="space-y-8">
            
            {/* Clan Banner Card */}
            <Card level={2} className="p-6 md:p-8 border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-600/30 border-2 border-primary/50 flex items-center justify-center text-4xl shadow-xl shadow-primary/20 flex-shrink-0">
                    {myClan.emblem}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                        {myClan.name} <span className="text-primary font-mono font-bold">[{myClan.tag}]</span>
                      </h2>
                      {isLeader ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Founder & Commander
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Alliance Member
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-on-surface-variant max-w-xl mt-1.5 leading-relaxed">
                      {myClan.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-white/60 mt-2 font-medium">
                      <span>Level {myClan.level}</span>
                      <span>•</span>
                      <span>{myClan.members.length} Active Warriors</span>
                      <span>•</span>
                      <span>Founded by {myClan.founderName}</span>
                    </div>
                  </div>
                </div>

                {/* Right Trophy Badge & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-3 bg-[#050505]/70 border border-white/10 px-5 py-3 rounded-2xl shadow-lg w-full sm:w-auto justify-between sm:justify-start">
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Clan Rating</span>
                      <span className="text-xl font-black text-amber-400">{myClan.trophies} Trophies</span>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                  </div>

                  {isLeader ? (
                    <Button 
                      variant="glass" 
                      onClick={() => setShowDisbandModal(true)}
                      className="py-2.5 px-4 text-xs border border-error/30 text-error hover:bg-error/20 cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Disband Clan
                    </Button>
                  ) : (
                    <Button 
                      variant="glass" 
                      onClick={() => setShowLeaveModal(true)}
                      className="py-2.5 px-4 text-xs border border-white/10 text-white hover:text-error hover:border-error/30 cursor-pointer whitespace-nowrap"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" /> Leave Clan
                    </Button>
                  )}
                </div>

              </div>
            </Card>

            {/* Main Operational Columns: Chat & Roster */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (8 cols): Clan Comms Live Channel */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <Card level={2} className="p-6 border border-white/10 bg-black/40 backdrop-blur-md flex flex-col min-h-[460px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" /> Alliance Comms Channel
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Encrypted Squad Stream
                    </span>
                  </div>

                  {/* Messages Window */}
                  <div className="flex-grow bg-[#050505]/60 border border-white/5 p-4 rounded-2xl max-h-[320px] overflow-y-auto space-y-3 scrollbar-thin">
                    {messages.length === 0 ? (
                      <div className="text-center py-20 text-xs text-on-surface-variant">
                        No alliance messages yet. Type below to strategize with clan members!
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="text-xs leading-relaxed">
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black mr-2 bg-white/10 text-primary border border-white/5 uppercase">
                            {msg.role}
                          </span>
                          <span className={`font-bold mr-1.5 ${msg.sender === (user.displayName || user.username) ? 'text-cyan-300' : 'text-white'}`}>
                            {msg.sender}:
                          </span>
                          <span className="text-on-surface">{msg.content}</span>
                          <span className="text-[9px] text-white/30 ml-2 font-mono">{msg.time}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Send Input */}
                  <form onSubmit={handleSendChat} className="mt-4 flex gap-2.5">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Send tactical dispatch to clan members..."
                      className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                      required
                    />
                    <Button type="submit" variant="neon" className="px-6 py-3 font-bold text-xs cursor-pointer">
                      Send <Send className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Right Column (4 cols): Active Roster & Events */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Clan Roster Card */}
                <Card level={2} className="p-6 border border-white/10 bg-black/40 backdrop-blur-md space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" /> Active Roster ({myClan.members.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {myClan.members.map((member) => (
                      <div key={member.id} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={member.avatarUrl} alt={member.name} className="w-7 h-7 rounded-lg bg-black object-cover" />
                          <div>
                            <span className="font-bold text-white block leading-none">{member.name}</span>
                            <span className="text-[9px] text-on-surface-variant">{member.role}</span>
                          </div>
                        </div>

                        <span className={`w-2 h-2 rounded-full ${member.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-primary'}`} />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Events Card */}
                <Card level={2} className="p-6 border border-white/10 bg-black/40 backdrop-blur-md space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                    <Calendar className="w-4 h-4 text-amber-400" /> Weekly Guild Events
                  </h3>

                  <div className="space-y-3 text-xs text-on-surface-variant">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">Arena Conquest League</span>
                        <span className="text-[10px] text-primary">Reward: +500 Coins</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400">2 Days Left</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block">Clan Co-op Raid</span>
                        <span className="text-[10px] text-emerald-400">Reward: +250 XP</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/60">Tonight</span>
                    </div>
                  </div>
                </Card>

              </div>

            </div>

          </div>
        )}

        {/* If user selected MY_CLAN but doesn't have one yet, redirect to FOUND_CLAN */}
        {activeTab === 'MY_CLAN' && !myClan && (
          <Card level={2} className="p-12 text-center max-w-xl mx-auto space-y-4 border border-white/10 bg-black/40 backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-lg shadow-primary/20">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">You Are Not Enlisted In Any Clan</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Found your own sovereign guild with custom tag and emblem, or join an established alliance to conquer the leaderboards.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="neon" onClick={() => setActiveTab('FOUND_CLAN')} className="text-xs py-2.5 px-6 font-bold cursor-pointer">
                FOUND A NEW CLAN →
              </Button>
              <Button variant="glass" onClick={() => setActiveTab('EXPLORE_CLANS')} className="text-xs py-2.5 px-6 font-bold cursor-pointer">
                EXPLORE PUBLIC CLANS
              </Button>
            </div>
          </Card>
        )}

        {/* =========================================================================
            VIEW 2: FOUND YOUR OWN CLAN (With Verification Criteria)
        ========================================================================= */}
        {activeTab === 'FOUND_CLAN' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (5 cols): Criteria Check Matrix */}
            <div className="lg:col-span-5 space-y-6">
              <Card level={2} className="p-6 md:p-8 border border-white/10 bg-black/40 backdrop-blur-md space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Founding Requirements
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Clan Registration Criteria</h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Game World requires commanders to meet competitive benchmarks before registering an official guild charter.
                  </p>
                </div>

                {/* Real-time Criteria Verification List */}
                <div className="space-y-4">
                  {/* Criterion 1: Level */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    meetsLevel ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/60'
                  }`}>
                    <div className="flex items-center gap-3">
                      {meetsLevel ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-white/30" />}
                      <div>
                        <h4 className="text-xs font-bold text-white">Pilot Combat Level {CLAN_CREATION_CRITERIA.MIN_LEVEL}+</h4>
                        <p className="text-[10px] text-on-surface-variant">Your Level: <strong className="text-white">Level {user.level}</strong></p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${meetsLevel ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                      {meetsLevel ? 'SATISFIED' : 'LOCKED'}
                    </span>
                  </div>

                  {/* Criterion 2: Coin Treasury Fee */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    meetsCoins ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/60'
                  }`}>
                    <div className="flex items-center gap-3">
                      {meetsCoins ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-white/30" />}
                      <div>
                        <h4 className="text-xs font-bold text-white">Treasury Fee: {CLAN_CREATION_CRITERIA.COIN_COST} Coins</h4>
                        <p className="text-[10px] text-on-surface-variant">Your Balance: <strong className="text-yellow-400">{user.coins} Coins</strong></p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${meetsCoins ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                      {meetsCoins ? 'AVAILABLE' : 'INSUFFICIENT'}
                    </span>
                  </div>

                  {/* Criterion 3: Rank ELO */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    meetsRank ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/60'
                  }`}>
                    <div className="flex items-center gap-3">
                      {meetsRank ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-white/30" />}
                      <div>
                        <h4 className="text-xs font-bold text-white">Minimum Rank: {CLAN_CREATION_CRITERIA.MIN_RANK}+ ELO</h4>
                        <p className="text-[10px] text-on-surface-variant">Your Score: <strong className="text-amber-400">{user.stats.rank} ELO</strong></p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${meetsRank ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                      {meetsRank ? 'QUALIFIED' : 'UNRANKED'}
                    </span>
                  </div>
                </div>

                {/* Guidance if locked */}
                {!allCriteriaMet && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                    <p className="text-xs text-white leading-relaxed">
                      💡 <strong>Need more levels or coins?</strong> Play matches in the Game Library to level up and earn coin match rewards!
                    </p>
                    <Button
                      variant="neon"
                      onClick={() => navigate('/library')}
                      className="w-full text-xs py-2.5 font-bold cursor-pointer"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 mr-1" /> PLAY GAMES TO EARN REWARDS
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column (7 cols): Clan Founding Charter Form */}
            <div className="lg:col-span-7 space-y-6">
              <Card level={2} className="p-6 md:p-8 border border-white/10 bg-black/40 backdrop-blur-md space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                    Alliance Charter Registration
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Register your guild name, battle tag, and emblem.
                  </p>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-5">
                  
                  {/* Emblem Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                      Choose Clan Emblem
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {EMBLEM_OPTIONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setSelectedEmblem(em)}
                          className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                            selectedEmblem === em 
                              ? 'bg-primary/20 border-primary shadow-lg shadow-primary/30 scale-110' 
                              : 'bg-white/5 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Clan Name (2 cols) */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                        Clan Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={clanName}
                        onChange={(e) => setClanName(e.target.value)}
                        placeholder="e.g. Apex Predators"
                        maxLength={20}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                        required
                      />
                    </div>

                    {/* Clan Tag (1 col) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                        Tag (2-5 letters) <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={clanTag}
                        onChange={(e) => setClanTag(e.target.value.toUpperCase())}
                        placeholder="APX"
                        maxLength={5}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20 font-mono font-bold uppercase"
                        required
                      />
                    </div>
                  </div>

                  {/* Motto / Description */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                      Alliance Battle Motto & Focus
                    </label>
                    <textarea
                      value={clanDesc}
                      onChange={(e) => setClanDesc(e.target.value)}
                      rows={3}
                      maxLength={120}
                      placeholder="Describe your clan strategy, tournament goals, and playstyle..."
                      className="w-full bg-[#050505] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-primary transition-all resize-none placeholder-white/20"
                    />
                  </div>

                  {/* Feedback Toast */}
                  {formFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      formFeedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {formFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{formFeedback.text}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="neon"
                      disabled={!allCriteriaMet}
                      className={`w-full py-3.5 text-xs font-bold tracking-wider cursor-pointer ${
                        !allCriteriaMet ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      ESTABLISH CLAN & INVEST 150 COINS →
                    </Button>
                  </div>

                </form>
              </Card>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 3: EXPLORE PUBLIC CLANS
        ========================================================================= */}
        {activeTab === 'EXPLORE_CLANS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clans.map((clan) => {
                const isMemberOfThis = clan.id === myClanId;
                return (
                  <Card key={clan.id} level={2} className="p-6 border border-white/10 bg-black/40 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                          {clan.emblem}
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono">
                          [{clan.tag}]
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mt-3">{clan.name}</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                        {clan.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-white/70 mt-4 border-t border-white/5 pt-3">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Trophy className="w-3.5 h-3.5" /> {clan.trophies}
                        </div>
                        <div>
                          <span>Level {clan.level}</span>
                        </div>
                        <div>
                          <span>{clan.members.length} Warriors</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {isMemberOfThis ? (
                        <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          ✓ ACTIVE ALLIANCE
                        </div>
                      ) : (
                        <Button
                          variant="neon"
                          onClick={() => handleEnlist(clan.id)}
                          className="w-full py-2.5 text-xs font-bold tracking-wider cursor-pointer"
                        >
                          ENLIST IN CLAN →
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showLeaveModal && myClan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#0a0f1d] border border-white/15 p-6 shadow-2xl space-y-4 text-white"
            >
              <h4 className="text-sm font-bold text-white">Leave Alliance?</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Are you sure you want to resign your position from <strong className="text-white">[{myClan.tag}] {myClan.name}</strong>?
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="glass" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 text-xs">
                  Cancel
                </Button>
                <Button 
                  variant="neon" 
                  onClick={() => {
                    leaveClan(myClan.id, user.id);
                    setShowLeaveModal(false);
                  }}
                  className="px-4 py-2 text-xs bg-error hover:bg-red-500 border-0 text-white font-bold"
                >
                  Confirm Leave
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showDisbandModal && myClan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#0a0f1d] border border-white/15 p-6 shadow-2xl space-y-4 text-white"
            >
              <h4 className="text-sm font-bold text-white text-error">Disband Entire Clan?</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                As founder, disbanding will delete <strong className="text-white">[{myClan.tag}] {myClan.name}</strong> charter permanently and discharge all members.
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="glass" onClick={() => setShowDisbandModal(false)} className="px-4 py-2 text-xs">
                  Cancel
                </Button>
                <Button 
                  variant="neon" 
                  onClick={() => {
                    disbandClan(myClan.id);
                    setShowDisbandModal(false);
                  }}
                  className="px-4 py-2 text-xs bg-error hover:bg-red-500 border-0 text-white font-bold"
                >
                  Confirm Disband
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
