// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { logger } from "./logger";

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// Inlined from @hak/shared — merlin-api is a standalone Lambda without workspace packages
function getCorsOrigin(): string {
  const origin = typeof process !== "undefined" ? process.env?.ALLOWED_ORIGIN : undefined;
  if (!origin) {
    console.warn("ALLOWED_ORIGIN not set — defaulting to restrictive 'null' origin");
    return "null";
  }
  return origin;
}

export const CORS_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'",
};

export const HTTP_STATUS = {
  OK: 200,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export function createResponse(
  statusCode: number,
  body: unknown,
): LambdaResponse {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, "Access-Control-Allow-Origin": getCorsOrigin() },
    body: JSON.stringify(body),
  };
}

export function createBadRequest(error: string): LambdaResponse {
  return createResponse(HTTP_STATUS.BAD_REQUEST, { error });
}

export function createInternalError(context: string, error: unknown): LambdaResponse {
  logger.error(`${context}:`, error instanceof Error ? error.message : 'Unknown error');
  return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
    error: "Internal server error",
  });
}
