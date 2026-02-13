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
 * Extracts error message from unknown error type.
 */
export function extractErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error ? error.message : fallback;
}
