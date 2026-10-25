import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { Play, Radio, Users, Send, Eye } from 'lucide-react';

interface ChatMsg {
  id: string;
  sender: string;
  content: string;
  time: string;
}

const MOCK_NAMES = ['Cyber_Stalker', 'NeonAlpha', 'PixelGlitch', 'ViperCommander', 'VoidWalker', 'ProGamerX'];
const MOCK_PHRASES = [
  'What a play!',
  'Insane micro coordination here!',
  'gg WP',
  'Is this tournament final ELO rank capped?',
  'Nexus Legions is playing out of their minds!',
  'Wait, did you see that drone defense?',
  'insane game'
];

export const LiveBroadcast: React.FC = () => {
  const [chatLogs, setChatLogs] = useState<ChatMsg[]>([
    { id: '1', sender: 'VanguardInitiate', content: 'Stream established! Lets go!', time: '11:50 PM' },
    { id: '2', sender: 'NeonAlpha', content: 'Who is favored here?', time: '11:51 PM' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const chatLogsEndRef = useRef<HTMLDivElement | null>(null);

  // Auto generate mock chat logs to simulate dynamic audience
  useEffect(() => {
    const timer = setInterval(() => {
      const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const randomPhrase = MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)];
      const newMsg: ChatMsg = {
        id: 'msg_' + Math.random().toString(),
        sender: randomName,
        content: randomPhrase,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatLogs(prev => [...prev, newMsg]);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: ChatMsg = {
      id: 'msg_user_' + Math.random().toString(),
      sender: 'Commander_Nexus',
      content: inputVal.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLogs(prev => [...prev, userMsg]);
    setInputVal('');
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background flex flex-col">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop w-full flex-grow grid grid-cols-1 lg:grid-cols-4 gap-gutter items-stretch">
        
        {/* Left Column: Stream Screen */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card level={2} className="flex-grow border border-white/5 flex flex-col min-h-[400px]">
            
            {/* Live Feed Container */}
            <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000')` }} />
              
              <div className="relative text-center z-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto animate-pulse">
                  <Radio className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold font-headline-sm text-white">Live Broadcast Stream</h2>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                  Cyber Nexus Open Finals: Nexus Legions vs. Void Stalkers. Feed synced.
                </p>
              </div>
            </div>

            {/* Video Controls / Info */}
            <div className="px-6 py-4 border-t border-white/5 bg-[#050505]/20 flex justify-between items-center text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-primary" /> 12,450 Spectators</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-secondary" /> Organized by Cyber League</span>
            </div>

          </Card>
        </div>

        {/* Right Column: Live Chat Feed */}
        <div className="lg:col-span-1 flex flex-col">
          <Card level={2} className="flex-grow border border-white/5 flex flex-col h-full min-h-[400px]">
            
            <div className="px-4 py-3.5 border-b border-white/5 bg-[#050505]/30">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-primary animate-pulse" /> Live Combat Feed
              </h3>
            </div>

            {/* Chats messages box */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 max-h-[300px] lg:max-h-[450px]">
              {chatLogs.map((msg) => (
                <div key={msg.id} className="text-xs leading-normal">
                  <span className={`font-bold ${msg.sender === 'Commander_Nexus' ? 'text-primary' : 'text-secondary'} mr-1.5`}>
                    {msg.sender}:
                  </span>
                  <span className="text-on-surface">{msg.content}</span>
                </div>
              ))}
              <div ref={chatLogsEndRef} />
            </div>

            {/* Send chat form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-[#050505]/20 flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type secure dispatch..."
                className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                required
              />
              <Button type="submit" variant="neon" className="p-2">
                <Send className="w-4 h-4" />
              </Button>
            </form>

          </Card>
        </div>

      </main>
    </div>
  );
};
