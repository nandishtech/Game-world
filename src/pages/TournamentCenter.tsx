import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ThreeEarthBackdrop } from '../components/ThreeEarthBackdrop';
import { Trophy, Calendar, Users, DollarSign, Award, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ACTIVE_TOURNAMENTS = [
  { id: 't1', title: 'Cyber Nexus Open', game: 'Battle Arena', date: 'July 28, 2026', teams: '32/64 teams', prize: '$15,000', status: 'REGISTERING' },
  { id: 't2', title: 'Tactical Masters Invitational', game: 'Chess Masters', date: 'August 02, 2026', teams: '16/16 teams', prize: '$5,000', status: 'CLOSED' },
  { id: 't3', title: 'Neon Ludo Cup', game: 'Neon Ludo', date: 'August 10, 2026', teams: '8/32 teams', prize: '100k Coins', status: 'REGISTERING' }
];

const BRACKET_ROUNDS = [
  {
    roundName: 'Quarterfinals',
    matches: [
      { id: 'm1', team1: 'Nexus Legions', team1Score: '2', team2: 'Void Stalkers', team2Score: '1', active: false },
      { id: 'm2', team1: 'Cyber Wolves', team1Score: '0', team2: 'Viper Strike', team2Score: '2', active: false }
    ]
  },
  {
    roundName: 'Semifinals',
    matches: [
      { id: 'm3', team1: 'Nexus Legions', team1Score: '-', team2: 'Viper Strike', team2Score: '-', active: true }
    ]
  },
  {
    roundName: 'Finals',
    matches: [
      { id: 'm4', team1: 'TBD Team', team1Score: '-', team2: 'Cyber Titans', team2Score: '-', active: false }
    ]
  }
];

export const TournamentCenter: React.FC = () => {
  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-background">
      <ThreeEarthBackdrop />

      <main className="relative z-10 max-w-container-max mx-auto px-margin-desktop space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-headline-xl font-headline-xl text-white font-bold">Tournament Center</h1>
            <p className="text-xs text-on-surface-variant mt-1.5">Compete against top global squads and claim legendary rewards.</p>
          </div>
          <Card level={1} className="flex items-center gap-3 bg-black/25 backdrop-blur-md px-4 py-2 border border-white/5">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-xs text-white font-bold">120 Seasonal Points</span>
          </Card>
        </div>

        {/* Main Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          
          {/* Left Columns: Tournament List */}
          <div className="lg:col-span-2 space-y-6">
            <Card level={2} className="p-6 border border-white/5">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold mb-6">Upcoming Tournaments</h3>
              
              <div className="space-y-4">
                {ACTIVE_TOURNAMENTS.map((t) => (
                  <div 
                    key={t.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between bg-black/15 backdrop-blur-md border border-white/5 p-5 rounded-xl hover:border-white/10 transition-all gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-primary font-bold">{t.game}</span>
                      <h4 className="text-sm font-bold text-white leading-normal">{t.title}</h4>
                      
                      <div className="flex flex-wrap gap-4 text-[10px] text-on-surface-variant font-semibold pt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-on-surface-variant" /> {t.date}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-on-surface-variant" /> {t.teams}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-green-400" /> {t.prize}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 justify-end">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded border ${t.status === 'REGISTERING' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-white/5 text-on-surface-variant border-white/10'}`}>
                        {t.status}
                      </span>
                      <Button variant={t.status === 'REGISTERING' ? 'neon' : 'glass'} className="text-xs py-2">
                        {t.status === 'REGISTERING' ? 'Register Team' : 'Inspect Grid'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Live Bracket Display */}
            <Card level={2} className="p-6 border border-white/5">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold mb-6">Live Grid Bracket (Pro League)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {BRACKET_ROUNDS.map((round, rIdx) => (
                  <div key={round.roundName} className="space-y-4">
                    <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold text-center border-b border-white/5 pb-2">
                      {round.roundName}
                    </div>

                    <div className="space-y-4 flex flex-col justify-center h-full">
                      {round.matches.map((match) => (
                        <div 
                          key={match.id} 
                          className={`bg-black/15 backdrop-blur-md border rounded-xl p-3 space-y-2 transition-all ${match.active ? 'border-primary shadow-[0_0_15px_rgba(77,142,255,0.2)]' : 'border-white/5'}`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className={`font-bold ${match.team1Score !== '-' && parseInt(match.team1Score) > parseInt(match.team2Score) ? 'text-primary' : 'text-white'}`}>
                              {match.team1}
                            </span>
                            <span className="font-headline-sm font-bold text-white">{match.team1Score}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className={`font-bold ${match.team2Score !== '-' && parseInt(match.team2Score) > parseInt(match.team1Score) ? 'text-primary' : 'text-white'}`}>
                              {match.team2}
                            </span>
                            <span className="font-headline-sm font-bold text-white">{match.team2Score}</span>
                          </div>
                          
                          {match.active && (
                            <div className="text-[8px] uppercase tracking-widest text-primary text-center font-bold animate-pulse pt-1 border-t border-white/5">
                              Live Combat Active
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Right Column: Achievements & Stats */}
          <div className="space-y-6">
            <Card level={2} className="p-6 border border-white/5 space-y-6">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold">Hall of Champions</h3>
              
              <div className="space-y-4 text-xs font-semibold text-on-surface-variant">
                <div className="flex items-center gap-3 bg-black/15 backdrop-blur-md p-3.5 rounded-xl border border-white/5">
                  <Award className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-white font-bold">Ludo Legend 2026</div>
                    <div className="text-[10px] mt-1">Claimed by Cyber_Wolves</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-black/15 backdrop-blur-md p-3.5 rounded-xl border border-white/5">
                  <Award className="w-8 h-8 text-slate-300" />
                  <div>
                    <div className="text-white font-bold">MOBA Spring Cup</div>
                    <div className="text-[10px] mt-1">Claimed by Viper_Strike</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-black/15 backdrop-blur-md p-3.5 rounded-xl border border-white/5">
                  <Award className="w-8 h-8 text-amber-600" />
                  <div>
                    <div className="text-white font-bold">Zero-G Racing Open</div>
                    <div className="text-[10px] mt-1">Claimed by Velocity_Rider</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card level={2} className="p-6 border border-white/5 space-y-4">
              <h3 className="text-headline-sm font-headline-sm text-white font-bold">Platform Stats</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-on-surface-variant">Active Brackets</span>
                  <span className="text-white font-bold">12 Active</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-on-surface-variant">Combined Prize Pool</span>
                  <span className="text-green-400 font-bold">$125,000</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-on-surface-variant">Clans Registered</span>
                  <span className="text-white font-bold">1,240 teams</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Next Stream Kickoff</span>
                  <span className="text-primary font-bold">1 hour</span>
                </div>
              </div>
            </Card>
          </div>

        </div>

      </main>
    </div>
  );
};
