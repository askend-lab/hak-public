// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Shared Lambda response utilities.
 * Eliminates duplication across merlin-api, audio-api, vabamorf-api, simplestore.
 */

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * Shared CORS headers for all Lambda API responses.
 * Single source of truth — eliminates inconsistencies across packages.
 */
export const CORS_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/**
 * Creates a Lambda response with JSON body and given headers.
 */
export function createLambdaResponse(
  statusCode: number,
  body: unknown,
  headers: Record<string, string>,
): LambdaResponse {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

/**
 * Creates an API response with CORS headers (most common pattern).
 * Replaces per-package createResponse() wrappers.
 */
export function createApiResponse(
  statusCode: number,
  body: unknown,
): LambdaResponse {
  return createLambdaResponse(statusCode, body, { ...CORS_HEADERS });
}

/**
 * Creates a 400 Bad Request response with CORS headers.
 */
export function createBadRequestResponse(error: string): LambdaResponse {
  return createApiResponse(HTTP_STATUS.BAD_REQUEST, { error });
}

/**
 * Creates a 500 Internal Server Error response with CORS headers.
 * Logs the error context for debugging.
 */
export function createInternalErrorResponse(
  context: string,
  error: unknown,
): LambdaResponse {
  console.error(`${context}:`, error);
  return createApiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
    error: "Internal server error",
  });
}

/**
 * Extracts error message from unknown error type.
 */
export function extractErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error ? error.message : fallback;
}
