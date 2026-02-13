// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  CORS_HEADERS,
  HTTP_STATUS,
  createLambdaResponse,
  type LambdaResponse,
} from "@hak/shared";

export type { LambdaResponse } from "@hak/shared";
export { CORS_HEADERS, HTTP_STATUS, extractErrorMessage } from "@hak/shared";

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
