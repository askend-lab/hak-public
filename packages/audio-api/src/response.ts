// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  createApiResponse,
  createBadRequestResponse,
  HTTP_STATUS,
  type LambdaResponse,
} from "@hak/shared";

export type { LambdaResponse } from "@hak/shared";
export { CORS_HEADERS, HTTP_STATUS, extractErrorMessage } from "@hak/shared";

export const createResponse = createApiResponse;

export function createErrorResponse(error: string): LambdaResponse {
  return createBadRequestResponse(error);
}

export function createSuccessResponse(body: unknown): LambdaResponse {
  return createApiResponse(HTTP_STATUS.OK, body);
}
