import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { Users, Trophy, MessageSquare, Send, Calendar } from 'lucide-react';
import { useSocialStore } from '../store/useSocialStore';
import { motion } from 'framer-motion';

const CLAN_MEMBERS = [
  { name: 'Commander_Nexus', rank: 'Leader', status: 'ONLINE' },
  { name: 'Neon_Specter', rank: 'Officer', status: 'ONLINE' },
  { name: 'Valkyrie_Protocol', rank: 'Officer', status: 'IN_MATCH' },
  { name: 'Astro_Boy', rank: 'Recruit', status: 'OFFLINE' }
];

export const ClanHub: React.FC = () => {
  const { addNotification } = useSocialStore();
  const [chatLogs, setChatLogs] = useState([
    { sender: 'Neon_Specter', content: 'Weekly MOBA signups close in 2 hours!', time: '11:40 PM' },
    { sender: 'Valkyrie_Protocol', content: 'Im ready to queue when you are.', time: '11:42 PM' }
  ]);
  const [input, setInput] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setChatLogs(prev => [...prev, {
      sender: 'Commander_Nexus',
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    addNotification('ACHIEVEMENT', `Sent message in Clan Hub chat room`);
    setInput('');
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title Banner */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-surface-container-low border border-white/5 p-6 rounded-2xl">
          <div className="space-y-2">
            <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] px-3.5 py-0.5 rounded-full uppercase font-bold tracking-widest">
              Clan Level 15
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-headline-sm">Nexus Legions [NX]</h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Global division commanding competitive MOBA ladders and tactical brackets.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#050505]/60 border border-white/10 px-6 py-4 rounded-xl">
            <div>
              <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Clan ELO</div>
              <div className="text-2xl font-bold text-white font-headline-sm mt-0.5">2,850 Trophies</div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          
          {/* Left Column: Clan Chat */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card level={2} className="p-6 border border-white/5 flex flex-col min-h-[400px]">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Clan Comms Channel
              </h3>

              <div className="flex-grow bg-[#050505]/40 border border-white/5 p-4 rounded-xl max-h-64 overflow-y-auto space-y-3">
                {chatLogs.map((msg, idx) => (
                  <div key={idx} className="text-xs leading-normal">
                    <span className={`font-bold ${msg.sender === 'Commander_Nexus' ? 'text-primary' : 'text-secondary'} mr-1.5`}>
                      {msg.sender}:
                    </span>
                    <span className="text-on-surface">{msg.content}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type message to alliance members..."
                  className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                  required
                />
                <Button type="submit" variant="neon" className="px-5 py-3">
                  Send <Send className="w-4 h-4" />
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Active roster */}
          <div className="space-y-6">
            <Card level={2} className="p-6 border border-white/5 space-y-6">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold">Clan Roster</h3>
              
              <div className="space-y-4">
                {CLAN_MEMBERS.map((member) => (
                  <div key={member.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${member.status === 'ONLINE' ? 'bg-green-400' : member.status === 'IN_MATCH' ? 'bg-primary' : 'bg-on-surface-variant'}`} />
                      <span className="font-bold text-white">{member.name}</span>
                    </div>
                    <span className="text-on-surface-variant">{member.rank}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card level={2} className="p-6 border border-white/5 space-y-4">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" /> Active Clan Events
              </h3>
              <div className="space-y-3.5 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Weekly Brawl League</span>
                  <span className="text-primary font-bold">2 days left</span>
                </div>
                <div className="flex justify-between">
                  <span>Clan Raid Session</span>
                  <span className="text-white font-bold">Tonight</span>
                </div>
              </div>
            </Card>
          </div>

        </div>

      </main>
    </div>
  );
};
