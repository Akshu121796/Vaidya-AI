/**
 * lib/auth.ts
 * Authentication helpers for Vaidya.AI Frontend
 * Wraps real backend API calls for login, register, getMe
 */

import api, { setToken, clearToken, getToken } from './api';

// ── Types matching backend response ─────────────────────────────────────────
export interface BackendUser {
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'patient' | 'doctor' | 'asha' | 'pharmacy' | 'admin';
  is_active: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: BackendUser;
    token: string;
  };
}

export interface RegisterInput {
  name: string;
  phone: string;
  password: string;
  role: 'patient' | 'doctor' | 'asha' | 'pharmacy' | 'admin';
  villageId?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  gender?: string;
  allergies?: string[];
}

// ── Auth API Functions ────────────────────────────────────────────────────────
export const authApi = {
  /**
   * Login with phone + password. Returns user + JWT token.
   * Automatically stores token in localStorage.
   */
  login: async (phone: string, password: string): Promise<BackendUser> => {
    const res = await api.post<LoginResponse>('/api/auth/login', { phone, password }, false);
    setToken(res.data.token);
    // Cache user in localStorage for quick re-hydration
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaidya_user', JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  /**
   * Register a new user. Returns user + JWT.
   */
  register: async (input: RegisterInput): Promise<BackendUser> => {
    const res = await api.post<LoginResponse>('/api/auth/register', input, false);
    setToken(res.data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaidya_user', JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  /**
   * Get current user from token. Used to re-hydrate session on page load.
   */
  getMe: async (): Promise<BackendUser | null> => {
    try {
      const res = await api.get<{ success: boolean; data: { user: BackendUser } }>('/api/auth/me');
      return res.data.user;
    } catch {
      return null;
    }
  },

  /**
   * Logout — clear token + cached user
   */
  logout: (): void => {
    clearToken();
  },

  /**
   * Check if user is currently logged in (has token)
   */
  isLoggedIn: (): boolean => {
    return !!getToken();
  },

  /**
   * Get cached user from localStorage (faster than API call)
   */
  getCachedUser: (): BackendUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('vaidya_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};

export default authApi;
