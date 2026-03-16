// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { User } from "./types";

/**
 * Parse JWT id_token payload. Note: signature verification is not performed client-side
 * because tokens are obtained directly from Cognito over HTTPS. Server-side APIs should
 * verify tokens independently using Cognito's JWKS endpoint.
 */
export function parseIdToken(idToken: string): User | null {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const payload = JSON.parse(atob(parts[1]));

    // Validate required claims
    if (!payload.sub || typeof payload.sub !== "string") return null;
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email?.split("@")[0],
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(
  token: string,
  bufferSeconds = 300,
): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return true;
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    if (!exp) return true;
    return Date.now() / 1000 > exp - bufferSeconds;
  } catch {
    return true;
  }
}
