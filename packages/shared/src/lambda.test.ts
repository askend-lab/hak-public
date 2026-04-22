// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  CORS_HEADERS,
  HTTP_STATUS,
  getCorsOrigin,
  createLambdaResponse,
  createApiResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
  extractErrorMessage,
} from "./lambda";
import { logger } from "./logger";

describe("lambda", () => {
  describe("createLambdaResponse", () => {
    it("should create a response with status, headers, and JSON body", () => {
      const result = createLambdaResponse(200, { ok: true }, { "X-Test": "1" });
      expect(result.statusCode).toBe(200);
      expect(result.headers).toStrictEqual({ "X-Test": "1" });
      expect(JSON.parse(result.body)).toStrictEqual({ ok: true });
    });
  });

  describe("getCorsOrigin", () => {
    const originalEnv = process.env.ALLOWED_ORIGIN;
    afterEach(() => {
      if (originalEnv === undefined) {delete process.env.ALLOWED_ORIGIN;}
      else {process.env.ALLOWED_ORIGIN = originalEnv;}
    });

    it("should return null when ALLOWED_ORIGIN is not set", () => {
      delete process.env.ALLOWED_ORIGIN;
      expect(getCorsOrigin()).toBe("null");
    });

    it("should return ALLOWED_ORIGIN when set", () => {
      process.env.ALLOWED_ORIGIN = "https://example.com";
      expect(getCorsOrigin()).toBe("https://example.com");
    });

    it("should reflect matching requestOrigin from comma-separated list", () => {
      process.env.ALLOWED_ORIGIN = "https://primary.com,https://custom.com";
      expect(getCorsOrigin("https://custom.com")).toBe("https://custom.com");
    });

    it("should return first origin when requestOrigin does not match", () => {
      process.env.ALLOWED_ORIGIN = "https://primary.com,https://custom.com";
      expect(getCorsOrigin("https://unknown.com")).toBe("https://primary.com");
    });

    it("should return first origin from comma-separated list when no requestOrigin", () => {
      process.env.ALLOWED_ORIGIN = "https://primary.com,https://custom.com";
      expect(getCorsOrigin()).toBe("https://primary.com");
    });

    it("should return single origin even with requestOrigin (no comma)", () => {
      process.env.ALLOWED_ORIGIN = "https://example.com";
      expect(getCorsOrigin("https://example.com")).toBe("https://example.com");
    });
  });

  describe("createApiResponse", () => {
    const originalEnv = process.env.ALLOWED_ORIGIN;
    afterEach(() => {
      if (originalEnv === undefined) {delete process.env.ALLOWED_ORIGIN;}
      else {process.env.ALLOWED_ORIGIN = originalEnv;}
    });

    it("should create a response with CORS headers", () => {
      delete process.env.ALLOWED_ORIGIN;
      const result = createApiResponse(200, { data: "test" });
      expect(result.statusCode).toBe(200);
      expect(result.headers["Access-Control-Allow-Origin"]).toBe("null");
      expect(result.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(result.body)).toStrictEqual({ data: "test" });
    });

    it("should use ALLOWED_ORIGIN env var for origin header", () => {
      process.env.ALLOWED_ORIGIN = "https://myapp.example.com";
      const result = createApiResponse(200, {});
      expect(result.headers["Access-Control-Allow-Origin"]).toBe("https://myapp.example.com");
    });

    it("should include all CORS headers plus dynamic origin", () => {
      delete process.env.ALLOWED_ORIGIN;
      const result = createApiResponse(201, {});
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        expect(result.headers[key]).toBe(value);
      }
      expect(result.headers["Access-Control-Allow-Origin"]).toBe("null");
    });
  });

  describe("createBadRequestResponse", () => {
    it("should create a 400 response with error message", () => {
      const result = createBadRequestResponse("Invalid input");
      expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(JSON.parse(result.body)).toStrictEqual({ error: "Invalid input" });
      expect(result.headers["Access-Control-Allow-Origin"]).toBe("null");
    });
  });

  describe("createInternalErrorResponse", () => {
    it("should create a 500 response and log the error", () => {
      const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
      const testError = new Error("db connection failed");
      const result = createInternalErrorResponse("UserService.get", testError);

      expect(result.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(JSON.parse(result.body)).toStrictEqual({ error: "Internal server error" });
      expect(loggerSpy).toHaveBeenCalledWith("UserService.get:", "db connection failed");
      loggerSpy.mockRestore();
    });
  });

  describe("extractErrorMessage", () => {
    it("should extract message from Error instance", () => {
      expect(extractErrorMessage(new Error("boom"), "fallback")).toBe("boom");
    });

    it("should return fallback for non-Error", () => {
      expect(extractErrorMessage("string error", "fallback")).toBe("fallback");
      expect(extractErrorMessage(null, "fallback")).toBe("fallback");
      expect(extractErrorMessage(42, "fallback")).toBe("fallback");
    });
  });

  describe("HTTP_STATUS", () => {
    it("should define standard HTTP status codes", () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });
});
