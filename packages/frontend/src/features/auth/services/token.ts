// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { logger } from "@hak/shared";
import type { User } from "./types";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {return null;}
    const bytes = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
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
function buildDisplayName(givenName: unknown, familyName: unknown): string | undefined {
  const parts = [givenName, familyName].filter((p): p is string => typeof p === "string" && p.length > 0);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

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

function resolveDisplayName(payload: Record<string, unknown>, email: string): string | undefined {
  if (typeof payload.name === "string") {return payload.name;}
  const composed = buildDisplayName(payload.given_name, payload.family_name);
  if (composed) {return composed;}
  return email.endsWith("@tara.ee") ? undefined : (email.split("@")[0] ?? email);
}

function buildUserFromPayload(payload: Record<string, unknown>): User {
  const email = payload.email as string;
  const user: User = { id: payload.sub as string };
  const name = resolveDisplayName(payload, email);
  if (name) {user.name = name;}
  if (!email.endsWith("@tara.ee")) {user.email = email;}
  return user;
}

export function parseIdToken(idToken: string, options?: ParseIdTokenOptions): User | null {
  const payload = decodeJwtPayload(idToken);
  if (!payload || !hasRequiredClaims(payload) || !matchesExpected(payload, options)) {return null;}
  return buildUserFromPayload(payload);
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
