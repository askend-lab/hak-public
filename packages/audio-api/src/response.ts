// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  HTTP_STATUS,
  createLambdaResponse,
  type LambdaResponse,
} from "@hak/shared";

export type { LambdaResponse } from "@hak/shared";
export { HTTP_STATUS, extractErrorMessage } from "@hak/shared";

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
  return createLambdaResponse(statusCode, body, { ...CORS_HEADERS });
}

export function createErrorResponse(error: string): LambdaResponse {
  return createResponse(HTTP_STATUS.BAD_REQUEST, { error });
}

export function createSuccessResponse(body: unknown): LambdaResponse {
  return createResponse(HTTP_STATUS.OK, body);
}
