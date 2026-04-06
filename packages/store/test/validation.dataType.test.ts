// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { validateStoreRequest, validateGetRequest } from "../src/core/validation";

describe("validation: dataType", () => {
  describe("string validation edge cases continued", () => {
    it("should accept ttl of exactly 0", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
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
        key: "a".repeat(1024),
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject pk exceeding max length (1025)", () => {
      const result = validateStoreRequest({
        key: "a".repeat(1025),
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("key exceeds maximum length");
    });

    it("should reject sk exceeding max length (1025)", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "b".repeat(1025),
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("id exceeds maximum length");
    });
  });

});
