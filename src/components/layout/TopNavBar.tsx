import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocialStore } from '../../store/useSocialStore';
import {
  Search,
  Bell,
  LogOut,
  Shield,
  Award,
  Sparkles,
  User,
  LayoutDashboard,
  Users,
  Trophy,
  HelpCircle,
  Coins,
  Settings,
  Play,
  Activity,
  Gamepad2
} from 'lucide-react';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { notifications, unreadNotificationCount, markNotificationAsRead, clearNotifications } = useSocialStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeClass = (path: string) => {
    return location.pathname === path
      ? 'text-primary font-bold border-b-2 border-primary pb-1'
      : 'text-on-surface-variant hover:text-primary transition-colors duration-300';
  };

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/40 backdrop-blur-3xl border-b border-white/10 shadow-xl">
      <div className="flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto">
        
        {/* Brand Logo - Game World */}
        <Link to="/" className="flex items-center gap-2.5 group hover:scale-[1.02] active:scale-95 transition-all">
          <img 
            src="/assets/brand/game_world_emblem.png" 
            alt="Game World Logo" 
            className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(52,120,246,0.6)] group-hover:drop-shadow-[0_0_18px_rgba(128,87,232,0.8)] transition-all"
          />
          <div className="flex flex-col leading-[1.05]">
            <span className="font-black text-base tracking-[0.12em] text-white">GAME</span>
            <span className="font-black text-sm tracking-[0.16em] text-[#8057E8] drop-shadow-[0_0_10px_rgba(128,87,232,0.4)]">WORLD</span>
          </div>
        </Link>

        {/* Desktop Menu Routing */}
        <nav className="hidden lg:flex items-center gap-8 font-label-md text-label-md">
          <Link className={activeClass('/')} to="/">Home</Link>
          <Link className={activeClass('/library')} to="/library">Games</Link>
          <Link className={activeClass('/friends')} to="/friends">Community</Link>
          <Link className={activeClass('/tournaments')} to="/tournaments">Tournaments</Link>
          <Link className={activeClass('/marketplace')} to="/marketplace">Store</Link>
        </nav>

        {/* Actions & Profiles Deck */}
        <div className="flex items-center gap-6">
          
          {isAuthenticated && user ? (
            <>
              {/* Currency Counter */}
              <div className="flex items-center gap-2 bg-surface-container-low border border-white/10 px-3.5 py-1.5 rounded-xl">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-white">{user.coins}</span>
              </div>

              {/* Player Level & XP Indicator */}
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="text-xs text-on-surface-variant font-medium">
                  Level <span className="text-primary font-bold">{user.level}</span>
                </div>
                <div className="w-20 bg-surface-container-high h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${user.xp}%` }}
                  />
                </div>
              </div>

              {/* Dynamic Notification Bell Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative p-1 text-on-surface-variant hover:text-primary transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount() > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-on-error-container text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotificationCount()}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl p-4 shadow-2xl z-50 border border-white/10">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                      <h4 className="text-sm font-bold text-white font-headline-sm">Notifications</h4>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-xs text-primary hover:underline">
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2.5">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-on-surface-variant">
                          No notifications.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n.id)}
                            className={`p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all border ${n.isRead ? 'border-transparent opacity-60' : 'border-primary/20 bg-primary/5'}`}
                          >
                            <p className="text-xs text-on-surface leading-normal">{n.content}</p>
                            <span className="text-[10px] text-on-surface-variant mt-1 block">{n.createdAt}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar & Sub-console Dropdown Panel */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="w-9 h-9 rounded-full border border-white/20 overflow-hidden hover:border-primary active:scale-95 transition-all"
                >
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-64 glass-card rounded-2xl p-3 shadow-2xl z-50 border border-white/10">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <div className="text-sm font-bold text-white leading-none">{user.username}</div>
                      <div className="text-[10px] text-on-surface-variant mt-1">{user.email}</div>
                    </div>
                    
                    <ul className="space-y-1 text-xs">
                      <li>
                        <Link 
                          to="/profile" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                        >
                          <User className="w-4 h-4" /> Profile Details
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/dashboard" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Commander Deck
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/clan" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Users className="w-4 h-4" /> Clan Hub
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/battlepass" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Award className="w-4 h-4" /> Battle Pass
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/cloud" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Gamepad2 className="w-4 h-4" /> Cloud Play
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/live" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Play className="w-4 h-4" /> Esports Live
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/creator" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Sparkles className="w-4 h-4" /> Creator Studio
                        </Link>
                      </li>
                      <li className="pt-2 border-t border-white/10 mt-2">
                        <button 
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                            navigate('/auth');
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-error hover:bg-error-container/10 transition-all"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth" state={{ isSignUp: false }} className="text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all duration-200">
                Sign In
              </Link>
              <Link 
                to="/auth" 
                state={{ isSignUp: true }}
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:scale-105 hover:brightness-110 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
