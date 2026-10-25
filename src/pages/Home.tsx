import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchmakeStore } from '../store/useMatchmakeStore';
import { ShaderBackground } from '../components/ShaderBackground';
import { useSocialStore } from '../store/useSocialStore';
import { useAuthStore } from '../store/useAuthStore';
import { getLeaderboardRankings } from '../data/leaderboardRegistry';

const GAMES = [
  { id: 'subway_surfers', name: 'Subway Surfers', genre: 'Arcade Runner', players: '85k', img: '/assets/games/subway_surfers.svg' },
  { id: 'temple_run', name: 'Temple Run 2', genre: 'Endless Runner', players: '72k', img: '/assets/games/temple_run.svg' },
  { id: 'vectaria', name: 'Vectaria.io', genre: 'Multiplayer Voxel', players: '65k', img: '/assets/games/vectaria.svg' },
  { id: 'classic_2048', name: 'Classic 2048', genre: 'Puzzle', players: '48k', img: '/assets/games/classic_2048.svg' },
  { id: 'battle_arena', name: 'Battle Arena', genre: 'Action MOBA', players: '12k', img: '/assets/games/battle_arena.svg' },
  { id: 'chess_masters', name: 'Chess Masters', genre: 'Strategy', players: '8k', img: '/assets/games/chess_masters.svg' },
  { id: 'neon_ludo', name: 'Neon Ludo', genre: 'Board Game', players: '5k', img: '/assets/games/neon_ludo.svg' },
  { id: 'void_snake', name: 'Void Snake', genre: 'Arcade', players: '2k', img: '/assets/games/void_snake.svg' }
];

