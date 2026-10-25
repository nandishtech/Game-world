import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole, securityAuditLogger } from '../services/securityService';
import { rewardSecurityLedger } from '../services/rewardSecurity';
import { privacyService } from '../services/privacyService';
import { updateLeaderboardRegistry } from '../data/leaderboardRegistry';
import { useSocialStore } from './useSocialStore';

export interface UserStats {
  wins: number;
  losses: number;
  rank: number; // ELO / Rank Score
  hoursPlayed: number;
}

export interface UserSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  country: string;
  age?: number;
  level: number;
  xp: number;
  coins: number;
  stats: UserStats;
  is2FAEnabled: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  activeSessions: UserSession[];
  isFirstLogin?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (username: string, email: string) => void;
  logout: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  recordGameReward: (coins: number, xp: number, rankGain?: number, won?: boolean) => void;
  updateBio: (newBio: string) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  completeProfile: (bio: string, avatarUrl?: string) => void;
  enable2FA: (secret: string, codes: string[]) => void;
  disable2FA: () => void;
  logoutAllDevices: () => void;
  secureClaimReward: (coins: number, xp: number, key: string, won?: boolean) => boolean;
  deleteAccount: () => void;
}

const DEFAULT_SESSIONS: UserSession[] = [
  {
    id: 'sess_curr_01',
    device: 'Web Client (Browser)',
    ip: '127.0.0.1',
    location: 'Cyber City, Global Node',
    lastActive: 'Active Now',
    current: true
  }
];

