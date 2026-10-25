import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-white/5 py-12 mt-auto relative z-10">
      <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Deck - Game World */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <img 
              src="/assets/brand/game_world_emblem.png" 
              alt="Game World" 
              className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(52,120,246,0.5)]"
            />
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm tracking-wider text-white">GAME</span>
              <span className="font-black text-xs tracking-widest text-[#8057E8]">WORLD</span>
            </div>
          </Link>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs">
            The ultimate Cyber-Nexus of competitive and social gaming. Join matches, build guild squads, and win tournaments.
          </p>
          <div className="text-[10px] text-on-surface-variant/60">
            © {new Date().getFullYear()} Game World. All rights reserved.
          </div>
        </div>

        {/* Column 1: Navigate */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white">Platform</h5>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><Link to="/" className="hover:text-primary transition-colors">Lobby Deck</Link></li>
            <li><Link to="/library" className="hover:text-primary transition-colors">Game Library</Link></li>
            <li><Link to="/marketplace" className="hover:text-primary transition-colors">Cosmetics Shop</Link></li>
            <li><Link to="/tournaments" className="hover:text-primary transition-colors">Tournament Center</Link></li>
          </ul>
        </div>

        {/* Column 2: Systems */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white">Systems</h5>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><Link to="/dashboard" className="hover:text-primary transition-colors">Player Stats</Link></li>
            <li><Link to="/friends" className="hover:text-primary transition-colors">Friends Hub</Link></li>
            <li><Link to="/clan" className="hover:text-primary transition-colors">Clan Hub</Link></li>
            <li><Link to="/battlepass" className="hover:text-primary transition-colors">Battle Pass</Link></li>
          </ul>
        </div>

        {/* Column 3: Policy / Support */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white">Security & Rules</h5>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/friends" className="hover:text-primary transition-colors">Community Support</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
};
