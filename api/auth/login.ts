import { initDb, findUserByIdentifier, verifyPassword, createSession, sanitizeUser, checkBruteForce, recordFailedAttempt, resetBruteForce } from '../_db';

const parseBody = (req: any): Promise<any> => {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    if (typeof req.body === 'string') {
      try { return resolve(JSON.parse(req.body)); } catch { return resolve({}); }
    }
    let data = '';
    req.on('data', (chunk: any) => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
  });
};

const sendJson = (res: any, status: number, payload: any) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default async function handler(req: any, res: any) {
  // CORS
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
    const identifier = body.identifier || body.email || body.username;
    const password = body.password;

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const bruteKey = `${ip}_${String(identifier).toLowerCase()}`;

    // 1. Check brute force lockout
    const bruteStatus = checkBruteForce(bruteKey);
    if (bruteStatus.locked) {
      return sendJson(res, 429, {
        error: `Account security lockout active due to repeated failed logins. Please retry in ${bruteStatus.remainingSeconds} seconds.`,
        locked: true,
        remainingSeconds: bruteStatus.remainingSeconds,
        captchaRequired: true
      });
    }

    if (!identifier || !password) {
      return sendJson(res, 400, { error: 'Please enter your username/email and password.' });
    }

    // 2. Find user in database
    const user = findUserByIdentifier(String(identifier));
    if (!user) {
      const fail = recordFailedAttempt(bruteKey);
      return sendJson(res, 401, {
        error: 'Invalid credentials: No account found matching this username or email.',
        remainingAttempts: fail.remainingAttempts,
        captchaRequired: fail.remainingAttempts <= 2
      });
    }

    // 3. Verify actual password cryptographically
    const isPasswordValid = await verifyPassword(password, user.salt, user.passwordHash);
    if (!isPasswordValid) {
      const fail = recordFailedAttempt(bruteKey);
      if (fail.locked) {
        return sendJson(res, 429, {
          error: `Incorrect password. Account locked for 15 minutes due to multiple failed attempts.`,
          locked: true,
          remainingSeconds: fail.remainingSeconds,
          captchaRequired: true
        });
      }
      return sendJson(res, 401, {
        error: `Incorrect password. Please verify your credentials (${fail.remainingAttempts} attempts remaining).`,
        remainingAttempts: fail.remainingAttempts,
        captchaRequired: fail.remainingAttempts <= 2
      });
    }

    // 4. Success: Reset brute force counter and create session
    resetBruteForce(bruteKey);
    const session = createSession(user.id, String(ip), req.headers['user-agent'] || '');

    return sendJson(res, 200, {
      success: true,
      message: 'Authentication successful.',
      token: session.token,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err.message || 'Internal authentication error.' });
  }
}
