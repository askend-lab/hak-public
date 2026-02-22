// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  createApiResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
} from "@hak/shared";

export type { LambdaResponse } from "@hak/shared";
export { CORS_HEADERS, HTTP_STATUS } from "@hak/shared";

export const createResponse = createApiResponse;
export const createBadRequest = createBadRequestResponse;
export const createInternalError = createInternalErrorResponse;
