// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { User } from "./types";

const STORAGE_KEYS = {
  USER: "hak_user",
  REFRESH_TOKEN: "hak_refresh_token",
};

// Legacy keys — removed from localStorage on clear() for migration
const LEGACY_KEYS = ["hak_access_token", "hak_id_token"];

const COGNITO_PROVIDER_PREFIX = "CognitoIdentityServiceProvider";

// In-memory token storage — not persisted to localStorage.
// Prevents XSS from stealing access/id tokens via localStorage.
// Tokens are re-obtained on page load via refresh_token flow.
let memoryAccessToken: string | null = null;
let memoryIdToken: string | null = null;

export const AuthStorage = {
  getUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
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

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  clear(): void {
    memoryAccessToken = null;
    memoryIdToken = null;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

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
