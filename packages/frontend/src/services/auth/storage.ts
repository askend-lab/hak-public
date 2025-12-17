import type { User } from './types';

// Memory-only storage (no localStorage needed)
let currentUser: User | null = null;

export const AuthStorage = {
  getUser(): User | null {
    return currentUser;
  },

  setUser(user: User): void {
    currentUser = user;
  },

  clear(): void {
    currentUser = null;
  },
};
