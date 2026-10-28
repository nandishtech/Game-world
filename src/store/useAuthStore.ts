import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole, securityAuditLogger } from '../services/securityService';
import { rewardSecurityLedger } from '../services/rewardSecurity';
import { privacyService } from '../services/privacyService';
import { updateLeaderboardRegistry } from '../data/leaderboardRegistry';
import { authService } from '../services/authService';

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
  loginWithCredentials: (identifier: string, password: string) => Promise<UserProfile>;
  registerWithCredentials: (username: string, email: string, password: string) => Promise<UserProfile>;
  checkSession: () => Promise<boolean>;
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

// Helper to create a zero-stat profile
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

// Helper for local cached directory fallback
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

      // Authenticate against real server backend with cryptographic verification
      loginWithCredentials: async (identifier: string, password: string) => {
        const response = await authService.login(identifier, password);
        const serverUser = response.user;

        const profile: UserProfile = {
          id: serverUser.id,
          username: serverUser.username,
          displayName: serverUser.displayName || serverUser.username,
          email: serverUser.email,
          role: serverUser.role || 'USER',
          avatarUrl: serverUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(serverUser.username)}`,
          bio: serverUser.bio || 'New explorer in the Game World universe.',
          country: serverUser.country || 'Global Node',
          age: serverUser.age || 18,
          level: serverUser.level || 1,
          xp: serverUser.xp || 0,
          coins: serverUser.coins || 0,
          stats: serverUser.stats || { wins: 0, losses: 0, rank: 0, hoursPlayed: 0 },
          is2FAEnabled: false,
          activeSessions: DEFAULT_SESSIONS,
          isFirstLogin: false
        };

        saveProfileToDirectory(profile);
        securityAuditLogger.log({
          severity: 'INFO',
          eventType: 'AUTH_LOGIN_SUCCESS',
          actor: profile.username,
          ipAddress: '127.0.0.1',
          details: `User verified via cryptographic backend (Level: ${profile.level}, Rank: ${profile.stats.rank})`
        });

        set({ isAuthenticated: true, user: profile });
        return profile;
      },

      // Register new user on backend with salt + PBKDF2 hash
      registerWithCredentials: async (username: string, email: string, password: string) => {
        const response = await authService.register(username, email, password);
        const serverUser = response.user;

        const profile: UserProfile = {
          id: serverUser.id,
          username: serverUser.username,
          displayName: serverUser.displayName || serverUser.username,
          email: serverUser.email,
          role: 'USER',
          avatarUrl: serverUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(serverUser.username)}`,
          bio: serverUser.bio || 'New explorer in the Game World universe.',
          country: serverUser.country || 'Global Node',
          age: serverUser.age || 18,
          level: 1,
          xp: 0,
          coins: 0,
          stats: { wins: 0, losses: 0, rank: 0, hoursPlayed: 0 },
          is2FAEnabled: false,
          activeSessions: DEFAULT_SESSIONS,
          isFirstLogin: true
        };

        saveProfileToDirectory(profile);
        securityAuditLogger.log({
          severity: 'INFO',
          eventType: 'AUTH_REGISTER_SUCCESS',
          actor: profile.username,
          ipAddress: '127.0.0.1',
          details: `New commander account created on backend with cryptographic salt & hash`
        });

        set({ isAuthenticated: true, user: profile });
        return profile;
      },

      // Validate session token with backend on boot
      checkSession: async () => {
        try {
          const serverUser = await authService.getMe();
          if (serverUser) {
            const current = get().user;
            const profile: UserProfile = {
              id: serverUser.id,
              username: serverUser.username,
              displayName: serverUser.displayName || serverUser.username,
              email: serverUser.email,
              role: serverUser.role || 'USER',
              avatarUrl: serverUser.avatarUrl,
              bio: serverUser.bio,
              country: serverUser.country,
              age: serverUser.age,
              level: serverUser.level,
              xp: serverUser.xp,
              coins: serverUser.coins,
              stats: serverUser.stats,
              is2FAEnabled: current?.is2FAEnabled || false,
              activeSessions: current?.activeSessions || DEFAULT_SESSIONS,
              isFirstLogin: current?.isFirstLogin || false
            };
            set({ isAuthenticated: true, user: profile });
            return true;
          }
        } catch {
          // Token invalid or expired
        }
        return false;
      },

      // Legacy fallback
      login: (username, email) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();
        const savedDirectory = getSavedProfilesMap();

        let profile = savedDirectory[cleanEmail] || savedDirectory[cleanUsername.toLowerCase()];
        if (!profile) {
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

        set({ isAuthenticated: true, user: profile });
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
        authService.logout();
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
        authService.updateProfile({ level: newLevel, xp: newXP }).catch(() => {});
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
        authService.updateProfile({ coins: updatedUser.coins }).catch(() => {});
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
        authService.updateProfile({ coins: updatedUser.coins }).catch(() => {});
        return true;
      },

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
            rank: user.stats.rank + rankGain,
            hoursPlayed: Math.round((user.stats.hoursPlayed + 0.1) * 10) / 10
          }
        };

        saveProfileToDirectory(updatedUser);
        set({ user: updatedUser });

        updateLeaderboardRegistry(updatedUser);
        authService.updateProfile({
          coins: updatedUser.coins,
          level: updatedUser.level,
          xp: updatedUser.xp,
          stats: updatedUser.stats
        }).catch(() => {});

        if (leveledUp) {
          import('./useSocialStore').then(({ useSocialStore }) => {
            useSocialStore.getState().addNotification(
              'ACHIEVEMENT',
              `🎉 LEVEL UP! Commander reached Level ${newLevel}! Global statistics updated.`
            );
          });
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
        authService.updateProfile({ bio: newBio }).catch(() => {});
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
        authService.updateProfile(data).catch(() => {});
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
        authService.updateProfile({ bio: updatedUser.bio, avatarUrl: updatedUser.avatarUrl }).catch(() => {});
      },

      deleteAccount: () => {
        const user = get().user;
        if (!user) return;
        privacyService.purgeAccount(user.id, user.username);
        authService.logout();
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
