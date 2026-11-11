// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

// Re-export everything from cookies and middleware for backward compatibility
export {
  STATE_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_NAME,
  ID_TOKEN_COOKIE_NAME,
  STATE_TTL_MS,
  REFRESH_TOKEN_MAX_AGE_S,
  SHORT_TOKEN_MAX_AGE_S,
  TOKEN_COOKIE_OPTIONS,
  DEFAULT_FRONTEND_URL_PROD,
  DEFAULT_FRONTEND_URL_DEV,
  getFrontendUrl,
  getCookieDomain,
  createStateCookie,
  parseStateCookie,
  clearStateCookie,
  createRefreshCookie,
  clearRefreshCookie,
  parseRefreshCookie,
  createAccessTokenCookie,
  createIdTokenCookie,
} from './cookies';

export {
  AUTH_CALLBACK_PATH,
  RANDOM_STRING_LENGTH,
  MAX_BODY_SIZE,
  generateRandomString,
  corsResponseHeaders,
  validateCsrfOrigin,
} from './middleware';
