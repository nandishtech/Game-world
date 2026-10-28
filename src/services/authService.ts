/**
 * Client-Side Authentication Service
 * Interfaces with the /api/auth backend endpoints for real cryptographic password verification,
 * server-side brute-force lockout, and session token management.
 */

const TOKEN_KEY = 'gw_auth_token';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  error?: string;
  locked?: boolean;
  remainingSeconds?: number;
  remainingAttempts?: number;
  captchaRequired?: boolean;
}

class AuthService {
  private inMemoryToken: string | null = null;

  constructor() {
    try {
      this.inMemoryToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch {
      this.inMemoryToken = null;
    }
  }

  public getToken(): string | null {
    if (!this.inMemoryToken) {
      try {
        this.inMemoryToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
      } catch {
        this.inMemoryToken = null;
      }
    }
    return this.inMemoryToken;
  }

  public setToken(token: string) {
    this.inMemoryToken = token;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Ignore storage errors
    }
  }

  public clearToken() {
    this.inMemoryToken = null;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore
    }
  }

  /**
   * Register a new user account with cryptographic password hashing on the backend
   */
  public async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data: AuthResponse = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  /**
   * Log in verifying the actual password cryptographically
   */
  public async login(identifier: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    const data: AuthResponse = await res.json();
    if (!res.ok || !data.success) {
      const err: any = new Error(data.error || 'Authentication failed');
      err.locked = data.locked;
      err.remainingSeconds = data.remainingSeconds;
      err.remainingAttempts = data.remainingAttempts;
      err.captchaRequired = data.captchaRequired;
      throw err;
    }

    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  /**
   * Verify session token and retrieve current authenticated profile
   */
  public async getMe(): Promise<any | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        this.clearToken();
        return null;
      }

      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  }

  /**
   * Update authenticated user profile
   */
  public async updateProfile(updates: any): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update profile');
    }

    return data.user;
  }

  /**
   * Logout and invalidate session
   */
  public async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {}
    }
    this.clearToken();
  }
}

export const authService = new AuthService();
