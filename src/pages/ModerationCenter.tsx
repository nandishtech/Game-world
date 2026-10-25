import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { ShieldAlert, Check, AlertTriangle, ShieldX } from 'lucide-react';
import { useSocialStore } from '../store/useSocialStore';
import { motion } from 'framer-motion';

interface ReportTicket {
  id: string;
  reportedUser: string;
  reporter: string;
  reason: string;
  game: string;
  timestamp: string;
  status: 'PENDING' | 'RESOLVED';
}

const INITIAL_REPORTS: ReportTicket[] = [
  { id: 'rep_01', reportedUser: 'Toxic_Player_99', reporter: 'NeonAlpha', reason: 'Abusive voice communications', game: 'Battle Arena', timestamp: '12 mins ago', status: 'PENDING' },
  { id: 'rep_02', reportedUser: 'SpeedHackGamer', reporter: 'AntiCheat_Engine', reason: 'Unusual speed movement ticks (Physics intercept)', game: 'Velocity Racing', timestamp: '34 mins ago', status: 'PENDING' }
];

export const ModerationCenter: React.FC = () => {
  const { addNotification } = useSocialStore();
  const [reports, setReports] = useState<ReportTicket[]>(INITIAL_REPORTS);

  const handleResolveAction = (id: string, action: 'WARN' | 'BAN' | 'DISMISS') => {
    setReports(prev => prev.filter(r => r.id !== id));
    
    let contentMessage = '';
    if (action === 'WARN') contentMessage = `Moderator warning issued to reported target. Ticket ${id} closed.`;
    else if (action === 'BAN') contentMessage = `Account ban issued. IP logs quarantined. Ticket ${id} closed.`;
    else contentMessage = `Report ticket dismissed. Ticket ${id} closed.`;
    
    addNotification('ACHIEVEMENT', contentMessage);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-headline-xl font-headline-xl text-white font-bold">Moderation & Trust Center</h1>
          <p className="text-xs text-on-surface-variant mt-1.5">Review player report dispatches, check anti-cheat alerts, and deploy trust logs.</p>
        </div>

        {/* Console split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          
          {/* Main reports grid */}
          <div className="lg:col-span-2 space-y-6">
            <Card level={2} className="p-6 border border-white/5">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold mb-6">Pending Moderation Tickets</h3>

              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="text-center py-20 text-xs text-on-surface-variant">
                    No pending report dispatches. Platform is secure.
                  </div>
                ) : (
                  reports.map((r, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={r.id} 
                      className="bg-[#050505]/40 border border-white/5 p-5 rounded-xl space-y-4 hover:border-white/10 transition-all"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <div className="text-xs font-bold text-white">Reported: <span className="text-primary">{r.reportedUser}</span></div>
                          <p className="text-[10px] text-on-surface-variant mt-1">Reason: <span className="text-white">{r.reason}</span></p>
                        </div>
                        <span className="text-[9px] font-bold text-on-surface-variant">{r.timestamp}</span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-white/5 flex-wrap gap-2 text-[10px]">
                        <span className="text-on-surface-variant font-bold">Game: {r.game} • Reporter: {r.reporter}</span>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="glass" 
                            onClick={() => handleResolveAction(r.id, 'DISMISS')}
                            className="px-3 py-1.5 border-white/5 text-green-400 hover:bg-green-500/5 text-[9px]"
                          >
                            <Check className="w-3.5 h-3.5" /> Dismiss
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleResolveAction(r.id, 'WARN')}
                            className="px-3 py-1.5 text-yellow-400 hover:bg-yellow-500/5 text-[9px]"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Warn Player
                          </Button>
                          <Button 
                            variant="neon" 
                            onClick={() => handleResolveAction(r.id, 'BAN')}
                            className="px-3 py-1.5 text-error border-error-container/20 hover:bg-error-container/20 text-[9px]"
                          >
                            <ShieldX className="w-3.5 h-3.5" /> Ban Account
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column guidelines */}
          <Card level={2} className="p-6 border border-white/5 space-y-6">
            <h3 className="text-headline-sm font-headline-sm text-white font-bold">Policy Matrix</h3>
            
            <div className="space-y-4 text-xs text-on-surface-variant font-medium leading-relaxed">
              <div className="space-y-1">
                <div className="text-white font-bold">Anti-Cheat Auto Bans</div>
                <p>Speed hack and memory manipulation logs trigger hardware bans automatically upon 3 consecutive validation checks.</p>
              </div>
              <div className="space-y-1">
                <div className="text-white font-bold">Chat Conduct Warnings</div>
                <p>Abusive language triggers a 24-hour mute for first offenses, leading to account suspension for repeats.</p>
              </div>
            </div>
          </Card>

        </div>

      </main>
    </div>
  );
};
