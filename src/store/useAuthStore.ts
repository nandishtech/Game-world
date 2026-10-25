import { create } from 'zustand';
import { UserRole, securityAuditLogger } from '../services/securityService';
import { rewardSecurityLedger } from '../services/rewardSecurity';
import { privacyService } from '../services/privacyService';

export interface UserStats {
  wins: number;
  losses: number;
  rank: number; // ELO
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
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  country: string;
  level: number;
  xp: number;
  coins: number;
  stats: UserStats;
  is2FAEnabled: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  activeSessions: UserSession[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (username: string, email: string, role?: UserRole) => void;
  logout: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  updateBio: (newBio: string) => void;
  setRole: (role: UserRole) => void;
  enable2FA: (secret: string, codes: string[]) => void;
  disable2FA: () => void;
  logoutAllDevices: () => void;
  secureClaimReward: (coins: number, xp: number, key: string) => boolean;
  deleteAccount: () => void;
}

const DEFAULT_SESSIONS: UserSession[] = [
  {
    id: 'sess_curr_01',
    device: 'Windows 11 (Chrome 128 / Edge)',
    ip: '192.168.1.104',
    location: 'Cyber City, Global Node',
    lastActive: 'Active Now',
    current: true
  },
  {
    id: 'sess_mob_02',
    device: 'Mobile Nexus App (Android 14)',
    ip: '103.24.12.89',
    location: 'Cyber City, Mobile Gateway',
    lastActive: '2 hours ago',
    current: false
  }
];

const DEFAULT_USER: UserProfile = {
  id: 'user_nexus_01',
  username: 'Commander_Nexus',
  email: 'nexus@gameworld.gg',
  role: 'SUPER_ADMIN',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQs_tjqcECUn5t-6vextXiJCGpj2pM2n_UHY4uLJ1zGXx9KvTRY6F-z7iRuPYOaUAHVa8rLgJeE7baNoV1602KAL04FvITaBTAdFMSpN-NkHTSRdc2HRZTO-K9-HOHt0ke3cEngpUI6HUjlafvrhlAF-YKpKK6dwhnEE7NVTNVdLnSpbwY55PaIEP-zh4bzs5tsTkUDZV_IjF9gvI_KFXJJ1dV2S-8EMy0jFKWAogup6sxfPkQFUGe13WKiZlmYWLOyWCyNxRwsII',
  bio: 'Cyber Nexus Vanguard commander. Competitive gamer and esports enthusiast.',
  country: 'Cyber City',
  level: 42,
  xp: 75, // 0 to 100
  coins: 1250,
  stats: {
    wins: 142,
    losses: 68,
    rank: 1850,
    hoursPlayed: 120.5
  },
  is2FAEnabled: true,
  twoFactorSecret: 'JBSWY3DPEHPK3PXP',
  recoveryCodes: ['9A8F-4D21', '7C3B-8E90', '1F4E-6A22', '3D8C-5E11'],
  activeSessions: DEFAULT_SESSIONS
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,

  login: (username, email, role = 'SUPER_ADMIN') => {
    securityAuditLogger.log({
      severity: 'INFO',
      eventType: 'AUTH_LOGIN_SUCCESS',
      actor: username,
      ipAddress: '192.168.1.104',
      details: `User session authenticated with role ${role}`
    });

    set({
      isAuthenticated: true,
      user: {
        ...DEFAULT_USER,
        username,
        email,
        role
      }
    });
  },

  logout: () => {
    const user = get().user;
    if (user) {
      securityAuditLogger.log({
        severity: 'INFO',
        eventType: 'AUTH_SESSION_EXPIRED',
        actor: user.username,
        ipAddress: '192.168.1.104',
        details: 'User explicitly logged out of current station'
      });
    }
    set({ isAuthenticated: false, user: null });
  },

  setRole: (role: UserRole) => {
    const user = get().user;
    if (!user) return;
    securityAuditLogger.log({
      severity: 'WARN',
      eventType: 'ADMIN_ACTION',
      actor: user.username,
      ipAddress: '192.168.1.104',
      details: `User role transitioned to ${role}`
    });
    set({ user: { ...user, role } });
  },

  enable2FA: (secret: string, codes: string[]) => {
    const user = get().user;
    if (!user) return;
    securityAuditLogger.log({
      severity: 'INFO',
      eventType: 'AUTH_2FA_CHALLENGE',
      actor: user.username,
      ipAddress: '192.168.1.104',
      details: 'Two-Factor Authentication (2FA) TOTP protection activated'
    });
    set({
      user: {
        ...user,
        is2FAEnabled: true,
        twoFactorSecret: secret,
        recoveryCodes: codes
      }
    });
  },

  disable2FA: () => {
    const user = get().user;
    if (!user) return;
    securityAuditLogger.log({
      severity: 'WARN',
      eventType: 'AUTH_2FA_CHALLENGE',
      actor: user.username,
      ipAddress: '192.168.1.104',
      details: 'Two-Factor Authentication (2FA) TOTP protection deactivated'
    });
    set({
      user: {
        ...user,
        is2FAEnabled: false
      }
    });
  },

  logoutAllDevices: () => {
    const user = get().user;
    if (!user) return;
    securityAuditLogger.log({
      severity: 'WARN',
      eventType: 'AUTH_SESSION_EXPIRED',
      actor: user.username,
      ipAddress: '192.168.1.104',
      details: 'Terminated all remote user sessions across all devices'
    });
    set({
      user: {
        ...user,
        activeSessions: user.activeSessions.filter(s => s.current)
      }
    });
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

    set({
      user: {
        ...user,
        level: newLevel,
        xp: newXP
      }
    });
  },

  addCoins: (amount) => {
    const user = get().user;
    if (!user) return;
    set({
      user: {
        ...user,
        coins: user.coins + amount
      }
    });
  },

  spendCoins: (amount) => {
    const user = get().user;
    if (!user || user.coins < amount) return false;
    set({
      user: {
        ...user,
        coins: user.coins - amount
      }
    });
    return true;
  },

  secureClaimReward: (coins: number, xp: number, key: string) => {
    const user = get().user;
    if (!user) return false;

    const res = rewardSecurityLedger.processReward(user.id, coins, xp, key, 'REWARD_EARNED');
    if (res.success) {
      get().addCoins(coins);
      get().addXP(xp);
      return true;
    }
    return false;
  },

  updateBio: (newBio) => {
    const user = get().user;
    if (!user) return;
    set({
      user: {
        ...user,
        bio: newBio
      }
    });
  },

  deleteAccount: () => {
    const user = get().user;
    if (!user) return;
    privacyService.purgeAccount(user.id, user.username);
    set({ isAuthenticated: false, user: null });
  }
}));
