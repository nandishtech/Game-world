/**
 * Game World Security & Authentication Core Service
 * Implements cryptographic hashing, password policy validation, brute-force protection,
 * 2FA verification, session lifecycle management, RBAC, and security audit logging.
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'GAME_MANAGER' | 'MODERATOR' | 'USER';

export interface PermissionMatrix {
  SUPER_ADMIN: string[];
  ADMIN: string[];
  GAME_MANAGER: string[];
  MODERATOR: string[];
  USER: string[];
}

export const ROLE_PERMISSIONS: PermissionMatrix = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'manage_games',
    'manage_users',
    'view_security_logs',
    'manage_tournaments',
    'resolve_reports',
    'manage_marketplace',
    'export_audit_logs'
  ],
  GAME_MANAGER: [
    'manage_games',
    'upload_games',
    'test_games',
    'update_game_metadata',
    'view_game_telemetry'
  ],
  MODERATOR: [
    'resolve_reports',
    'warn_users',
    'temp_mute',
    'view_moderation_queue',
    'inspect_user_history'
  ],
  USER: [
    'play_games',
    'manage_profile',
    'submit_scores',
    'participate_tournaments',
    'purchase_cosmetics',
    'export_personal_data'
  ]
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  const allowed = ROLE_PERMISSIONS[role] || [];
  if (allowed.includes('*')) return true;
  return allowed.includes(permission);
};

export interface PasswordAnalysis {
  isValid: boolean;
  score: number; // 0 - 100
  strengthLabel: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Cyber-Secure';
  errors: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const validatePasswordPolicy = (password: string): PasswordAnalysis => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const errors: string[] = [];
  if (!hasMinLength) errors.push('Password must be at least 8 characters long');
  if (!hasUppercase) errors.push('Must include at least one uppercase letter (A-Z)');
  if (!hasLowercase) errors.push('Must include at least one lowercase letter (a-z)');
  if (!hasNumber) errors.push('Must include at least one number (0-9)');
  if (!hasSpecialChar) errors.push('Must include at least one special character (!@#$%...)');

  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (hasUppercase) score += 15;
  if (hasLowercase) score += 10;
  if (hasNumber) score += 15;
  if (hasSpecialChar) score += 15;

  let strengthLabel: PasswordAnalysis['strengthLabel'] = 'Very Weak';
  if (score >= 85) strengthLabel = 'Cyber-Secure';
  else if (score >= 65) strengthLabel = 'Strong';
  else if (score >= 45) strengthLabel = 'Medium';
  else if (score >= 25) strengthLabel = 'Weak';

  return {
    isValid: errors.length === 0,
    score,
    strengthLabel,
    errors,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar
  };
};

/**
 * WebCrypto Cryptographic Hash Function (SHA-256 with Salt)
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder();
  const data = enc.encode(password + '::gameverse_pepper::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate cryptographically secure random token
 */
export const generateSecureToken = (byteLength = 32): string => {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export interface LoginAttemptRecord {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

class BruteForceProtector {
  private records: Map<string, LoginAttemptRecord> = new Map();

  getRecord(identifier: string): LoginAttemptRecord {
    const key = identifier.toLowerCase().trim();
    const existing = this.records.get(key);
    if (!existing) {
      const fresh: LoginAttemptRecord = { attempts: 0, lockedUntil: null, lastAttempt: Date.now() };
      this.records.set(key, fresh);
      return fresh;
    }
    // Check if lockout expired
    if (existing.lockedUntil && Date.now() > existing.lockedUntil) {
      existing.attempts = 0;
      existing.lockedUntil = null;
    }
    return existing;
  }

  isLocked(identifier: string): { locked: boolean; remainingSeconds: number } {
    const record = this.getRecord(identifier);
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      return {
        locked: true,
        remainingSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000)
      };
    }
    return { locked: false, remainingSeconds: 0 };
  }

  recordFailure(identifier: string): { locked: boolean; remainingAttempts: number; remainingSeconds: number } {
    const record = this.getRecord(identifier);
    record.attempts += 1;
    record.lastAttempt = Date.now();

    if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      return {
        locked: true,
        remainingAttempts: 0,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000)
      };
    }

    return {
      locked: false,
      remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - record.attempts),
      remainingSeconds: 0
    };
  }

  recordSuccess(identifier: string): void {
    const key = identifier.toLowerCase().trim();
    this.records.delete(key);
  }

  getAllRecords(): Array<{ identifier: string; attempts: number; isLocked: boolean; remainingSeconds: number }> {
    const out = [];
    for (const [id, rec] of this.records.entries()) {
      const isLocked = !!(rec.lockedUntil && Date.now() < rec.lockedUntil);
      const remainingSeconds = isLocked ? Math.ceil((rec.lockedUntil! - Date.now()) / 1000) : 0;
      out.push({
        identifier: id,
        attempts: rec.attempts,
        isLocked,
        remainingSeconds
      });
    }
    return out;
  }
}

