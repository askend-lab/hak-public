// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import * as Sentry from "@sentry/react";
import { logger } from "@hak/shared";

interface ApiErrorOpts {
  context: string;
  status: number;
  url: string;
  body?: string;
}

/**
 * Report an API error to Sentry and logger.
 * Any non-OK response from our API is unexpected (frontend should not produce invalid requests).
 * Call this whenever fetch() returns a non-OK response from our backend.
 */
export function reportApiError(opts: ApiErrorOpts): void {
  const message = `API error: ${opts.context} — ${opts.status} ${opts.url}`;
  logger.error(message, { status: opts.status, url: opts.url, body: opts.body });
  Sentry.captureException(new Error(message), {
    tags: { apiError: "true", statusCode: String(opts.status) },
    extra: { url: opts.url, status: opts.status, body: opts.body, context: opts.context },
  });
}
