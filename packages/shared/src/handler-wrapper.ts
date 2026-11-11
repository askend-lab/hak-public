// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Lambda handler wrapper — standardizes error handling, logging, and responses.
 *
 * Usage:
 *   export const myHandler = wrapLambdaHandler("myHandler", async (event, log) => {
 *     // business logic — throw AppError for operational errors
 *     return createApiResponse(200, { data });
 *   });
 */

import { logger } from "./logger";
import type { Logger } from "./logger";
import { AppError } from "./errors";
import { createApiResponse, extractErrorMessage } from "./lambda";
import type { LambdaResponse } from "./lambda";

interface EventWithRequestContext {
  requestContext?: { requestId?: string };
}

type WrappedHandler<TEvent extends EventWithRequestContext> = (
  event: TEvent,
  log: Logger,
) => Promise<LambdaResponse>;

export function wrapLambdaHandler<TEvent extends EventWithRequestContext>(
  handlerName: string,
  handler: WrappedHandler<TEvent>,
): (event: TEvent) => Promise<LambdaResponse> {
  return async (event: TEvent): Promise<LambdaResponse> => {
    const log = logger.withContext({
      handler: handlerName,
      requestId: event.requestContext?.requestId,
    });

    try {
      return await handler(event, log);
    } catch (error) {
      if (error instanceof AppError && error.isOperational) {
        log.warn(error.message, { code: error.code, statusCode: error.statusCode });
        return createApiResponse(error.statusCode, { error: error.message });
      }

      log.error("Unhandled error", extractErrorMessage(error));
      return createApiResponse(500, { error: "Internal server error" });
    }
  };
}
