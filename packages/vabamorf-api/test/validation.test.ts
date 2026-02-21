// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createResponse, parseJsonBody, getFieldError, validateField } from "../src/validation";

describe("validation", () => {
  describe("createResponse", () => {
    it("should return response with correct structure", () => {
      const response = createResponse(200, { success: true });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({ success: true }));
      expect(response.headers?.["Content-Type"]).toBe("application/json");
      expect(response.headers?.["Access-Control-Allow-Origin"]).toBe("null");
    });

    it("should include all CORS headers", () => {
      const response = createResponse(400, { error: "test" });
      expect(response.headers?.["Access-Control-Allow-Headers"]).toBe("Content-Type,Authorization");
      expect(response.headers?.["Access-Control-Allow-Methods"]).toBe("GET,POST,DELETE,OPTIONS");
    });
  });

  describe("parseJsonBody", () => {
    it("should return null for null input", () => {
      expect(parseJsonBody(null)).toBeNull();
    });

    it("should parse valid JSON", () => {
      expect(parseJsonBody('{"key":"value"}')).toStrictEqual({ key: "value" });
    });

    it("should return null for invalid JSON", () => {
      expect(parseJsonBody("not json")).toBeNull();
    });

    it("should parse empty object", () => {
      expect(parseJsonBody("{}")).toStrictEqual({});
    });

    it("should parse array", () => {
      expect(parseJsonBody("[1,2,3]")).toStrictEqual([1, 2, 3]);
    });
  });

  describe("getFieldError", () => {
    it("should return error for null value", () => {
      const error = getFieldError(null, "text");
      expect(error).toContain("Missing 'text' field");
    });

    it("should return error for non-string value", () => {
      const error = getFieldError(123, "text");
      expect(error).toContain("Missing 'text' field");
    });

    it("should return error for empty string", () => {
      const error = getFieldError("", "text");
      expect(error).toContain("must be a non-empty string");
    });

    it("should return error for whitespace-only string", () => {
      const error = getFieldError("   ", "text");
      expect(error).toContain("must be a non-empty string");
    });

    it("should return error for string exceeding maxLength", () => {
      const error = getFieldError("a".repeat(11), "text", 10);
      expect(error).toContain("too long");
      expect(error).toContain("10");
    });

    it("should return null for valid string within maxLength", () => {
      expect(getFieldError("valid", "text", 10)).toBeNull();
    });

    it("should return null for valid string without maxLength", () => {
      expect(getFieldError("valid", "text")).toBeNull();
    });

    it("should return null for string at exactly maxLength", () => {
      expect(getFieldError("a".repeat(10), "text", 10)).toBeNull();
    });
  });

  describe("validateField", () => {
    it("should return value for valid field", () => {
      const result = validateField({ text: "hello" }, "text");
      expect(result).toStrictEqual({ value: "hello" });
    });

    it("should trim the value", () => {
      const result = validateField({ text: "  hello  " }, "text");
      expect(result).toStrictEqual({ value: "hello" });
    });

    it("should return error for missing field", () => {
      const result = validateField({}, "text");
      expect("error" in result).toBe(true);
    });

    it("should return error for invalid field", () => {
      const result = validateField({ text: 123 }, "text");
      expect("error" in result).toBe(true);
    });

    it("should respect maxLength", () => {
      const result = validateField({ text: "a".repeat(11) }, "text", 10);
      expect("error" in result).toBe(true);
    });
  });
});
