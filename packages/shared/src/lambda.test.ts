// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  CORS_HEADERS,
  HTTP_STATUS,
  createLambdaResponse,
  createApiResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
  extractErrorMessage,
} from "./lambda";

describe("lambda", () => {
  describe("createLambdaResponse", () => {
    it("should create a response with status, headers, and JSON body", () => {
      const result = createLambdaResponse(200, { ok: true }, { "X-Test": "1" });
      expect(result.statusCode).toBe(200);
      expect(result.headers).toStrictEqual({ "X-Test": "1" });
      expect(JSON.parse(result.body)).toStrictEqual({ ok: true });
    });
  });

  describe("createApiResponse", () => {
    it("should create a response with CORS headers", () => {
      const result = createApiResponse(200, { data: "test" });
      expect(result.statusCode).toBe(200);
      expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
      expect(result.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(result.body)).toStrictEqual({ data: "test" });
    });

    it("should include all CORS headers", () => {
      const result = createApiResponse(201, {});
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        expect(result.headers[key]).toBe(value);
      }
    });
  });

  describe("createBadRequestResponse", () => {
    it("should create a 400 response with error message", () => {
      const result = createBadRequestResponse("Invalid input");
      expect(result.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(JSON.parse(result.body)).toStrictEqual({ error: "Invalid input" });
      expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
    });
  });

  describe("createInternalErrorResponse", () => {
    it("should create a 500 response and log the error", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const testError = new Error("db connection failed");
      const result = createInternalErrorResponse("UserService.get", testError);

      expect(result.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(JSON.parse(result.body)).toStrictEqual({ error: "Internal server error" });
      expect(consoleSpy).toHaveBeenCalledWith("UserService.get:", testError);
      consoleSpy.mockRestore();
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
