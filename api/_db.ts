import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface UserRecord {
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

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  ip: string;
  userAgent: string;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}

// In-memory caching layer
const usersCache: Map<string, UserRecord> = new Map(); // key: userId
const emailIndex: Map<string, string> = new Map(); // key: lowercase email -> userId
const usernameIndex: Map<string, string> = new Map(); // key: lowercase username -> userId
const sessions: Map<string, SessionRecord> = new Map(); // key: token -> SessionRecord
const bruteForceMap: Map<string, AttemptRecord> = new Map(); // key: ip or identifier -> AttemptRecord

// Determine writable persistence path safely
const getDbFilePath = (): string => {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'gameworld_users.json');
  }
  try {
    const scratchDir = path.join(process.cwd(), 'scratch');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    return path.join(scratchDir, 'gameworld_users.json');
  } catch {
    return path.join('/tmp', 'gameworld_users.json');
  }
};

// Load saved users on startup
let isInitialized = false;
export const initDb = async () => {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const dbPath = getDbFilePath();
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (Array.isArray(data)) {
        for (const u of data) {
          usersCache.set(u.id, u);
          emailIndex.set(u.email.toLowerCase(), u.id);
          usernameIndex.set(u.username.toLowerCase(), u.id);
        }
      }
    }
  } catch (err) {
    console.error('Failed to load user database from disk:', err);
  }

  // If database is empty, seed a default demo account with secure hashed password
  if (usersCache.size === 0) {
    const salt = generateSalt();
    const hash = await hashPassword('GameWorld2026!', salt);
    const demoUser: UserRecord = {
      id: 'usr_commander_01',
      username: 'CommanderPilot',
      email: 'pilot@gameworld.io',
      displayName: 'Commander Pilot',
      salt,
      passwordHash: hash,
      role: 'USER',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CommanderPilot',
      bio: 'Ace Pilot of the Game World platform. Ready for battle.',
      country: 'Global Node',
      age: 21,
      level: 1,
      xp: 0,
      coins: 0,
      stats: { wins: 0, losses: 0, rank: 0, hoursPlayed: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    usersCache.set(demoUser.id, demoUser);
    emailIndex.set(demoUser.email.toLowerCase(), demoUser.id);
    usernameIndex.set(demoUser.username.toLowerCase(), demoUser.id);
    persistDb();
  }
};

const persistDb = () => {
  try {
    const dbPath = getDbFilePath();
    const arr = Array.from(usersCache.values());
    fs.writeFileSync(dbPath, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist user database:', err);
  }
};

// Cryptographic Salt Generation
export const generateSalt = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// PBKDF2 Password Hashing (100,000 iterations, 64-byte key)
export const hashPassword = (password: string, salt: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });
};

// Constant-Time Password Verification
export const verifyPassword = async (password: string, salt: string, expectedHash: string): Promise<boolean> => {
  try {
    const computedHash = await hashPassword(password, salt);
    const a = Buffer.from(computedHash, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

// Session Management
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const createSession = (userId: string, ip = '127.0.0.1', userAgent = ''): SessionRecord => {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: SessionRecord = {
    token,
    userId,
    createdAt: now,
    expiresAt: now + SESSION_TTL,
    ip,
    userAgent
  };
  sessions.set(token, session);
  return session;
};

export const getSession = (token: string): SessionRecord | null => {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
};

export const deleteSession = (token: string) => {
  sessions.delete(token);
};

// Brute-force protection: 5 failures = 15m lockout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 mins

export const checkBruteForce = (key: string): { locked: boolean; remainingSeconds: number; captchaRequired: boolean } => {
  const record = bruteForceMap.get(key);
  if (!record) return { locked: false, remainingSeconds: 0, captchaRequired: false };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { locked: true, remainingSeconds, captchaRequired: true };
  }

  // Lockout expired
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    bruteForceMap.delete(key);
    return { locked: false, remainingSeconds: 0, captchaRequired: false };
  }

  return { 
    locked: false, 
    remainingSeconds: 0, 
    captchaRequired: record.count >= 3 
  };
};

export const recordFailedAttempt = (key: string): { locked: boolean; remainingAttempts: number; remainingSeconds: number } => {
  const now = Date.now();
  const record = bruteForceMap.get(key) || { count: 0, firstAttempt: now, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_TIME_MS;
    bruteForceMap.set(key, record);
    return { locked: true, remainingAttempts: 0, remainingSeconds: Math.ceil(LOCKOUT_TIME_MS / 1000) };
  }

  bruteForceMap.set(key, record);
  return { 
    locked: false, 
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.count), 
    remainingSeconds: 0 
  };
};

export const resetBruteForce = (key: string) => {
  bruteForceMap.delete(key);
};

// User Operations
export const findUserByEmail = (email: string): UserRecord | undefined => {
  const id = emailIndex.get(email.toLowerCase());
  return id ? usersCache.get(id) : undefined;
};

export const findUserByUsername = (username: string): UserRecord | undefined => {
  const id = usernameIndex.get(username.toLowerCase());
  return id ? usersCache.get(id) : undefined;
};

export const findUserByIdentifier = (identifier: string): UserRecord | undefined => {
  const clean = identifier.trim().toLowerCase();
  const byEmail = emailIndex.get(clean);
  if (byEmail) return usersCache.get(byEmail);
  const byUsername = usernameIndex.get(clean);
  if (byUsername) return usersCache.get(byUsername);
  return undefined;
};

export const findUserById = (id: string): UserRecord | undefined => {
  return usersCache.get(id);
};

export const createUser = async (username: string, email: string, password: string): Promise<UserRecord> => {
  await initDb();

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  if (emailIndex.has(cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }
  if (usernameIndex.has(cleanUsername.toLowerCase())) {
    throw new Error('This username is already taken by another commander.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  // Fresh user starts strictly at level 1 with 0 stats
  const newUser: UserRecord = {
    id,
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
    level: 1,
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

  usersCache.set(newUser.id, newUser);
  emailIndex.set(newUser.email.toLowerCase(), newUser.id);
  usernameIndex.set(newUser.username.toLowerCase(), newUser.id);

  persistDb();
  return newUser;
};

export const updateUserProfile = (userId: string, updates: Partial<UserRecord>): UserRecord => {
  const user = usersCache.get(userId);
  if (!user) throw new Error('User not found');

  const updated: UserRecord = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  usersCache.set(userId, updated);
  persistDb();
  return updated;
};

// Sanitized profile safe for client consumption (never exposes salt or passwordHash)
export const sanitizeUser = (user: UserRecord) => {
  const { salt, passwordHash, ...safe } = user;
  return safe;
};
