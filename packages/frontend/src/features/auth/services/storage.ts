// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { User } from "./types";

const STORAGE_KEYS = {
  USER: "hak_user",
};

// Legacy keys — removed from localStorage on clear() for migration
const LEGACY_KEYS = ["hak_access_token", "hak_id_token", "hak_refresh_token"];

const COGNITO_PROVIDER_PREFIX = "CognitoIdentityServiceProvider";

// In-memory token storage — not persisted to localStorage.
// Prevents XSS from stealing tokens via localStorage.
// Access/id tokens are re-obtained on page load via refresh_token flow.
//
// Refresh token is stored in an httpOnly cookie set by the auth backend.
// It never touches JavaScript — the backend /tara/refresh endpoint reads
// it from the cookie and returns new access/id tokens.
let memoryAccessToken: string | null = null;
let memoryIdToken: string | null = null;

export const AuthStorage = {
  getUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getAccessToken(): string | null {
    return memoryAccessToken;
  },

  setAccessToken(token: string): void {
    memoryAccessToken = token;
  },

  getIdToken(): string | null {
    return memoryIdToken;
  },

  setIdToken(token: string): void {
    memoryIdToken = token;
  },

  clear(): void {
    memoryAccessToken = null;
    memoryIdToken = null;
    localStorage.removeItem(STORAGE_KEYS.USER);

    // Clean up legacy keys from previous localStorage-based storage
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(COGNITO_PROVIDER_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};
