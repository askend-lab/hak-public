// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { User } from "./types";

const STORAGE_KEYS = {
  USER: "hak_user",
  ACCESS_TOKEN: "hak_access_token",
  ID_TOKEN: "hak_id_token",
  REFRESH_TOKEN: "hak_refresh_token",
};

const COGNITO_PROVIDER_PREFIX = "CognitoIdentityServiceProvider";

export const AuthStorage = {
  getUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getIdToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ID_TOKEN);
  },

  setIdToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ID_TOKEN, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

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
