// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
} from "../src/core/validation";


describe("Validation — security hardening", () => {
  describe("control characters", () => {
    it("should reject key with null byte", () => {
      const result = validateStoreRequest({
        key: "entity\x00evil",
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("control characters"))).toBe(true);
    });

    it("should reject id with newline", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort\nnewline",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("control characters"))).toBe(true);
    });

    it("should reject key with tab in get request", () => {
      const result = validateGetRequest("entity\t1", "sort1", "private");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("control characters"))).toBe(true);
    });

    it("should reject id with DEL character in get request", () => {
      const result = validateGetRequest("entity1", "sort\x7f1", "private");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("control characters"))).toBe(true);
    });
  });

  describe("whitespace in keys", () => {
    it("should reject key with leading whitespace", () => {
      const result = validateStoreRequest({
        key: " entity1",
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("leading or trailing whitespace"))).toBe(true);
    });

    it("should reject id with trailing whitespace", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1 ",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("leading or trailing whitespace"))).toBe(true);
    });

    it("should accept key with internal spaces", () => {
      const result = validateStoreRequest({
        key: "my entity",
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("data payload validation", () => {
    it("should reject null data", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: "private",
        ttl: 3600,
        data: null as unknown as Record<string, unknown>,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("data must be a plain object");
    });

    it("should reject array data", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: "private",
        ttl: 3600,
        data: [1, 2, 3] as unknown as Record<string, unknown>,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("data must be a plain object");
    });

    it("should accept valid object data", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: "private",
        ttl: 3600,
        data: { nested: { deep: true } },
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("query prefix hardening", () => {
    it("should reject prefix with delimiter", () => {
      const result = validateQueryRequest("task#evil", "private");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("delimiter"))).toBe(true);
    });

    it("should reject prefix with control characters", () => {
      const result = validateQueryRequest("task\x00", "private");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("control characters"))).toBe(true);
    });

    it("should reject prefix exceeding max length", () => {
      const result = validateQueryRequest("a".repeat(1025), "private");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("exceeds maximum length"))).toBe(true);
    });

    it("should accept empty prefix (match all)", () => {
      const result = validateQueryRequest("", "private");
      expect(result.valid).toBe(true);
    });
  });
});
