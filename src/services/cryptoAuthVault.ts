/**
 * Client-Side Cryptographic Vault & Authentication Engine
 * Implements hardware-accelerated W3C Web Cryptography API (PBKDF2 SHA-256 with 100,000 iterations).
 * Enforces real password verification, cryptographic salting, brute-force lockout, and sanitized user profiles.
 */

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  salt: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  avatarUrl: string;
  bio: string;
  country: string;
  age: number;
  level: number;
  xp: number;
  coins: number;
  stats: {
    wins: number;
    losses: number;
    rank: number;
    hoursPlayed: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}

const VAULT_USERS_KEY = 'gw_vault_users_v2';
const VAULT_ATTEMPTS_KEY = 'gw_vault_attempts_v2';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 mins

class CryptoAuthVault {
  private getCrypto(): Crypto {
    if (typeof window !== 'undefined' && window.crypto) {
      return window.crypto;
    }
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      return globalThis.crypto;
    }
    throw new Error('Web Cryptography API is not supported in this environment.');
  }

  // Convert ArrayBuffer to Hex String
  private bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Convert Hex String to Uint8Array
  private hexToBuf(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  // Generate 16-byte Cryptographic Salt
  public generateSalt(): string {
    const crypto = this.getCrypto();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return this.bufToHex(salt.buffer);
  }

  // Hash Password using PBKDF2 (SHA-256, 100,000 iterations)
  public async hashPassword(password: string, saltHex: string): Promise<string> {
    const crypto = this.getCrypto();
    const enc = new TextEncoder();
    const saltBuf = this.hexToBuf(saltHex);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuf.buffer as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 256 bits = 32 bytes
    );

    return this.bufToHex(derivedBits);
  }

  // Constant-time password verification
  public async verifyPassword(password: string, saltHex: string, expectedHash: string): Promise<boolean> {
    try {
      const computedHash = await this.hashPassword(password, saltHex);
      if (computedHash.length !== expectedHash.length) return false;

      // Constant-time bitwise check to prevent timing side-channel attacks
      let result = 0;
      for (let i = 0; i < computedHash.length; i++) {
        result |= computedHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
      }
      return result === 0;
    } catch {
      return false;
    }
  }

  // Load all registered users from secure vault
  public getUsers(): Record<string, StoredUser> {
    try {
      const raw = localStorage.getItem(VAULT_USERS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }

    // Initialize with default demo account
    const initialUsers: Record<string, StoredUser> = {};
    return initialUsers;
  }

  // Save users to secure vault
  public saveUsers(users: Record<string, StoredUser>): void {
    try {
      localStorage.setItem(VAULT_USERS_KEY, JSON.stringify(users));
    } catch {
      // Ignore
    }
  }

  // Check Brute Force Lockout Status
  public checkLockout(key: string): { locked: boolean; remainingSeconds: number; captchaRequired: boolean } {
    try {
      const raw = sessionStorage.getItem(VAULT_ATTEMPTS_KEY) || localStorage.getItem(VAULT_ATTEMPTS_KEY);
      const map: Record<string, AttemptRecord> = raw ? JSON.parse(raw) : {};
      const record = map[key.toLowerCase()];

      if (!record) {
        return { locked: false, remainingSeconds: 0, captchaRequired: false };
      }

      const now = Date.now();
      if (record.lockedUntil > now) {
        const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
        return { locked: true, remainingSeconds, captchaRequired: true };
      }

      if (record.lockedUntil > 0 && record.lockedUntil <= now) {
        delete map[key.toLowerCase()];
        sessionStorage.setItem(VAULT_ATTEMPTS_KEY, JSON.stringify(map));
        return { locked: false, remainingSeconds: 0, captchaRequired: false };
      }

      return {
        locked: false,
        remainingSeconds: 0,
        captchaRequired: record.count >= 3
      };
    } catch {
      return { locked: false, remainingSeconds: 0, captchaRequired: false };
    }
  }

  // Record Failed Login Attempt
  public recordFailure(key: string): { locked: boolean; remainingAttempts: number; remainingSeconds: number } {
    try {
      const raw = sessionStorage.getItem(VAULT_ATTEMPTS_KEY) || localStorage.getItem(VAULT_ATTEMPTS_KEY);
      const map: Record<string, AttemptRecord> = raw ? JSON.parse(raw) : {};
      const cleanKey = key.toLowerCase();
      const now = Date.now();
      const record = map[cleanKey] || { count: 0, firstAttempt: now, lockedUntil: 0 };
      record.count += 1;

      if (record.count >= MAX_FAILED_ATTEMPTS) {
        record.lockedUntil = now + LOCKOUT_TIME_MS;
        map[cleanKey] = record;
        sessionStorage.setItem(VAULT_ATTEMPTS_KEY, JSON.stringify(map));
        localStorage.setItem(VAULT_ATTEMPTS_KEY, JSON.stringify(map));
        return {
          locked: true,
          remainingAttempts: 0,
          remainingSeconds: Math.ceil(LOCKOUT_TIME_MS / 1000)
        };
      }

      map[cleanKey] = record;
      sessionStorage.setItem(VAULT_ATTEMPTS_KEY, JSON.stringify(map));
      return {
        locked: false,
        remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.count),
        remainingSeconds: 0
      };
    } catch {
      return { locked: false, remainingAttempts: 3, remainingSeconds: 0 };
    }
  }

  // Reset Lockout upon Successful Login
  public resetFailure(key: string): void {
    try {
      const raw = sessionStorage.getItem(VAULT_ATTEMPTS_KEY) || localStorage.getItem(VAULT_ATTEMPTS_KEY);
      if (raw) {
        const map = JSON.parse(raw);
        delete map[key.toLowerCase()];
        sessionStorage.setItem(VAULT_ATTEMPTS_KEY, JSON.stringify(map));
        localStorage.setItem(VAULT_ATTEMPTS_KEY, JSON.stringify(map));
      }
    } catch {}
  }

  // Register New User in Cryptographic Vault
  public async register(username: string, email: string, password: string): Promise<StoredUser> {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const users = this.getUsers();

    // Check duplicate username or email
    for (const u of Object.values(users)) {
      if (u.username.toLowerCase() === cleanUsername.toLowerCase()) {
        throw new Error('This callsign / username is already taken by another commander.');
      }
      if (u.email.toLowerCase() === cleanEmail) {
        throw new Error('An account with this email address already exists. Please sign in.');
      }
    }

    const salt = this.generateSalt();
    const passwordHash = await this.hashPassword(password, salt);

    const now = new Date().toISOString();
    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      username: cleanUsername,
      displayName: cleanUsername,
      email: cleanEmail,
      salt,
      passwordHash,
      role: 'USER',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
      bio: 'New explorer in the Game World universe. Competing and climbing ranks.',
      country: 'Global Node',
      age: 18,
      level: 1, // Starts at 0 XP and level 1
      xp: 0,
      coins: 0,
      stats: {
        wins: 0,
        losses: 0,
        rank: 0,
        hoursPlayed: 0
      },
      createdAt: now,
      updatedAt: now
    };

    users[newUser.id] = newUser;
    // Also index by email and username for O(1) lookup
    users[cleanEmail] = newUser;
    users[cleanUsername.toLowerCase()] = newUser;

    this.saveUsers(users);
    return newUser;
  }

  // Authenticate Existing User with Real Password Verification
  public async login(identifier: string, password: string): Promise<StoredUser> {
    const cleanId = identifier.trim().toLowerCase();

    // Check lockout first
    const lockStatus = this.checkLockout(cleanId);
    if (lockStatus.locked) {
      const err: any = new Error(
        `Account security lockout active due to repeated failed logins. Please retry in ${lockStatus.remainingSeconds}s.`
      );
      err.locked = true;
      err.remainingSeconds = lockStatus.remainingSeconds;
      err.captchaRequired = true;
      throw err;
    }

    const users = this.getUsers();
    const user = users[cleanId];

    if (!user) {
      const fail = this.recordFailure(cleanId);
      const err: any = new Error('Invalid credentials: No account found matching this username or email.');
      err.remainingAttempts = fail.remainingAttempts;
      err.captchaRequired = fail.remainingAttempts <= 2;
      throw err;
    }

    // Verify Password Cryptographically
    const isValid = await this.verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      const fail = this.recordFailure(cleanId);
      if (fail.locked) {
        const err: any = new Error('Incorrect password. Account locked for 15 minutes due to multiple failed attempts.');
        err.locked = true;
        err.remainingSeconds = fail.remainingSeconds;
        err.captchaRequired = true;
        throw err;
      }
      const err: any = new Error(
        `Incorrect password. Please verify your credentials (${fail.remainingAttempts} attempts remaining).`
      );
      err.remainingAttempts = fail.remainingAttempts;
      err.captchaRequired = fail.remainingAttempts <= 2;
      throw err;
    }

    // Reset failure counter on success
    this.resetFailure(cleanId);
    return user;
  }

  // Sanitize user profile (removes salt & passwordHash)
  public sanitize(user: StoredUser) {
    const { salt, passwordHash, ...safe } = user;
    return safe;
  }
}

export const cryptoAuthVault = new CryptoAuthVault();
