// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { validateStoreRequest, validateServerContext, parseTtl } from "../src/core/validation";
import type { StoreRequest } from "../src/core/types";

describe("validation.test", () => {
  describe("validateRequiredString edge cases", () => {
    it.each([
      ["number pk", { key: 123, id: "sort1" }, "key"],
      ["number sk", { key: "entity1", id: 456 }, "id"],
      ["object pk", { key: { key: "value" }, id: "sort1" }, "key"],
      ["array sk", { key: "entity1", id: ["a", "b"] }, "id"],
      ["boolean pk", { key: true, id: "sort1" }, "key"],
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
      const result = parseTtl(1001, { maxTtlSeconds: 1000, maxDataSizeBytes: 350000, keyDelimiter: "#" });
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