// Factory to create a completely clean profile starting strictly from ZERO
const createZeroProfile = (username: string, email: string): UserProfile => ({
  id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  username,
  displayName: username,
  email,
  role: 'USER',
  avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || 'pilot')}`,
  bio: 'New explorer in the Game World universe. Competing and climbing ranks.',
  country: 'Global Node',
  age: 18,
  level: 1, // Fresh level 1
  xp: 0,    // Starts at 0 XP
  coins: 0, // Starts with 0 coins
  stats: {
    wins: 0,
    losses: 0,
    rank: 0, // Starts at 0 rank
    hoursPlayed: 0
  },
  is2FAEnabled: false,
  isFirstLogin: true,
  activeSessions: DEFAULT_SESSIONS
});

// Helper to retrieve saved profiles catalog from localStorage
const getSavedProfilesMap = (): Record<string, UserProfile> => {
  try {
    const raw = localStorage.getItem('gw_profiles_directory');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveProfileToDirectory = (profile: UserProfile) => {
  try {
    const map = getSavedProfilesMap();
    map[profile.email.toLowerCase()] = profile;
    map[profile.username.toLowerCase()] = profile;
    localStorage.setItem('gw_profiles_directory', JSON.stringify(map));
  } catch {
    // Ignore storage errors
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,

      login: (username, email) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();
        const savedDirectory = getSavedProfilesMap();

        // Check if an existing profile is saved for this email or username
        let profile = savedDirectory[cleanEmail] || savedDirectory[cleanUsername.toLowerCase()];

        if (!profile) {
          // BRAND NEW PROFILE: Starts strictly with ZERO stats
          profile = createZeroProfile(cleanUsername, cleanEmail);
          saveProfileToDirectory(profile);
        }

        securityAuditLogger.log({
          severity: 'INFO',
          eventType: 'AUTH_LOGIN_SUCCESS',
          actor: cleanUsername,
          ipAddress: '127.0.0.1',
          details: `User session authenticated (Level: ${profile.level}, Rank: ${profile.stats.rank})`
        });

        set({
          isAuthenticated: true,
          user: profile
        });
      },

      logout: () => {
        const currentUser = get().user;
        if (currentUser) {
          saveProfileToDirectory(currentUser);
          securityAuditLogger.log({
            severity: 'INFO',
            eventType: 'AUTH_SESSION_EXPIRED',
            actor: currentUser.username,
            ipAddress: '127.0.0.1',
            details: 'User explicitly logged out of current station'
          });
        }
        set({ isAuthenticated: false, user: null });
      },

      enable2FA: (secret: string, codes: string[]) => {
        const user = get().user;
        if (!user) return;
        const updatedUser: UserProfile = {
          ...user,
          is2FAEnabled: true,
          twoFactorSecret: secret,
          recoveryCodes: codes
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
      },

      disable2FA: () => {
        const user = get().user;
        if (!user) return;
        const updatedUser: UserProfile = {
          ...user,
          is2FAEnabled: false
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
      },

      logoutAllDevices: () => {
        const user = get().user;
        if (!user) return;
        const updatedUser: UserProfile = {
          ...user,
          activeSessions: user.activeSessions.filter(s => s.current)
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
      },

      addXP: (amount) => {
        const user = get().user;
        if (!user) return;

        let newXP = user.xp + amount;
        let newLevel = user.level;

        while (newXP >= 100) {
          newXP -= 100;
          newLevel += 1;
        }

        const updatedUser: UserProfile = {
          ...user,
          level: newLevel,
          xp: newXP
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
      },

      addCoins: (amount) => {
        const user = get().user;
        if (!user) return;
        const updatedUser: UserProfile = {
          ...user,
          coins: user.coins + amount
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
      },

      spendCoins: (amount) => {
        const user = get().user;
        if (!user || user.coins < amount) return false;
        const updatedUser: UserProfile = {
          ...user,
          coins: user.coins - amount
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
        return true;
      },

      // Records gameplay outcomes: adds XP, increases Level, gains Coins, and scales Rank!
      recordGameReward: (coins: number, xp: number, rankGain = 15, won = true) => {
        const user = get().user;
        if (!user) return;

        let newXP = user.xp + xp;
        let newLevel = user.level;
        const initialLevel = user.level;

        while (newXP >= 100) {
          newXP -= 100;
          newLevel += 1;
        }

        const leveledUp = newLevel > initialLevel;

        const updatedUser: UserProfile = {
          ...user,
          coins: user.coins + coins,
          level: newLevel,
          xp: newXP,
          stats: {
            wins: won ? user.stats.wins + 1 : user.stats.wins,
            losses: won ? user.stats.losses : user.stats.losses + 1,
            rank: user.stats.rank + rankGain, // Increases rank with every match played
            hoursPlayed: Math.round((user.stats.hoursPlayed + 0.1) * 10) / 10
          }
        };

        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });

        // Step 15 in process: Update global leaderboard
        updateLeaderboardRegistry(updatedUser);

        // Step 13 in process: Level Up notification
        if (leveledUp) {
          useSocialStore.getState().addNotification(
            'ACHIEVEMENT',
            `🎉 LEVEL UP! Commander reached Level ${newLevel}! Global statistics updated.`
          );
        }
      },

      secureClaimReward: (coins: number, xp: number, key: string, won = true) => {
        const user = get().user;
        if (!user) return false;

        rewardSecurityLedger.processReward(user.id, coins, xp, key, 'REWARD_EARNED');
        get().recordGameReward(coins, xp, won ? 25 : 10, won);
        return true;
      },

      updateBio: (newBio) => {
        const user = get().user;
        if (!user) return;
        const updatedUser: UserProfile = {
          ...user,
          bio: newBio,
          isFirstLogin: false
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
      },

      updateProfile: (data) => {
        const user = get().user;
        if (!user) return;
        const updatedUser: UserProfile = {
          ...user,
          ...data,
          isFirstLogin: false
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
        updateLeaderboardRegistry(updatedUser);
      },

      completeProfile: (bio: string, avatarUrl?: string) => {
        const user = get().user;
        if (!user) return;
        const updatedUser: UserProfile = {
          ...user,
          bio: bio || user.bio,
          avatarUrl: avatarUrl || user.avatarUrl,
          isFirstLogin: false
        };
        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });
      },

      deleteAccount: () => {
        const user = get().user;
        if (!user) return;
        privacyService.purgeAccount(user.id, user.username);
        try {
          const map = getSavedProfilesMap();
          delete map[user.email.toLowerCase()];
          delete map[user.username.toLowerCase()];
          localStorage.setItem('gw_profiles_directory', JSON.stringify(map));
        } catch {}
        set({ isAuthenticated: false, user: null });
      }
    }),
    {
      name: 'gw_auth_store_v2'
    }
  )
);
