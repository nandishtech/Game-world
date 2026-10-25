import { create } from 'zustand';

export interface TeamMember {
  id: string;
  username: string;
  rank: number;
  avatarUrl: string;
  isReady: boolean;
}

export interface MatchInfo {
  matchId: string;
  opponentTeam: TeamMember[];
  gameId: string;
  gameName: string;
}

interface MatchmakeState {
  gameId: string | null;
  gameName: string | null;
  queueStatus: 'IDLE' | 'QUEUING' | 'MATCH_FOUND' | 'ACCEPTED' | 'PLAYING';
  elapsedSeconds: number;
  region: string;
  teamMembers: TeamMember[];
  matchInfo: MatchInfo | null;
  startQueue: (gameId: string, gameName: string, region: string) => void;
  cancelQueue: () => void;
  tickQueue: () => void;
  acceptMatch: () => void;
  declineMatch: () => void;
  completeMatch: () => void;
  setTeamMembers: (members: TeamMember[]) => void;
  toggleReady: (memberId: string) => void;
}

const MOCK_PARTY: TeamMember[] = [
  {
    id: 'user_nexus_01',
    username: 'Commander_Nexus',
    rank: 1850,
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
    isReady: true
  },
  {
    id: 'user_gamer_02',
    username: 'Neon_Specter',
    rank: 1720,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isReady: false
  }
];

const MOCK_OPPONENTS: TeamMember[] = [
  {
    id: 'user_opp_01',
    username: 'Void_Stalker',
    rank: 1910,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    isReady: true
  },
  {
    id: 'user_opp_02',
    username: 'Alpha_Zero',
    rank: 1690,
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
    isReady: true
  }
];

export const useMatchmakeStore = create<MatchmakeState>((set, get) => ({
  gameId: null,
  gameName: null,
  queueStatus: 'IDLE',
  elapsedSeconds: 0,
  region: 'US_EAST',
  teamMembers: MOCK_PARTY,
  matchInfo: null,

  startQueue: (gameId, gameName, region) => {
    set({
      gameId,
      gameName,
      region,
      queueStatus: 'QUEUING',
      elapsedSeconds: 0
    });
  },

  cancelQueue: () => {
    set({
      gameId: null,
      gameName: null,
      queueStatus: 'IDLE',
      elapsedSeconds: 0
    });
  },

  tickQueue: () => {
    const { elapsedSeconds, queueStatus } = get();
    if (queueStatus !== 'QUEUING') return;

    const nextSeconds = elapsedSeconds + 1;
    
    // Auto find match at 8 seconds for presentation purposes
    if (nextSeconds >= 8) {
      set({
        queueStatus: 'MATCH_FOUND',
        elapsedSeconds: 0,
        matchInfo: {
          matchId: 'match_uuid_' + Math.floor(Math.random() * 100000),
          opponentTeam: MOCK_OPPONENTS,
          gameId: get().gameId || 'battle_arena',
          gameName: get().gameName || 'Battle Arena'
        }
      });
    } else {
      set({ elapsedSeconds: nextSeconds });
    }
  },

  acceptMatch: () => {
    set({ queueStatus: 'ACCEPTED' });
    
    // Auto transition to playing after 2 seconds
    setTimeout(() => {
      set({ queueStatus: 'PLAYING' });
    }, 2000);
  },

  declineMatch: () => {
    set({
      queueStatus: 'IDLE',
      gameId: null,
      gameName: null,
      elapsedSeconds: 0,
      matchInfo: null
    });
  },

  completeMatch: () => {
    set({
      queueStatus: 'IDLE',
      gameId: null,
      gameName: null,
      elapsedSeconds: 0,
      matchInfo: null
    });
  },

  setTeamMembers: (members) => {
    set({ teamMembers: members });
  },

  toggleReady: (memberId) => {
    const members = get().teamMembers.map(member => 
      member.id === memberId ? { ...member, isReady: !member.isReady } : member
    );
    set({ teamMembers: members });
  }
}));