export const bruteForceProtector = new BruteForceProtector();

/**
 * Two-Factor Authentication (2FA) Simulator & Generator
 */
export interface TwoFactorDetails {
  secret: string;
  backupCodes: string[];
  qrMockUrl: string;
}

export const generate2FADetails = (username: string): TwoFactorDetails => {
  const secret = Array.from({ length: 16 }, () => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
  ).join('');

  const backupCodes = Array.from({ length: 6 }, () =>
    Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );

  const qrMockUrl = `otpauth://totp/GameWorld:${username}?secret=${secret}&issuer=GameWorld+Nexus`;

  return { secret, backupCodes, qrMockUrl };
};

/**
 * Security Audit Event Interface & Logger
 */
export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  eventType: 
    | 'AUTH_LOGIN_SUCCESS' 
    | 'AUTH_REGISTER_SUCCESS'
    | 'AUTH_LOGIN_FAILED' 
    | 'AUTH_LOCKOUT' 
    | 'AUTH_2FA_CHALLENGE' 
    | 'AUTH_SESSION_EXPIRED' 
    | 'ADMIN_ACTION' 
    | 'ANTISCHEAT_FLAG' 
    | 'RATE_LIMIT_TRIGGERED' 
    | 'PRIVACY_EXPORT' 
    | 'REWARD_VERIFIED';
  actor: string;
  ipAddress: string;
  details: string;
}

const AUDIT_STORAGE_KEY = 'gameverse_security_audit_logs';

class SecurityAuditLogger {
  private logs: SecurityAuditEvent[] = [];

  constructor() {
    this.loadLogs();
    if (this.logs.length === 0) {
      this.seedInitialLogs();
    }
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logs.slice(-100)));
    } catch {
      // storage full fallback
    }
  }

  private seedInitialLogs() {
    this.log({
      severity: 'INFO',
      eventType: 'AUTH_LOGIN_SUCCESS',
      actor: 'Commander_Nexus',
      ipAddress: '192.168.1.104',
      details: 'Super Admin authenticated via dual-factor biometric passkey'
    });
    this.log({
      severity: 'WARN',
      eventType: 'AUTH_LOGIN_FAILED',
      actor: 'unknown_crawler_bot',
      ipAddress: '185.220.101.42',
      details: 'Failed password attempt from flagged Tor exit relay. Brute force lock incremented (3/5)'
    });
    this.log({
      severity: 'INFO',
      eventType: 'ANTISCHEAT_FLAG',
      actor: 'AntiCheat_Engine',
      ipAddress: 'node-edge-fra-01',
      details: 'Game isolation sandbox verified: 52 games sandboxed with restrict-credentials policy'
    });
  }

  log(event: Omit<SecurityAuditEvent, 'id' | 'timestamp'>): SecurityAuditEvent {
    const fullEvent: SecurityAuditEvent = {
      id: 'sec_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...event
    };
    this.logs.unshift(fullEvent);
    if (this.logs.length > 200) this.logs.pop();
    this.saveLogs();
    return fullEvent;
  }

  getLogs(limit = 50): SecurityAuditEvent[] {
    return this.logs.slice(0, limit);
  }

  clear() {
    this.logs = [];
    this.saveLogs();
  }
}

export const securityAuditLogger = new SecurityAuditLogger();
