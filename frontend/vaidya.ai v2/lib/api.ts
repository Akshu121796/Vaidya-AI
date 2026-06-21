/**
 * lib/api.ts
 * Central API client for Vaidya.AI Frontend
 * Automatically injects JWT token into every authenticated request
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Token Management ─────────────────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vaidya_token');
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vaidya_token', token);
  }
};

export const clearToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vaidya_token');
    localStorage.removeItem('vaidya_user');
  }
};

// ── Core Fetch Wrapper ───────────────────────────────────────────────────────
async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({ message: 'Server error', success: false }));

  if (!res.ok) {
    const errorMsg = json.message || 
                     (json.error && typeof json.error === 'object' ? json.error.message : json.error) || 
                     `Request failed: ${res.status}`;
    throw new Error(errorMsg);
  }

  return json as T;
}

// ── Public convenience methods ───────────────────────────────────────────────
export const api = {
  get: <T = unknown>(path: string, requiresAuth = true) =>
    apiFetch<T>(path, { method: 'GET' }, requiresAuth),

  post: <T = unknown>(path: string, body: unknown, requiresAuth = true) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }, requiresAuth),

  put: <T = unknown>(path: string, body: unknown, requiresAuth = true) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }, requiresAuth),

  delete: <T = unknown>(path: string, requiresAuth = true) =>
    apiFetch<T>(path, { method: 'DELETE' }, requiresAuth),

  /**
   * For multipart/form-data (voice upload)
   * No Content-Type header — browser sets it with boundary automatically
   */
  postMultipart: async <T = unknown>(path: string, formData: FormData): Promise<T> => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json().catch(() => ({ message: 'Server error', success: false }));
    if (!res.ok) {
      const errorMsg = json.message || 
                       (json.error && typeof json.error === 'object' ? json.error.message : json.error) || 
                       `Request failed: ${res.status}`;
      throw new Error(errorMsg);
    }
    return json as T;
  },
};

export default api;
