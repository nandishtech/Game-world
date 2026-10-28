import { initDb, getSession, findUserById, sanitizeUser } from '../_db';

const sendJson = (res: any, status: number, payload: any) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
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

    const user = findUserById(session.userId);
    if (!user) {
      return sendJson(res, 404, { error: 'User profile not found.' });
    }

    return sendJson(res, 200, {
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err.message || 'Failed to retrieve session.' });
  }
}
