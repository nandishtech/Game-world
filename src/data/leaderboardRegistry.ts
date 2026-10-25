import { UserProfile } from '../store/useAuthStore';

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  level: number;
  rankScore: number;
  winRate: string;
  wins: number;
  losses: number;
  xp: number;
  img: string;
  color: string;
  isCurrentUser?: boolean;
}

const DEFAULT_CHAMPIONS: LeaderboardPlayer[] = [
  {
    rank: 1,
    name: 'Viper_Zero',
    level: 68,
    rankScore: 2850,
    winRate: '84%',
    wins: 342,
    losses: 65,
    xp: 24500,
    img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
    color: 'text-amber-400'
  },
  {
    rank: 2,
    name: 'Cyber_Ghost',
    level: 54,
    rankScore: 2420,
    winRate: '78%',
    wins: 289,
    losses: 81,
    xp: 18200,
    img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    color: 'text-slate-300'
  },
  {
    rank: 3,
    name: 'Chrono_X',
    level: 49,
    rankScore: 2150,
    winRate: '72%',
    wins: 210,
    losses: 82,
    xp: 14800,
    img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    color: 'text-amber-600'
  },
  {
    rank: 4,
    name: 'Neon_Valkyrie',
    level: 42,
    rankScore: 1980,
    winRate: '69%',
    wins: 175,
    losses: 79,
    xp: 12400,
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    color: 'text-primary'
  },
  {
    rank: 5,
    name: 'Void_Walker',
    level: 36,
    rankScore: 1750,
    winRate: '65%',
    wins: 140,
    losses: 75,
    xp: 9800,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    color: 'text-secondary'
  }
];

export const getLeaderboardRankings = (currentUser?: UserProfile | null): LeaderboardPlayer[] => {
  const champions = [...DEFAULT_CHAMPIONS];

  if (currentUser) {
    const totalMatches = currentUser.stats.wins + currentUser.stats.losses;
    const wr = totalMatches > 0 ? `${Math.round((currentUser.stats.wins / totalMatches) * 100)}%` : '0%';
    
    // Add current user as dynamic competitor
    const userPlayer: LeaderboardPlayer = {
      rank: 0,
      name: `${currentUser.username} (YOU)`,
      level: currentUser.level,
      rankScore: currentUser.stats.rank,
      winRate: wr,
      wins: currentUser.stats.wins,
      losses: currentUser.stats.losses,
      xp: currentUser.xp,
      img: currentUser.avatarUrl,
      color: 'text-emerald-400',
      isCurrentUser: true
    };

    champions.push(userPlayer);
  }

  // Sort descending by rank score, then by level
  champions.sort((a, b) => {
    if (b.rankScore !== a.rankScore) {
      return b.rankScore - a.rankScore;
    }
    return b.level - a.level;
  });

  // Assign sequential 1-based ranks
  return champions.map((p, idx) => ({
    ...p,
    rank: idx + 1
  }));
};

export const updateLeaderboardRegistry = (user: UserProfile) => {
  try {
    const key = 'gw_leaderboard_data';
    const entry = {
      username: user.username,
      rankScore: user.stats.rank,
      level: user.level,
      wins: user.stats.wins,
      losses: user.stats.losses,
      updatedAt: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage issues
  }
};
