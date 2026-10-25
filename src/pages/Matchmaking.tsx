import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchmakeStore } from '../store/useMatchmakeStore';
import { useAuthStore } from '../store/useAuthStore';
import { ThreeLobby } from '../components/ThreeLobby';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Clock, Globe, Shield, RefreshCw } from 'lucide-react';

export const Matchmaking: React.FC = () => {
  const navigate = useNavigate();
  const { user, addXP, addCoins } = useAuthStore();
  const {
    gameId,
    gameName,
    queueStatus,
    elapsedSeconds,
    region,
    teamMembers,
    matchInfo,
    cancelQueue,
    tickQueue,
    acceptMatch,
    declineMatch,
    completeMatch
  } = useMatchmakeStore();

  // Active queue timer tick hook
  useEffect(() => {
    let interval: number;
    if (queueStatus === 'QUEUING') {
      interval = window.setInterval(() => {
        tickQueue();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [queueStatus, tickQueue]);

  const handleCancel = () => {
    cancelQueue();
    navigate('/dashboard');
  };

  const handleComplete = () => {
    // Reward player upon completing mock game match
    addXP(40);
    addCoins(80);
    completeMatch();
    navigate('/dashboard');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="relative min-h-screen pt-20 flex items-center justify-center bg-[#050505] overflow-hidden">
      
      {/* 3D concentric portal rings & floating dust particles */}
      {queueStatus !== 'PLAYING' && (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <ThreeLobby className="w-full h-full opacity-60" />
        </div>
      )}

      {/* Interface overlay */}
      <div className="relative z-10 max-w-5xl w-full px-margin-desktop text-center">
        <AnimatePresence mode="wait">
          
          {/* QUEUING SCREEN */}
          {queueStatus === 'QUEUING' && (
            <motion.div
              key="queuing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h1 className="text-display-lg-mobile md:text-headline-xl font-headline-xl text-white font-bold uppercase tracking-tight">
                  Searching for Match...
                </h1>
                <p className="text-xs text-on-surface-variant flex items-center justify-center gap-1.5 font-bold uppercase tracking-widest text-primary">
                  <Globe className="w-4 h-4 text-primary" /> {region}
                </p>
                <div className="text-xs text-on-surface-variant">Selected Title: <span className="text-white font-bold">{gameName}</span></div>
              </div>

              {/* Central Clock */}
              <div className="flex justify-center items-center">
                <div className="w-44 h-44 rounded-full border border-primary/20 backdrop-blur-xl bg-primary/5 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(77,142,255,0.15)]">
                  <Clock className="w-6 h-6 text-primary animate-pulse mb-1.5" />
                  <span className="text-4xl font-bold font-headline-sm text-white tracking-wide">{formatTimer(elapsedSeconds)}</span>
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mt-1.5">Elapsed Time</span>
                </div>
              </div>

              {/* Teammates party preview */}
              <div className="flex justify-center gap-4 max-w-sm mx-auto">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex flex-col items-center bg-[#050505]/60 border border-white/5 p-3 rounded-xl w-24">
                    <img src={member.avatarUrl} alt={member.username} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-[10px] text-white font-bold mt-2 truncate w-full">{member.username}</span>
                    <span className="text-[8px] text-on-surface-variant mt-1">Rank {member.rank}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button variant="glass" onClick={handleCancel} className="px-8 border border-white/10 hover:border-error/40 hover:text-error transition-all">
                  Cancel Search <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* MATCH FOUND DIALOG */}
          {queueStatus === 'MATCH_FOUND' && matchInfo && (
            <motion.div
              key="match_found"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-xl mx-auto"
            >
              <Card level={3} className="p-8 border border-primary/30 shadow-[0_0_50px_rgba(77,142,255,0.25)] space-y-6">
                <div className="space-y-2">
                  <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] px-3.5 py-1 rounded-full uppercase font-bold tracking-widest">Target Located</span>
                  <h2 className="text-headline-xl font-headline-xl text-white font-bold uppercase tracking-tight">Combat Match Found!</h2>
                  <p className="text-xs text-on-surface-variant">Confirm connection before the countdown expires.</p>
                </div>

                <div className="grid grid-cols-5 items-center justify-center gap-4 py-4">
                  {/* Team 1 */}
                  <div className="col-span-2 text-right space-y-2">
                    <div className="text-xs font-bold text-white leading-none">Your Squad</div>
                    <div className="text-[10px] text-on-surface-variant">Avg ELO: 1785</div>
                  </div>
                  
                  {/* Central VS */}
                  <div className="font-headline-sm text-headline-sm font-black text-primary animate-pulse text-center">VS</div>

                  {/* Team 2 */}
                  <div className="col-span-2 text-left space-y-2">
                    <div className="text-xs font-bold text-white leading-none">Opponents</div>
                    <div className="text-[10px] text-on-surface-variant">Avg ELO: 1800</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="neon" onClick={acceptMatch} className="flex-1 py-3.5 text-sm font-bold shadow-[0_0_20px_rgba(77,142,255,0.4)]">
                    Accept Match
                  </Button>
                  <Button variant="glass" onClick={declineMatch} className="flex-1 py-3.5 text-sm border border-white/10 hover:border-error/30 hover:text-error">
                    Decline
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ACCEPTED LOADING */}
          {queueStatus === 'ACCEPTED' && (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <RefreshCw className="w-16 h-16 text-primary animate-spin mx-auto mb-4 filter drop-shadow-[0_0_15px_rgba(77,142,255,0.4)]" />
              <h2 className="text-headline-lg font-headline-lg text-white font-bold uppercase tracking-wider">Establishing Server Connection</h2>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Loading game world segments, synchronizing client physics pipelines, and loading textures. Standby...
              </p>
            </motion.div>
          )}

          {/* PLAYING - SIMULATED ARENA SCREEN */}
          {queueStatus === 'PLAYING' && matchInfo && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl w-full mx-auto"
            >
              <Card level={2} className="p-8 border border-white/5 space-y-8 relative">
                {/* Visual game environment container */}
                <div className="relative h-64 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${matchInfo.gameId === 'chess_masters' ? 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800' : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'})` }} />
                  <div className="absolute w-[200px] h-[200px] bg-primary/20 blur-[50px] animate-pulse" />
                  
                  {/* Holographic interface details */}
                  <div className="relative text-center z-10 space-y-3 p-4">
                    <span className="bg-green-400 text-black text-[9px] px-3.5 py-0.5 rounded-full uppercase font-extrabold tracking-widest animate-pulse">Session Active</span>
                    <h3 className="text-2xl font-bold font-headline-sm text-white tracking-wide">{matchInfo.gameName} Match</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
                      Authoritative game core computing ticks. Coordinates synced. Low-latency UDP connections verified.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div className="text-left text-xs font-semibold text-on-surface-variant">
                      Connection status: <span className="text-green-400 font-bold">14ms latency (RTT)</span>
                    </div>
                  </div>
                  
                  <Button variant="neon" onClick={handleComplete} className="px-8 shadow-[0_0_20px_rgba(77,142,255,0.3)]">
                    Finish Simulation & Claim Rewards
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
