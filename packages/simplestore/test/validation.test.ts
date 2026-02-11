// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
  validateServerContext,
  parseTtl,
} from "../src/core/validation";
import type { StoreRequest, DataType } from "../src/core/types";

describe("Validation", () => {
  describe("validateStoreRequest", () => {
    it("should accept valid request", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: 3600,
        data: { key: "value" },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it.each([
      ["missing pk", { sk: "sort1", type: "private", ttl: 3600 }, "pk is required"],
      ["missing sk", { pk: "entity1", type: "private", ttl: 3600 }, "sk is required"],
      ["invalid type", { pk: "entity1", sk: "sort1", type: "invalid", ttl: 3600 }, "type must be one of"],
      ["negative ttl", { pk: "entity1", sk: "sort1", type: "private", ttl: -1 }, "TTL must be 0"],
      ["ttl exceeding max", { pk: "entity1", sk: "sort1", type: "private", ttl: 31536001 }, "exceeds maximum"],
      ["invalid data type", { pk: "entity1", sk: "sort1", type: "private", ttl: 3600, data: "string" }, "data must be an object"],
    ])("should reject %s", (_name, input, expectedError) => {
      const result = validateStoreRequest(input as unknown as Partial<StoreRequest>);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes(expectedError))).toBe(true);
    });

    it.each([
      ["zero ttl", { pk: "entity1", sk: "sort1", type: "private", ttl: 0 }],
      ["without data", { pk: "entity1", sk: "sort1", type: "public", ttl: 3600 }],
    ])("should accept %s", (_name, input) => {
      const result = validateStoreRequest(input as unknown as Partial<StoreRequest>);
      expect(result.valid).toBe(true);
    });
  });

  describe("validateGetRequest", () => {
    it("should accept valid request", () => {
      const result = validateGetRequest("entity1", "sort1", "private");

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid pk", () => {
      const result = validateGetRequest(null, "sort1", "private");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("pk is required and must be a string");
    });

    it("should reject invalid type", () => {
      const result = validateGetRequest("entity1", "sort1", "invalid");

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be one of");
    });
  });

  describe("validateQueryRequest", () => {
    it("should accept valid request", () => {
      const result = validateQueryRequest("prefix-", "private");

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept empty prefix", () => {
      const result = validateQueryRequest("", "public");

      expect(result.valid).toBe(true);
    });

    it("should reject non-string prefix", () => {
      const result = validateQueryRequest(123, "private");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("prefix must be a string");
    });

    it("should reject invalid type", () => {
      const result = validateQueryRequest("prefix-", null);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be one of");
    });
  });

  describe("string validation edge cases", () => {
    it("should reject null pk", () => {
      const result = validateStoreRequest({
        pk: null as unknown as string,
        sk: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("pk is required and must be a string");
    });

    it("should reject undefined pk", () => {
      const result = validateStoreRequest({
        pk: undefined as unknown as string,
        sk: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("pk is required and must be a string");
    });

    it("should reject non-string pk (number)", () => {
      const result = validateStoreRequest({
        pk: 123 as unknown as string,
        sk: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("pk is required and must be a string");
    });

    it("should reject null sk in get request", () => {
      const result = validateGetRequest("entity1", null, "private");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("sk is required and must be a string");
    });

    it("should reject undefined sk in get request", () => {
      const result = validateGetRequest("entity1", undefined, "private");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("sk is required and must be a string");
    });

    it("should reject empty string pk", () => {
      const result = validateStoreRequest({
        pk: "",
        sk: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("pk cannot be empty");
    });

    it("should reject whitespace-only pk", () => {
      const result = validateStoreRequest({
        pk: "   ",
        sk: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("pk cannot be empty");
    });

    it("should reject empty string sk", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("sk cannot be empty");
    });

    it("should reject null type", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "sort1",
        type: null as unknown as DataType,
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be one of");
    });

    it("should reject undefined type", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "sort1",
        type: undefined as unknown as DataType,
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be one of");
    });

    it("should reject string ttl", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: "3600" as unknown as number,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ttl must be a number");
    });

    it("should reject null ttl", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: null as unknown as number,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ttl must be a number");
    });

    it("should reject undefined ttl", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: undefined as unknown as number,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ttl must be a number");
    });

    it("should accept ttl of exactly 0", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: 0,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject null type in get request", () => {
      const result = validateGetRequest("entity1", "sort1", null);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be one of");
    });

    it("should reject undefined type in get request", () => {
      const result = validateGetRequest("entity1", "sort1", undefined);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be one of");
    });

    it("should accept pk at exactly max length (1024)", () => {
      const result = validateStoreRequest({
        pk: "a".repeat(1024),
        sk: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject pk exceeding max length (1025)", () => {
      const result = validateStoreRequest({
        pk: "a".repeat(1025),
        sk: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("pk exceeds maximum length");
    });

    it("should reject sk exceeding max length (1025)", () => {
      const result = validateStoreRequest({
        pk: "entity1",
        sk: "b".repeat(1025),
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("sk exceeds maximum length");
    });
  });

  describe("validateRequiredString edge cases", () => {
    it.each([
      ["number pk", { pk: 123, sk: "sort1" }, "pk"],
      ["number sk", { pk: "entity1", sk: 456 }, "sk"],
      ["object pk", { pk: { key: "value" }, sk: "sort1" }, "pk"],
      ["array sk", { pk: "entity1", sk: ["a", "b"] }, "sk"],
      ["boolean pk", { pk: true, sk: "sort1" }, "pk"],
    ])("should reject %s (not a string)", (_name, fields, expectedField) => {
      const result = validateStoreRequest({
        ...fields,
        type: "private",
        ttl: 3600,
      } as unknown as Partial<StoreRequest>);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`${expectedField} is required and must be a string`);
    });
  });

  describe("parseTtl", () => {
    it("should return valid with value 0 for ttl=0", () => {
      const result = parseTtl(0);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.value).toBe(0);
      }
    });

    it("should return valid with ttl value for positive ttl", () => {
      const result = parseTtl(3600);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.value).toBe(3600);
      }
    });

    it("should return invalid for negative ttl", () => {
      const result = parseTtl(-1);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("TTL must be 0");
      }
    });

    it("should return invalid for ttl exceeding max", () => {
      const result = parseTtl(31536001); // 1 year + 1 second
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("TTL exceeds maximum");
      }
    });

    it("should accept ttl at exactly max", () => {
      const result = parseTtl(31536000); // 1 year
      expect(result.valid).toBe(true);
    });

    it("should use custom config maxTtlSeconds", () => {
      const result = parseTtl(1001, { maxTtlSeconds: 1000, keyDelimiter: "#" });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("1000");
      }
    });

    it("should return different results for 0 vs 1", () => {
      const result0 = parseTtl(0);
      const result1 = parseTtl(1);
      expect(result0.valid).toBe(true);
      expect(result1.valid).toBe(true);
      if (result0.valid && result1.valid) {
        expect(result0.value).toBe(0);
        expect(result1.value).toBe(1);
      }
    });
  });

  describe("validateServerContext", () => {
    it("should accept valid context", () => {
      const result = validateServerContext({
        app: "myapp",
        tenant: "mytenant",
        env: "dev",
        userId: "user123",
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it.each([
      ["missing app", { tenant: "t", env: "e", userId: "u" }, "app"],
      ["missing tenant", { app: "a", env: "e", userId: "u" }, "tenant"],
      ["missing env", { app: "a", tenant: "t", userId: "u" }, "env"],
      ["missing userId", { app: "a", tenant: "t", env: "e" }, "userId"],
      ["null app", { app: null, tenant: "t", env: "e", userId: "u" }, "app"],
      ["empty tenant", { app: "a", tenant: "", env: "e", userId: "u" }, "tenant"],
    ])("should reject %s", (_name, context, expectedField) => {
      const result = validateServerContext(context as unknown as Partial<Record<string, unknown>>);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes(expectedField))).toBe(true);
    });
  });
});
