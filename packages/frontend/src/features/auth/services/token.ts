// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { logger } from "@hak/shared";
import type { User } from "./types";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {return null;}
    return JSON.parse(atob(parts[1]));
  } catch (error) {
    logger.warn("Failed to decode JWT payload:", error);
    return null;
  }
}

export interface ParseIdTokenOptions {
  expectedIssuer?: string;
  expectedAudience?: string;
}

/**
 * Parse JWT id_token payload. Note: signature verification is not performed client-side
 * because tokens are obtained directly from Cognito over HTTPS. Server-side APIs should
 * verify tokens independently using Cognito's JWKS endpoint.
 *
 * When expectedIssuer/expectedAudience are provided, rejects tokens from other pools/apps.
 */
export function parseIdToken(idToken: string, options?: ParseIdTokenOptions): User | null { // eslint-disable-line complexity -- token validation has many conditional checks
  const payload = decodeJwtPayload(idToken);
  if (!payload) {return null;}

  // Validate required claims
  if (!payload.sub || typeof payload.sub !== "string") {return null;}
  if (payload.exp && Date.now() / 1000 > (payload.exp as number)) {return null;}

  // Validate issuer (Cognito User Pool URL)
  if (options?.expectedIssuer && payload.iss !== options.expectedIssuer) {return null;}

  // Validate audience (Cognito Client ID)
  if (options?.expectedAudience && payload.aud !== options.expectedAudience) {return null;}

  const email = typeof payload.email === "string" ? payload.email : undefined;
  if (!email) {return null;}

  return {
    id: payload.sub,
    email,
    name: typeof payload.name === "string" ? payload.name : (email.split("@")[0] ?? email),
  };
}

const TOKEN_EXPIRY_BUFFER_SECONDS = 300;

export function isTokenExpired(
  token: string,
  bufferSeconds = TOKEN_EXPIRY_BUFFER_SECONDS,
): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) {return true;}
  const exp = payload.exp as number | undefined;
  if (!exp) {return true;}
  return Date.now() / 1000 > exp - bufferSeconds;
}
