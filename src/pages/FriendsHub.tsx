import React, { useState, useRef, useEffect } from 'react';
import { useSocialStore, Friend } from '../store/useSocialStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { motion } from 'framer-motion';
import { Search, Send, UserPlus, MessageSquare, Shield, Circle, User } from 'lucide-react';

export const FriendsHub: React.FC = () => {
  const { friends, chats, sendDirectMessage, addFriend } = useSocialStore();
  const [selectedFriendId, setSelectedFriendId] = useState<string>('friend_01');
  const [newFriendName, setNewFriendName] = useState('');
  const [messageInput, setMessageInput] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const selectedFriend = friends.find(f => f.id === selectedFriendId) || friends[0];
  const activeChats = selectedFriend ? chats[selectedFriend.id] || [] : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChats]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedFriend) return;
    
    sendDirectMessage(selectedFriend.id, messageInput.trim());
    setMessageInput('');
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    addFriend(newFriendName.trim());
    setNewFriendName('');
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background flex flex-col">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop w-full flex-grow grid grid-cols-1 lg:grid-cols-4 gap-gutter items-stretch">
        
        {/* Left Column: Friends List Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          
          {/* Add Friend Card */}
          <Card level={2} className="p-4 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-primary" /> Recruit Comrade
            </h4>
            <form onSubmit={handleAddFriendSubmit} className="flex gap-2">
              <input
                type="text"
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                placeholder="Enter username..."
                className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                required
              />
              <Button type="submit" variant="neon" className="px-3.5 py-2 text-xs">
                Add
              </Button>
            </form>
          </Card>

          {/* Friends List Roster */}
          <Card level={2} className="p-4 border border-white/5 flex-grow flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4">Tactical Roster</h3>
            
            <div className="space-y-2.5 overflow-y-auto max-h-[350px] lg:max-h-[500px]">
              {friends.map((friend) => {
                const isSelected = friend.id === selectedFriendId;
                return (
                  <div
                    key={friend.id}
                    onClick={() => setSelectedFriendId(friend.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-[#050505]/40 border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={friend.avatarUrl} alt={friend.username} className="w-8 h-8 rounded-full border border-white/10" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${friend.status === 'ONLINE' ? 'bg-green-400' : friend.status === 'IN_MATCH' ? 'bg-primary' : 'bg-on-surface-variant'}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{friend.username}</div>
                        <div className="text-[9px] text-on-surface-variant mt-1">
                          {friend.status === 'IN_MATCH' ? `Playing: ${friend.game}` : 'Available'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>

        {/* Center/Right: Chat Screen */}
        <div className="lg:col-span-3 flex flex-col">
          {selectedFriend ? (
            <Card level={2} className="flex-grow border border-white/5 flex flex-col min-h-[450px]">
              
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050505]/30">
                <div className="flex items-center gap-3">
                  <img src={selectedFriend.avatarUrl} alt={selectedFriend.username} className="w-9 h-9 rounded-full border border-white/10" />
                  <div>
                    <div className="text-sm font-bold text-white">{selectedFriend.username}</div>
                    <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5 mt-1 font-semibold">
                      <Circle className={`w-2 h-2 ${selectedFriend.status === 'ONLINE' ? 'fill-green-400 text-green-400' : 'fill-primary text-primary'}`} />
                      {selectedFriend.status === 'ONLINE' ? 'Lobby Ready' : `Active Battle: ${selectedFriend.game}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Message Box */}
              <div className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[300px] lg:max-h-[450px]">
                {activeChats.length === 0 ? (
                  <div className="text-center py-20 text-xs text-on-surface-variant">
                    No logs recorded. Type a secure dispatch below.
                  </div>
                ) : (
                  activeChats.map((msg) => {
                    const isSelf = msg.sender === 'Commander_Nexus';
                    return (
                      <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-normal border ${isSelf ? 'bg-primary/10 border-primary/20 text-white rounded-tr-none' : 'bg-surface-container-high/40 border-white/5 text-on-surface rounded-tl-none'}`}>
                          <p>{msg.content}</p>
                          <span className="text-[8px] text-on-surface-variant/60 mt-1.5 block text-right">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Entry input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#050505]/40 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Send direct transmission to ${selectedFriend.username}...`}
                  className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                  required
                />
                <Button type="submit" variant="neon" className="px-5 py-3">
                  Send <Send className="w-4 h-4" />
                </Button>
              </form>

            </Card>
          ) : (
            <Card level={2} className="flex-grow border border-white/5 flex items-center justify-center py-20">
              <div className="text-center space-y-2 text-on-surface-variant">
                <MessageSquare className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-xs font-semibold">Select a combat squad comrade to initialize chat lines.</p>
              </div>
            </Card>
          )}
        </div>

      </main>
    </div>
  );
};
