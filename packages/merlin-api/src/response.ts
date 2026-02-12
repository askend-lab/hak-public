// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export const HTTP_STATUS = {
  OK: 200,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
} as const;

export function createResponse(
  statusCode: number,
  body: object,
): LambdaResponse {
  return {
    statusCode,
    headers: { ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

export function createInternalError(
  context: string,
  error: unknown,
): LambdaResponse {
  console.error(`${context}:`, error);
  return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
    error: "Internal server error",
  });
}
