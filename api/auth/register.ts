import type { IncomingMessage, ServerResponse } from 'http';
import { initDb, createUser, createSession, sanitizeUser, checkBruteForce } from '../_db';

const parseBody = async (req: any): Promise<any> => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  if (req.readableEnded) return {};

  return new Promise((resolve) => {
    let data = '';
    const timeout = setTimeout(() => resolve({}), 800);
    req.on('data', (chunk: any) => { data += chunk; });
    req.on('end', () => {
      clearTimeout(timeout);
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', () => {
      clearTimeout(timeout);
      resolve({});
    });
  });
};

const sendJson = (res: any, status: number, payload: any) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  try {
    await initDb();
    const body = await parseBody(req);
    const { username, email, password } = body;

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const bruteStatus = checkBruteForce(String(ip));
    if (bruteStatus.locked) {
      return sendJson(res, 429, { 
        error: `Too many requests. Please wait ${bruteStatus.remainingSeconds} seconds.`,
        remainingSeconds: bruteStatus.remainingSeconds
      });
    }

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return sendJson(res, 400, { error: 'Username must be at least 3 characters long.' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return sendJson(res, 400, { error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return sendJson(res, 400, { error: 'Password must be at least 8 characters long.' });
    }

    // Complexity verification: uppercase, lowercase, digit, symbol
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
      return sendJson(res, 400, {
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special symbol.'
      });
    }

    const newUser = await createUser(username.trim(), email.trim(), password);
    const session = createSession(newUser.id, String(ip), req.headers['user-agent'] || '');

    return sendJson(res, 201, {
      success: true,
      message: 'Account successfully registered.',
      token: session.token,
      user: sanitizeUser(newUser)
    });
  } catch (err: any) {
    const status = err.message && err.message.includes('already exists') ? 409 : 400;
    return sendJson(res, status, { error: err.message || 'Registration failed' });
  }
}
