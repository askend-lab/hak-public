// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { AuthState } from './types';

export const STATE_COOKIE_NAME = 'tara_auth_state';
export const REFRESH_COOKIE_NAME = 'hak_refresh_token';
export const ACCESS_TOKEN_COOKIE_NAME = 'hak_access_token';
export const ID_TOKEN_COOKIE_NAME = 'hak_id_token';

export const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const REFRESH_TOKEN_MAX_AGE_S = 30 * 24 * 60 * 60; // 30 days
export const SHORT_TOKEN_MAX_AGE_S = 3600; // 1 hour
export const TOKEN_COOKIE_OPTIONS = 'HttpOnly; Secure; SameSite=Lax; Path=/';

export function getCookieDomain(): string {
  const url = new URL(getFrontendUrl());
  return url.hostname;
}

export function createStateCookie(state: AuthState): string {
  const domain = getCookieDomain();
  const encoded = Buffer.from(JSON.stringify(state)).toString('base64url');
  return `${STATE_COOKIE_NAME}=${encoded}; HttpOnly; Secure; SameSite=Lax; Domain=${domain}; Max-Age=600; Path=/`;
}

export function parseStateCookie(cookieHeader: string | undefined): AuthState | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const stateCookie = cookies.find(c => c.startsWith(`${STATE_COOKIE_NAME}=`));
  
  if (!stateCookie) return null;

  try {
    const encoded = stateCookie.split('=')[1];
    const decoded = Buffer.from(encoded, 'base64url').toString('utf-8');
    return JSON.parse(decoded) as AuthState;
  } catch {
    return null;
  }
}

export function clearStateCookie(): string {
  return `${STATE_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
}

export function createRefreshCookie(refreshToken: string): string {
  const domain = getCookieDomain();
  return `${REFRESH_COOKIE_NAME}=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Domain=${domain}; Path=/; Max-Age=${REFRESH_TOKEN_MAX_AGE_S}`;
}

export function clearRefreshCookie(): string {
  const domain = getCookieDomain();
  return `${REFRESH_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Domain=${domain}; Path=/; Max-Age=0`;
}

export function parseRefreshCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const found = cookies.find(c => c.startsWith(`${REFRESH_COOKIE_NAME}=`));
  if (!found) return null;
  const value = found.substring(REFRESH_COOKIE_NAME.length + 1);
  return value || null;
}

export function createAccessTokenCookie(token: string): string {
  const domain = getCookieDomain();
  // Not HttpOnly — frontend needs to read for Authorization header.
  // Short-lived (1h); refresh_token stays HttpOnly.
  return `${ACCESS_TOKEN_COOKIE_NAME}=${token}; Secure; SameSite=Lax; Domain=${domain}; Path=/; Max-Age=${SHORT_TOKEN_MAX_AGE_S}`;
}

export function createIdTokenCookie(token: string): string {
  const domain = getCookieDomain();
  // Not HttpOnly — frontend needs to read for user info extraction.
  // Short-lived (1h); refresh_token stays HttpOnly.
  return `${ID_TOKEN_COOKIE_NAME}=${token}; Secure; SameSite=Lax; Domain=${domain}; Path=/; Max-Age=${SHORT_TOKEN_MAX_AGE_S}`;
}

// Re-used by cookies and handlers — kept here to avoid circular deps
export function getFrontendUrl(): string {
  const stage = process.env.STAGE || 'dev';
  return stage === 'prod'
    ? process.env.FRONTEND_URL_PROD || DEFAULT_FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_DEV || DEFAULT_FRONTEND_URL_DEV;
}

export const DEFAULT_FRONTEND_URL_PROD = 'https://hak.askend-lab.com';
export const DEFAULT_FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
