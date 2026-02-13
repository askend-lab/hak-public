// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  createApiResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
  type LambdaResponse,
} from "@hak/shared";

export type { LambdaResponse } from "@hak/shared";
export { CORS_HEADERS, HTTP_STATUS } from "@hak/shared";

export const createResponse = createApiResponse;

export function createBadRequest(error: string): LambdaResponse {
  return createBadRequestResponse(error);
}

export function createInternalError(context: string, error: unknown): LambdaResponse {
  return createInternalErrorResponse(context, error);
}
