import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useSocialStore } from '../store/useSocialStore';
import { ShaderBackground } from '../components/ShaderBackground';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addNotification } = useSocialStore();

  const handleQuickPlay = () => {
    navigate('/library');
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-[#050505] flex pt-16">
      {/* WebGL Matrix Background */}
      <ShaderBackground type="universe" />

      {/* SideNavBar Panel */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 z-40 bg-surface-container-low/60 backdrop-blur-xl border-r border-white/5 shadow-2xl flex flex-col py-8 gap-4 px-4 hidden md:flex">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-primary/30 shadow-lg shadow-primary/10">
            <img 
              className="w-full h-full object-cover" 
              src={user.avatarUrl} 
              alt="Profile"
            />
          </div>
          <div>
            <h3 className="font-headline-sm text-sm font-bold text-primary">{user.username}</h3>
            <p className="font-label-sm text-[10px] text-on-surface-variant tracking-wider uppercase">Level {user.level} Elite</p>
          </div>
        </div>

        <nav className="flex-grow space-y-1">
          <Link className="bg-primary/10 text-primary border-r-4 border-primary flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200" to="/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
          <Link className="text-on-surface-variant hover:text-primary hover:bg-white/5 flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200" to="/profile">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link className="text-on-surface-variant hover:text-primary hover:bg-white/5 flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200" to="/tournaments">
            <span className="material-symbols-outlined">military_tech</span>
            <span className="font-label-md text-label-md">Tournaments</span>
          </Link>
          <Link className="text-on-surface-variant hover:text-primary hover:bg-white/5 flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200" to="/friends">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">Friends</span>
          </Link>
          <Link className="text-on-surface-variant hover:text-primary hover:bg-white/5 flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200" to="/library">
            <span className="material-symbols-outlined">history</span>
            <span className="font-label-md text-label-md">Games Library</span>
          </Link>
          <Link className="text-on-surface-variant hover:text-primary hover:bg-white/5 flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200" to="/developer">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Developer Portal</span>
          </Link>
        </nav>

        <div className="mt-auto space-y-1 border-t border-white/5 pt-4">
          <Link className="text-on-surface-variant hover:bg-white/5 flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200" to="/developer">
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="w-full text-error/80 hover:bg-error/10 flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow md:ml-64 p-margin-mobile md:p-margin-desktop bg-[#050505] z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Welcome Banner */}
          <section className="relative h-64 rounded-2xl overflow-hidden glass-card flex items-end p-8 border border-primary/20 shadow-2xl">
            <div className="absolute inset-0 z-0">
              <div 
                className="w-full h-full bg-cover bg-center opacity-40 mix-blend-screen" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCc8zBA0Rx2DwNQlcbCFaJaRvu6-03Yj4rkvGIK3GlRW7QB9p4GlVrcF1wgNm5G-HOCQBT7cymYWQrs9uqG4yKCOzzVBrp0XdJ8VbKmy4UFxpyNf2tilXWZ7Sg2KMDr2ePCLaesVB50rW_ukJcyKdeOYqwMYdm2fqeuVHFxIVxxbxuDSJ0KxTLkphogNTj0as9uWOiGPbnDZkfg_s8t6NRR712gB5nuGrRwKvCl11wluYhbYL6UOzuAHs59j_8P8HsukuEyyT_GGrs')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>
            
            <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
              <div>
                <h1 className="font-headline-xl font-bold text-headline-xl text-primary drop-shadow-[0_0_15px_rgba(173,198,255,0.4)]">
                  Welcome back, Commander
                </h1>
                <p className="font-body-md text-on-surface-variant mt-2 max-w-xl">
                  Your fleet is ready for the next mission. Sector 7 tournaments are live. Join the conquest today.
                </p>
              </div>
              <button 
                onClick={handleQuickPlay}
                className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(173,198,255,0.3)] flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-xl">play_arrow</span>
                QUICK PLAY
              </button>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest">XP PROGRESS</span>
                <span className="text-primary font-bold">LVL {user.level}</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-tertiary progress-pulse shadow-[0_0_10px_rgba(173,198,255,0.5)] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, user.xp % 100))}%` }}
                ></div>
              </div>
              <p className="text-right text-[10px] text-on-surface-variant mt-2">{user.xp % 100} / 100 XP to next level</p>
            </div>

            <div className="glass-card p-6 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center border border-secondary/30">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              </div>
              <div>
                <p className="text-on-surface-variant font-label-sm text-label-sm uppercase">Coins Balance</p>
                <h4 className="font-headline-sm text-headline-sm text-secondary">{user.coins} <span className="text-sm font-sans opacity-60">COINS</span></h4>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center border border-tertiary/30">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <div>
                <p className="text-on-surface-variant font-label-sm text-label-sm uppercase">Global Rank</p>
                <h4 className="font-headline-sm text-headline-sm text-tertiary">{user.stats.rank} <span className="text-sm font-sans opacity-60">PTS</span></h4>
              </div>
            </div>
          </section>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left/Center: Games & Achievements */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Recently Played */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recently Played</h2>
                  <button 
                    onClick={() => navigate('/library')}
                    className="text-primary font-label-md text-label-md hover:underline cursor-pointer"
                  >
                    View Library
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Game 1 */}
                  <div 
                    onClick={() => navigate('/game/battle_arena')}
                    className="group relative aspect-video rounded-xl overflow-hidden glass-card cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  >
                    <img 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg2bBC7GAEUEVIfU11xHOgqQk6dxjGnIL2VBle7RA0fCdjDIAbIH7IJnoxq3On8U4xPMslOWyOou1ysFBqSNDCdtqilFawaGCQmIuZycESAkaCIiEgUQM0Epr4UQLBfzK1lLtk7nRrcRywFdj5XDYeDEoV9CbjvR8z8JDiQ1kEypwDt4olsuC_oF9VqTQrfgkRqhfXpso9-Zy2eaXv4TidHS_xHs2L_V1yyhJD8gDQkPysl6MJNRSPOe_ogav3G1wgRoCsqk80XfA"
                      alt="Game 1"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                      <h3 className="font-headline-sm text-primary group-hover:text-white transition-colors">Neo-Vanguard: Prime</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-on-surface-variant">Last played 2h ago</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] border border-primary/20 rounded">88% Complete</span>
                      </div>
                    </div>
                  </div>

                  {/* Game 2 */}
                  <div 
                    onClick={() => navigate('/game/chess_masters')}
                    className="group relative aspect-video rounded-xl overflow-hidden glass-card cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  >
                    <img 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg4DoQnpnrRNavmFRez_vsJ1oDXwbyZEoP-VwZvDkoGIZNPgQvnK1AQfFWKaRxF917gDpBVL_oKF7z95CAq75RTreLWIm3cDnlBKVDxQSvKdma8Jn-hGobBlEpMf_bolSmVJRgG_Mr1AIVqK3ZOujpITPqer-KPCZYuW3auS7HO9MTnxHHp34CQajsqT5GgzzfDe0Y5Kg0kXgY9stFOGNkkiY6SPCgQTKy2hWuU4jr5qzWTWKaPPIGySCV0gCksziYyjOyGo-1u0k"
                      alt="Game 2"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                      <h3 className="font-headline-sm text-primary group-hover:text-white transition-colors">Starfleet Tactics V</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-on-surface-variant">Last played 1d ago</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] border border-primary/20 rounded">Rank: Admiral</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Achievements */}
              <section>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-6">Recent Achievements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center gap-3 border-t-2 border-primary">
                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_15px_rgba(173,198,255,0.2)]">
                      <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    </div>
                    <h4 className="font-label-md text-xs font-bold uppercase">Grand Conqueror</h4>
                    <p className="text-[10px] text-on-surface-variant">Win 100 ranked matches</p>
                  </div>
                  
                  <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center gap-3 border-t-2 border-secondary">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shadow-[0_0_15px_rgba(208,188,255,0.2)]">
                      <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    </div>
                    <h4 className="font-label-md text-xs font-bold uppercase">First Blood</h4>
                    <p className="text-[10px] text-on-surface-variant">Secure first kill in match</p>
                  </div>

                  <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center gap-3 opacity-40 border-t-2 border-outline-variant">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-3xl">lock</span>
                    </div>
                    <h4 className="font-label-md text-xs font-bold uppercase">Apex Predator</h4>
                    <p className="text-[10px] text-on-surface-variant">Reach Apex rank in Season 4</p>
                  </div>

                  <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center gap-3 opacity-40 border-t-2 border-outline-variant">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-3xl">lock</span>
                    </div>
                    <h4 className="font-label-md text-xs font-bold uppercase">Legendary Scout</h4>
                    <p className="text-[10px] text-on-surface-variant">Discover all map sectors</p>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Sidebar: Friends Activity */}
            <div className="lg:col-span-4 space-y-8">
              <section className="glass-card rounded-2xl p-6 h-fit border border-white/5">
                <h2 className="font-headline-sm text-sm font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">group</span>
                  FRIENDS ACTIVITY
                </h2>

                <div className="space-y-4">
                  {/* Friend 1 */}
                  <div 
                    onClick={() => navigate('/friends')}
                    className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-primary/20 overflow-hidden">
                        <img 
                          className="w-full h-full object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo2MwpYgR7-swugKzfkj6kG5xNfu24s1ui5lVjo_AX0ts1W2UXhjRxqTRI6ZYJ91pMEQLwIWzSPlC31-MxlXl6QOekT-xBAJ4CBK57tLU9VvC69wxlUu0dGKdAYkfy2DAEQNi7yqcWrVbVoGpsIHHtVTnsixa2VGMcjc52U4V53bKS-9nppoZD3MVWk6fz1ypW7jFKND70Ne4PoWBPNFXdkVezxYBRrrNI6hEbdr1xH77khyxBA94PLqFE1eCJPOgFNbvQ--4Wgyw"
                          alt="Friend 1"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-low"></div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-on-surface">Nova_Strider</h4>
                      <p className="text-[10px] text-primary">In Game: Neo-Vanguard</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chat_bubble</span>
                  </div>

                  {/* Friend 2 */}
                  <div 
                    onClick={() => navigate('/friends')}
                    className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-primary/20 overflow-hidden">
                        <img 
                          className="w-full h-full object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY_Ha3DQcEN8N7RfP7QYA_N2i8n0fNrXqAJXEJcRhQ6Q1wGFC0v7KzgyNM2JNn7LfQByb2LP7xYOKWYQKub4271fH6xYlmFP_meT3ac5VaCqOFfLKVyU6B1UWWces-i9r-Wh-3N-jDsjtIW5tw61H6tWl2FW3X06jVs9N4CFNEjr02SM9BOJC-IBZHuJgNBnY9IW9IgpxQFW3NFMEn3dalLbscJSm0NHVp8zbuao-vPioxfxU-EBN8w7PKPspHJQRc6k_NssvtZig"
                          alt="Friend 2"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-low"></div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-on-surface">Ghost_Protocol</h4>
                      <p className="text-[10px] text-primary">Online: Ready to play</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">add_circle</span>
                  </div>

                  {/* Friend 3 (Offline) */}
                  <div className="flex items-center gap-3 opacity-60 p-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 overflow-hidden grayscale">
                        <img 
                          className="w-full h-full object-cover" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA66e21cN5nNtsgJzzWyMg5cyKDfIGzPw7QCce9gKsq2DYE_tkntK6tx_Ln8btvRYLQV9m2-16oqpOG9L73l8tddsBvMv8yUi4V7DhE9nobBPK4s4pLnDOG256BTzCzTtwrwUwB16SVdNcQLVAbnEpXnvTU6Ba1I7wcHabsS9592OSuXZ_AkOawLMoB9eqpNS4FO_SIkHM688JvgULejYvLHSKfAGCgQKdiwsRjbVXAmpaEvq_D4r8w3uI7VzDJcAZ5qkyf0KCvMJM"
                          alt="Friend 3"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-outline rounded-full border-2 border-surface-container-low"></div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-on-surface">Sentinel_B4</h4>
                      <p className="text-[10px] text-on-surface-variant">Offline</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
