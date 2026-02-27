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

interface ParseIdTokenOptions {
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
function hasRequiredClaims(payload: Record<string, unknown>): boolean {
  if (!payload.sub || typeof payload.sub !== "string") {return false;}
  if (payload.exp && Date.now() / 1000 > (payload.exp as number)) {return false;}
  return typeof payload.email === "string";
}

function matchesExpected(payload: Record<string, unknown>, options?: ParseIdTokenOptions): boolean {
  if (options?.expectedIssuer && payload.iss !== options.expectedIssuer) {return false;}
  if (options?.expectedAudience && payload.aud !== options.expectedAudience) {return false;}
  return true;
}

export function parseIdToken(idToken: string, options?: ParseIdTokenOptions): User | null {
  const payload = decodeJwtPayload(idToken);
  if (!payload || !hasRequiredClaims(payload) || !matchesExpected(payload, options)) {return null;}
  const email = payload.email as string;
  return {
    id: payload.sub as string, email,
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
