import type { User } from './types';

const AUTH_STORAGE_KEY = 'hak_auth';

export const AuthStorage = {
  getUser(): User | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      this.clear();
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },

  clear(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
