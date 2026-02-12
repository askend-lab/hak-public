// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export interface LambdaResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
} as const;

export const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

export function createResponse(
  statusCode: number,
  body: unknown,
): LambdaResponse {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: { ...CORS_HEADERS },
  };
}

export function createErrorResponse(error: string): LambdaResponse {
  return createResponse(HTTP_STATUS.BAD_REQUEST, { error });
}

export function createSuccessResponse(body: unknown): LambdaResponse {
  return createResponse(HTTP_STATUS.OK, body);
}

export function extractErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error ? error.message : fallback;
}
