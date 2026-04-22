// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { validateStoreRequest, validateGetRequest, validateQueryRequest } from "../src/core/validation";
import type { StoreRequest } from "../src/core/types";

describe("validation.test", () => {
  describe("validateStoreRequest", () => {
    it("should accept valid request", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: "private",
        ttl: 3600,
        data: { key: "value" },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it.each([
      ["missing pk", { id: "sort1", type: "private", ttl: 3600 }, "key is required"],
      ["missing sk", { key: "entity1", type: "private", ttl: 3600 }, "id is required"],
      ["invalid type", { key: "entity1", id: "sort1", type: "invalid", ttl: 3600 }, "type must be one of"],
      ["negative ttl", { key: "entity1", id: "sort1", type: "private", ttl: -1 }, "TTL must be 0"],
      ["ttl exceeding max", { key: "entity1", id: "sort1", type: "private", ttl: 31536001 }, "exceeds maximum"],
      ["invalid data type", { key: "entity1", id: "sort1", type: "private", ttl: 3600, data: "string" }, "data must be a plain object"],
    ])("should reject %s", (_name, input, expectedError) => {
      const result = validateStoreRequest(input as unknown as Partial<StoreRequest>);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes(expectedError))).toBe(true);
    });

    it.each([
      ["zero ttl", { key: "entity1", id: "sort1", type: "private", ttl: 0 }],
      ["without data", { key: "entity1", id: "sort1", type: "public", ttl: 3600 }],
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
      expect(result.errors).toContain("key is required and must be a string");
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

});
