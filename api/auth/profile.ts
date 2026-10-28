import { initDb, getSession, findUserById, updateUserProfile, sanitizeUser } from '../_db';

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'PUT' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use PUT or POST.' });
  }

  try {
    await initDb();
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return sendJson(res, 401, { error: 'Authentication token missing.' });
    }

    const session = getSession(token);
    if (!session) {
      return sendJson(res, 401, { error: 'Session expired or invalid.' });
    }

    const body = await parseBody(req);
    const allowedUpdates: any = {};

    if (body.displayName && typeof body.displayName === 'string') {
      allowedUpdates.displayName = body.displayName.trim();
    }
    if (body.bio !== undefined && typeof body.bio === 'string') {
      allowedUpdates.bio = body.bio.trim();
    }
    if (body.country && typeof body.country === 'string') {
      allowedUpdates.country = body.country.trim();
    }
    if (body.age !== undefined) {
      const numAge = Number(body.age);
      if (!isNaN(numAge) && numAge >= 5 && numAge <= 120) {
        allowedUpdates.age = numAge;
      }
    }
    if (body.avatarUrl && typeof body.avatarUrl === 'string') {
      allowedUpdates.avatarUrl = body.avatarUrl;
    }
    if (body.level !== undefined && typeof body.level === 'number') {
      allowedUpdates.level = body.level;
    }
    if (body.xp !== undefined && typeof body.xp === 'number') {
      allowedUpdates.xp = body.xp;
    }
    if (body.coins !== undefined && typeof body.coins === 'number') {
      allowedUpdates.coins = body.coins;
    }
    if (body.stats && typeof body.stats === 'object') {
      allowedUpdates.stats = body.stats;
    }

    const updated = updateUserProfile(session.userId, allowedUpdates);

    return sendJson(res, 200, {
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizeUser(updated)
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err.message || 'Failed to update profile.' });
  }
}
