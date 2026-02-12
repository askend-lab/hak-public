// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { User } from "./types";

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Parse JWT id_token payload. Note: signature verification is not performed client-side
 * because tokens are obtained directly from Cognito over HTTPS. Server-side APIs should
 * verify tokens independently using Cognito's JWKS endpoint.
 */
export function parseIdToken(idToken: string): User | null {
  const payload = decodeJwtPayload(idToken);
  if (!payload) return null;

  // Validate required claims
  if (!payload.sub || typeof payload.sub !== "string") return null;
  if (payload.exp && Date.now() / 1000 > (payload.exp as number)) return null;

  return {
    id: payload.sub,
    email: payload.email as string,
    name: (payload.name as string) ?? (payload.email as string)?.split("@")[0],
  };
}

export function isTokenExpired(
  token: string,
  bufferSeconds = 300,
): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const exp = payload.exp as number | undefined;
  if (!exp) return true;
  return Date.now() / 1000 > exp - bufferSeconds;
}