const LEADERBOARD = [
  { rank: '#01', name: 'ShadowVoid_X', level: '99', winRate: '84.2%', xp: '1,245,000', color: 'text-primary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWD-CmSh0BzOTYVhxAjn2950OaBBMIzQf7wgFfwRFncdEyg2zzVRf-p_QaLdqwAW3J2EwxJ0dwhSC7XCzHGsXbREDfEZspS_ga_4QveAt2HdVB3r9Ymf4PobQPXJUvHHw7l6J8WtNwkR9VqGyVue7UseONOlam8eiS1H65qHFz0Mq3WWWcggJit9saQdh2qIwKtpooY_4gwWzs1MljCYPRL0UtnloGJ2Mso4KRlW5dis7n_zRoeWhOh5KhP_YFUPk0QuSh9n2ko8' },
  { rank: '#02', name: 'Neon_Reaper', level: '92', winRate: '79.5%', xp: '982,100', color: 'text-secondary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4l4z2gOw-E3adNZg0KCP3K292AidZ_IAnQ2KfS-bk8u_WLvUXl4rAfSk5GtC3ajZuHIB5KJI28lgKx0IAnlyiS3N6sdr00qy1rAtjv7NHJIwZuQb7XYD1JEdTt58k4CQoAQLZMxoREzYnxnwFuxF9xBfHntKOVd1l3T5zK31GpDSXIoou-QKgJJHxR5mYSxWQ8OVP4tkd5hdta5rn5hgzkDyyIEifJStrQIkvuCv4uA8x1ZaQBANwc7bpYn_aORyfkWYWEBYTDaA' },
  { rank: '#03', name: 'PixelQueen', level: '88', winRate: '76.8%', xp: '845,300', color: 'text-tertiary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaVogj9ePWxw0jwu1SlAbMXOKLBUsMeHbKogPb0hgOeL9HaO2BxaoJZ4-xtpncewnrvIjKFE8jm6AOjy2LA0QZ_Yksf4Qug3KGCWv2DkAuyi4BC0rzfJ7S31YU1ZukNGQjpiDfQAIAH__c7zVlfofTGB0k0_M1WUDTo32LCADvTqVp32FVYvJ_q5CqRvANJTk58NJOfSbl2Dd9dytm10Cx3T30NQMDYQpDxvlGRJqLyweaFqwHEXAZIrr6A0s-Wqa6h-0cod0H4bM' }
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const dynamicLeaderboard = getLeaderboardRankings(user);
  const startQueue = useMatchmakeStore((state) => state.startQueue);
  const { addNotification } = useSocialStore();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'GameDev_Alex', color: 'text-primary', text: 'New patch dropping at 14:00 UTC! Get ready for the new map.' },
    { sender: 'NovaBlade', color: 'text-secondary', text: 'Anyone up for a 3v3 Arena match? Need a healer!' },
    { sender: 'Cyborg_Zen', color: 'text-tertiary', text: 'The leaderboards are getting intense this season 🤯' }
  ]);

  const handleJoinMatch = (gameId: string, gameName: string) => {
    startQueue(gameId, gameName, 'US_EAST');
    navigate('/matchmaking');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'Commander_Nexus', color: 'text-primary', text: chatInput.trim() }]);
    addNotification('FRIEND_REQUEST', `Sent community chat message`);
    setChatInput('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* WebGL Matrix Background */}
      <ShaderBackground type="core" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center opacity-40 mix-blend-screen" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCc8zBA0Rx2DwNQlcbCFaJaRvu6-03Yj4rkvGIK3GlRW7QB9p4GlVrcF1wgNm5G-HOCQBT7cymYWQrs9uqG4yKCOzzVBrp0XdJ8VbKmy4UFxpyNf2tilXWZ7Sg2KMDr2ePCLaesVB50rW_ukJcyKdeOYqwMYdm2fqeuVHFxIVxxbxuDSJ0KxTLkphogNTj0as9uWOiGPbnDZkfg_s8t6NRR712gB5nuGrRwKvCl11wluYhbYL6UOzuAHs59j_8P8HsukuEyyT_GGrs')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-container-max mx-auto px-margin-desktop w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="font-display-lg text-display-lg lg:text-display-lg-mobile leading-tight text-white">
              Play Together.<br />
              Compete Together.<br />
              <span className="text-primary">Become Legends.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Join millions of players in the ultimate Cyber-Nexus of competitive and social gaming. Experience low-latency multiplayer matches, global tournaments, and a vibrant community.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => navigate('/library')}
                className="neon-button px-8 py-4 rounded-xl font-headline-sm text-headline-sm text-on-primary shadow-[0_0_20px_rgba(77,142,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
              >
                Play Now
              </button>
              <button 
                onClick={() => navigate('/library')}
                className="glass-card px-8 py-4 rounded-xl font-headline-sm text-headline-sm text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Explore Games
              </button>
            </div>

            <div className="flex items-center gap-6 pt-8">
              <div className="flex -space-x-4">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-[#050505] bg-surface-container bg-cover bg-center" 
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrolinmmSzbDwHKfIyGF_taMZuXrSEXDhkkUnTwVeymoNLMhFPC4mB2TnVJTzGmSJCNfKlkUKNZEzKvf__gB65uew5l8pSlfyw_4CfhVH4W8Icp5A2f-NWLwjiZTHsUAf7IYcMs_WwGlky-SaLL_HOrXh57ytPNTWLlVu8YrE6IWvSAubtUFljMEGCBr-ESdWx3rJOWJRQfNbY7ouNYcw6yMA3nTlkSBy-fyDvDjPv544GvJ75d52iIYslfZe-yXKiGeHX9FZkgtQ')` }}
                />
                <div 
                  className="w-10 h-10 rounded-full border-2 border-[#050505] bg-surface-container bg-cover bg-center" 
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAgtk9TEHZSc3Tja1X58fwe1CaiLIDcmsBw6GDPVoji7dk_uIOkFUTK8xlmBvmd6kXzrB_p14I0izOKJkIAOen05DmOFyQazPXHMufzB9xWNaXKTooVINMOUIO6N6neiTg0cQ66jNG4qtRfMw8YTUyiHxjtJYQSX3hwUlYGJ3sME2w5kCNNMWjvCVezakgV6iBYjBEy73jv6RgNW1yQAd2xoFCg-eR8s1zxhrqtqL3JmOInb1eYFdceIWWPJX_VlOZO6wWBrkPIUWs')` }}
                />
                <div 
                  className="w-10 h-10 rounded-full border-2 border-[#050505] bg-surface-container bg-cover bg-center" 
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdbsgMFG9UUSYIMHWf0VCcLYLZfxygGaeDMmXq-opFuICCblQYkJA_IPSZ_EYAuH9wSZ1wvyIMWWTxYpa6wS9wbnaXFdgxYAkfqOCtHjXrP0vKCmIOztiEcnr6U97dPwOt2t9NB_-_A_Ufyy74945xKTHjbbTB1HMAF4UVplPk0UM-Fu-xNx9qLAUq_MpeTj_DuuBxjG1a2w9eWMcMK8yl6BTznKDocUDuoIBFE_iEYTkvU8DLgrIsJSpCYYcgo4iuv_55q5KwVGA')` }}
                />
              </div>
              <p className="text-label-md text-on-surface-variant">Joined by <span className="text-primary font-bold">12,450+</span> players this hour</p>
            </div>
          </div>

          <div className="hidden lg:flex justify-center items-center relative">
            <div className="absolute w-full h-full animate-pulse opacity-50 bg-[radial-gradient(circle,#adc6ff_0%,transparent_70%)] blur-[100px]"></div>
            <img 
              alt="Game World Controller" 
              className="w-4/5 floating relative z-10 drop-shadow-[0_0_50px_rgba(173,198,255,0.3)]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVhz7lk_dEBBD4xadZTkKu6LGxJLPpOmVvmk9_0Jg2Ed7Pg2_CumYjNIzCfhIEkecXtcHEs70sccZC_riAso-Uu9HphZox0aH6LHgd28lfG_D-oqLcvOMSdZaHiAsTNCmrzolfpSE6MbK5epRCYbMzQpUCCZjV-HaGpxp6jlCpNRtNXr90aJudmRaVhGHBzFcceagd3V9lDbN8HXyZTXh0E6JNm5nuIfKX5bucdprAoDP4qOA0WyaNG_jGEwg7Oiw4rFA6eW0qpLU"
            />
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 bg-surface-container-lowest relative z-10 border-y border-white/5">
        <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="text-headline-xl font-headline-xl text-primary mb-1">2.4M</div>
            <div className="text-label-md text-on-surface-variant group-hover:text-primary transition-colors cursor-default">Registered Users</div>
          </div>
          <div className="text-center group">
            <div className="text-headline-xl font-headline-xl text-secondary mb-1">45.2K</div>
            <div className="text-label-md text-on-surface-variant group-hover:text-secondary transition-colors cursor-default">Players Online</div>
          </div>
          <div className="text-center group">
            <div className="text-headline-xl font-headline-xl text-tertiary mb-1">150+</div>
            <div className="text-label-md text-on-surface-variant group-hover:text-tertiary transition-colors cursor-default">Global Tournaments</div>
          </div>
          <div className="text-center group">
            <div className="text-headline-xl font-headline-xl text-primary mb-1">8.9M</div>
            <div className="text-label-md text-on-surface-variant group-hover:text-primary transition-colors cursor-default">Matches Played</div>
          </div>
        </div>
      </section>

      {/* Featured Games Grid */}
      <section className="py-24 max-w-container-max mx-auto px-margin-desktop relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline-xl text-headline-xl text-white mb-4">Featured Games</h2>
            <p className="text-on-surface-variant">Step into the arena and challenge the best in these trending titles.</p>
          </div>
          <button 
            onClick={() => navigate('/library')}
            className="text-primary font-label-md text-label-md flex items-center gap-2 hover:translate-x-1 transition-transform cursor-pointer"
          >
            View All Games <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {GAMES.map((game) => (
            <div 
              key={game.name} 
              onClick={() => navigate(`/play/embed/${game.id}`)}
              className="glass-card rounded-2xl overflow-hidden group cursor-pointer neon-glow flex flex-col h-full hover:translate-y-[-10px] transition-transform duration-300"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                  style={{ backgroundImage: `url('${game.img}')` }}
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  {game.players} Online
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-widest">{game.genre}</div>
                <h3 className="text-headline-sm font-headline-sm text-white mb-6">{game.name}</h3>
                
                <div className="mt-auto flex justify-between items-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/play/embed/${game.id}`);
                    }}
                    className="text-white font-label-md flex items-center gap-2 group-hover:text-primary transition-colors cursor-pointer font-bold"
                  >
                    PLAY NOW <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border border-[#050505] bg-surface-variant"></div>
                    <div className="w-6 h-6 rounded-full border border-[#050505] bg-surface-variant"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24 bg-surface-container-lowest relative z-10">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-headline-xl text-headline-xl text-white mb-4">Ultimate Gaming Infrastructure</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Built on a distributed cloud architecture to ensure 99.9% uptime and zero-latency performance for competitive gamers.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl hover:translate-y-[-8px] transition-transform duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-white mb-4">Real Time Multiplayer</h3>
              <p className="text-on-surface-variant">Experience lightning-fast matchmaking and gameplay sync with our proprietary Photon-X netcode.</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl hover:translate-y-[-8px] transition-transform duration-300">
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                <span className="material-symbols-outlined text-3xl">leaderboard</span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-white mb-4">Global Leaderboards</h3>
              <p className="text-on-surface-variant">Climb the regional and global ranks to earn exclusive rewards, badges, and prestigious titles.</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl hover:translate-y-[-8px] transition-transform duration-300">
              <div className="w-14 h-14 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary mb-6">
                <span className="material-symbols-outlined text-3xl">record_voice_over</span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-white mb-4">Spatial Voice Chat</h3>
              <p className="text-on-surface-variant">Communicate with your squad using high-fidelity spatial audio that makes strategic coordination effortless.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Players Leaderboard & Community Pulse */}
      <section className="py-24 max-w-container-max mx-auto px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Leaderboard */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline-lg text-headline-lg text-white">Elite Rankings</h2>
              <select className="bg-surface-container border-none text-on-surface rounded-lg text-label-md px-4 py-2 outline-none cursor-pointer">
                <option>Season 12: Galactic</option>
                <option>All Time Legends</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-6 px-4 py-2 text-label-sm text-on-surface-variant border-b border-white/5 uppercase tracking-tighter">
                <div className="col-span-1">Rank</div>
                <div className="col-span-2">Player</div>
                <div className="col-span-1 text-center">Level</div>
                <div className="col-span-1 text-center">Win Rate</div>
                <div className="col-span-1 text-right">Score</div>
              </div>

              <div className="space-y-2">
                {dynamicLeaderboard.map((player) => (
                  <div 
                    key={player.name} 
                    className={`grid grid-cols-6 px-4 py-4 rounded-xl items-center transition-all ${
                      player.isCurrentUser 
                        ? 'bg-primary/10 border border-primary/40 shadow-lg shadow-primary/10' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`col-span-1 font-bold ${player.color}`}>
                      #{player.rank < 10 ? `0${player.rank}` : player.rank}
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full bg-surface-container bg-cover bg-center border border-white/10" 
                        style={{ backgroundImage: `url('${player.img}')` }}
                      />
                      <div>
                        <span className="font-bold text-white text-xs sm:text-sm block">{player.name}</span>
                        {player.isCurrentUser && (
                          <span className="text-[9px] bg-primary text-black font-black px-1.5 py-0.2 rounded uppercase">Active Profile</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 text-center text-on-surface-variant font-medium text-xs">Lv. {player.level}</div>
                    <div className="col-span-1 text-center text-on-surface-variant font-medium text-xs">{player.winRate}</div>
                    <div className={`col-span-1 text-right font-mono font-bold text-xs ${player.color}`}>{player.rankScore} PTS</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button className="text-label-md text-on-surface-variant hover:text-white transition-colors cursor-pointer">
                Load More Rankings...
              </button>
            </div>
          </div>

          {/* Community Chat */}
          <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 text-primary">
              <span className="material-symbols-outlined">forum</span>
              <h3 className="font-headline-sm text-headline-sm">Community Pulse</h3>
            </div>

            <div className="flex-grow space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase border border-white/10">
                    {msg.sender[0]}
                  </div>
                  <div className="bg-surface-container-high p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                    <p className={`text-label-sm font-bold ${msg.color} mb-1`}>{msg.sender}</p>
                    <p className="text-body-md text-sm text-on-surface-variant leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="mt-6 flex gap-2">
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-grow bg-surface-container-high border-none rounded-lg px-4 py-2 text-on-surface text-sm outline-none focus:ring-1 focus:ring-primary transition-all placeholder-white/20" 
                placeholder="Type to chat..." 
                type="text"
                required
              />
              <button type="submit" className="bg-primary text-on-primary p-2 rounded-lg flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};
