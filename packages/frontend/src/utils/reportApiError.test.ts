// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Sentry from "@sentry/react";
import { logger } from "@hak/shared";
import { reportApiError } from "./reportApiError";

vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));

vi.mock("@hak/shared", () => ({
  logger: { error: vi.fn() },
}));

describe("reportApiError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs error with structured message", () => {
    reportApiError({ context: "Save failed", status: 500, url: "/api/save" });

    expect(logger.error).toHaveBeenCalledWith(
      "API error: Save failed — 500 /api/save",
      { status: 500, url: "/api/save", body: undefined },
    );
  });

  it("sends exception to Sentry with tags and extra", () => {
    reportApiError({ context: "Get failed", status: 404, url: "/api/get", body: "not found" });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "API error: Get failed — 404 /api/get" }),
      {
        tags: { apiError: "true", statusCode: "404" },
        extra: { url: "/api/get", status: 404, body: "not found", context: "Get failed" },
      },
    );
  });

  it("handles missing body parameter", () => {
    reportApiError({ context: "Delete failed", status: 403, url: "/api/delete" });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({ body: undefined }),
      }),
    );
  });

  it("formats message consistently: 'API error: {context} — {status} {url}'", () => {
    reportApiError({ context: "Synthesis timeout", status: 504, url: "/api/synthesize" });

    const calls = vi.mocked(Sentry.captureException).mock.calls;
    expect(calls).toHaveLength(1);
    const errorArg = calls[0]?.[0] as Error;
    expect(errorArg.message).toBe("API error: Synthesis timeout — 504 /api/synthesize");
  });
});
