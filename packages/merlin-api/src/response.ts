// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  HTTP_STATUS,
  createLambdaResponse,
  type LambdaResponse,
} from "@hak/shared";

export type { LambdaResponse } from "@hak/shared";
export { HTTP_STATUS } from "@hak/shared";

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
  return createLambdaResponse(statusCode, body, { ...CORS_HEADERS });
}

export function createBadRequest(error: string): LambdaResponse {
  return createResponse(HTTP_STATUS.BAD_REQUEST, { error });
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
