import React, { useState, useRef, useEffect } from 'react';
import { useSocialStore, Friend } from '../store/useSocialStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShaderBackground } from '../components/ShaderBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Send, 
  Circle, 
  Gamepad2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Flame,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const FriendsHub: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { friends, chats, sendDirectMessage, addFriend, removeFriend } = useSocialStore();
  
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [newFriendName, setNewFriendName] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Friend removal confirmation modal state
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Default to first friend if selected friend doesn't exist
  const selectedFriend = friends.find(f => f.id === selectedFriendId) || friends[0];
  const activeChats = selectedFriend ? chats[selectedFriend.id] || [] : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChats]);

  // Clear feedback after 4 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedFriend) return;
    
    sendDirectMessage(selectedFriend.id, messageInput.trim(), user?.displayName || user?.username || 'Commander');
    setMessageInput('');
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addFriend(newFriendName, user?.username);
    if (result.success) {
      setFeedback({ type: 'success', text: result.message });
      setNewFriendName('');
      // Auto select the newly added friend
      const latest = useSocialStore.getState().friends;
      if (latest.length > 0) {
        setSelectedFriendId(latest[latest.length - 1].id);
      }
    } else {
      setFeedback({ type: 'error', text: result.message });
    }
  };

  const handleConfirmRemove = () => {
    if (!friendToRemove) return;
    removeFriend(friendToRemove.id);
    setFeedback({ type: 'success', text: `Removed ${friendToRemove.username} from squad roster.` });
    
    // If the removed friend was selected, pick the remaining friend
    const remaining = friends.filter(f => f.id !== friendToRemove.id);
    setSelectedFriendId(remaining.length > 0 ? remaining[0].id : '');
    setFriendToRemove(null);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background flex flex-col">
      <ShaderBackground type="core" />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (4 cols): Recruitment & Roster Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Add Friend Card */}
          <Card level={2} className="p-4 border border-white/10 bg-black/40 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-primary" /> Recruit Comrade
              </h4>
              <span className="text-[10px] text-on-surface-variant font-semibold">
                {friends.length} Comrades
              </span>
            </div>

            <form onSubmit={handleAddFriendSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  placeholder="Enter friend's callsign..."
                  maxLength={24}
                  className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                  required
                />
                <Button type="submit" variant="neon" className="px-4 py-2 text-xs font-bold cursor-pointer">
                  Add
                </Button>
              </div>

              {/* Dynamic Inline Feedback */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                    feedback.type === 'success' 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </motion.div>
              )}
            </form>
          </Card>

          {/* Friends List Roster */}
          <Card level={2} className="p-4 border border-white/10 bg-black/40 backdrop-blur-md flex-grow flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Tactical Squad Roster</h3>
              <span className="text-[10px] text-white/40">Select to message</span>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
              {friends.length === 0 ? (
                <div className="text-center py-16 px-4 text-on-surface-variant text-xs space-y-3 border border-dashed border-white/10 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/40">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white/80">No Friends in Roster</p>
                    <p className="text-[10px] text-white/40 mt-1">
                      Type any pilot's callsign above to add them to your squad.
                    </p>
                  </div>
                </div>
              ) : (
                friends.map((friend) => {
                  const isSelected = selectedFriend && friend.id === selectedFriend.id;
                  return (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriendId(friend.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${
                        isSelected 
                          ? 'bg-primary/15 border-primary/40 shadow-md shadow-primary/10' 
                          : 'bg-[#050505]/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={friend.avatarUrl} 
                            alt={friend.username} 
                            className="w-9 h-9 rounded-xl border border-white/10 object-cover bg-black" 
                          />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                            friend.status === 'ONLINE' ? 'bg-emerald-400' : friend.status === 'IN_MATCH' ? 'bg-primary' : 'bg-on-surface-variant'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{friend.username}</span>
                          </div>
                          <div className="text-[10px] text-on-surface-variant truncate mt-0.5">
                            {friend.status === 'IN_MATCH' ? (
                              <span className="text-primary font-medium">In Match: {friend.game}</span>
                            ) : (
                              <span className="text-white/60">{friend.rank} ELO • Ready</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove Friend Action Icon Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFriendToRemove(friend);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-error/20 text-white/40 hover:text-error transition-all cursor-pointer"
                        title={`Remove ${friend.username} from squad`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

        </div>

        {/* Center/Right (8 cols): Interactive Comms Deck */}
        <div className="lg:col-span-8 flex flex-col">
          {selectedFriend ? (
            <Card level={2} className="flex-grow border border-white/10 bg-black/40 backdrop-blur-md flex flex-col min-h-[500px]">
              
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505]/50">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img 
                      src={selectedFriend.avatarUrl} 
                      alt={selectedFriend.username} 
                      className="w-11 h-11 rounded-xl border-2 border-primary/40 object-cover bg-black" 
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      selectedFriend.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-primary'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-white">{selectedFriend.username}</h3>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-white/10 text-amber-400 border border-white/10">
                        {selectedFriend.rank} ELO
                      </span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5 mt-0.5 font-medium">
                      <Circle className={`w-2 h-2 ${selectedFriend.status === 'ONLINE' ? 'fill-emerald-400 text-emerald-400' : 'fill-primary text-primary'}`} />
                      {selectedFriend.status === 'ONLINE' ? 'Station Ready • Available for Co-op' : `Playing: ${selectedFriend.game}`}
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons: Play Together + Remove Comrade */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="glass"
                    onClick={() => navigate('/library')}
                    className="py-1.5 px-3 text-xs border border-white/10 hover:border-primary text-white flex items-center gap-1.5 cursor-pointer"
                    title="Launch Game to Play Together"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-primary" /> Play Together
                  </Button>

                  <button
                    onClick={() => setFriendToRemove(selectedFriend)}
                    className="py-1.5 px-3 rounded-xl bg-error/10 hover:bg-error/20 border border-error/20 text-error text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Remove Friend from Squad"
                  >
                    <UserMinus className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[380px] lg:max-h-[460px] scrollbar-thin">
                {activeChats.length === 0 ? (
                  <div className="text-center py-20 text-xs text-on-surface-variant space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-white/20" />
                    <p className="font-bold text-white/80">Encrypted Squad Channel Initialized</p>
                    <p className="text-[10px] text-white/40">Say hello to {selectedFriend.username} and invite them to a multiplayer match.</p>
                  </div>
                ) : (
                  activeChats.map((msg) => {
                    const isSelf = msg.sender === (user?.displayName || user?.username || 'Commander');
                    return (
                      <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed border ${
                          isSelf 
                            ? 'bg-primary/20 border-primary/30 text-white rounded-tr-none' 
                            : 'bg-white/5 border-white/10 text-on-surface rounded-tl-none'
                        }`}>
                          <p>{msg.content}</p>
                          <span className="text-[8px] text-on-surface-variant/60 mt-1 block text-right font-mono">
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
              <form onSubmit={handleSendMessage} className="p-4 bg-[#050505]/60 border-t border-white/10 flex gap-2.5">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Send tactical dispatch to ${selectedFriend.username}...`}
                  className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-all placeholder-white/20"
                  required
                />
                <Button type="submit" variant="neon" className="px-6 py-3 font-bold text-xs cursor-pointer">
                  Send <Send className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </form>

            </Card>
          ) : (
            <Card level={2} className="flex-grow border border-white/10 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center min-h-[500px] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                <UserPlus className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-white">Squad Communications Ready</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  You currently have no comrades selected. Recruit friends by typing their gamer callsign in the panel on the left, or play multiplayer games to find new teammates!
                </p>
                <div className="pt-2">
                  <Button variant="neon" onClick={() => navigate('/library')} className="text-xs py-2.5 px-6 font-bold cursor-pointer">
                    BROWSE MULTIPLAYER GAMES →
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

      </main>

      {/* Confirmation Modal for Removing Friend */}
      <AnimatePresence>
        {friendToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#0a0f1d] border border-white/15 p-6 shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-error/20 border border-error/30 flex items-center justify-center text-error flex-shrink-0">
                  <UserMinus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Remove Comrade?</h4>
                  <p className="text-xs text-on-surface-variant">
                    Remove <span className="text-white font-bold">{friendToRemove.username}</span> from your roster?
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/60 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                You will no longer receive match invitations or direct messages from this player until you re-add them.
              </p>

              <div className="flex gap-2.5 justify-end pt-2">
                <Button 
                  variant="glass" 
                  onClick={() => setFriendToRemove(null)} 
                  className="px-4 py-2 text-xs border border-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  variant="neon" 
                  onClick={handleConfirmRemove} 
                  className="px-4 py-2 text-xs bg-error hover:bg-red-500 border-0 text-white font-bold"
                >
                  Confirm Remove
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
