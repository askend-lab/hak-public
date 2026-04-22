// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { validateStoreRequest, validateGetRequest } from "../src/core/validation";
import type { DataType } from "../src/core/types";

describe("validation: strings", () => {
  describe("string validation edge cases", () => {
    it("should reject null pk", () => {
      const result = validateStoreRequest({
        key: null as unknown as string,
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("key is required and must be a string");
    });

    it("should reject undefined pk", () => {
      const result = validateStoreRequest({
        key: undefined as unknown as string,
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("key is required and must be a string");
    });

    it("should reject non-string pk (number)", () => {
      const result = validateStoreRequest({
        key: 123 as unknown as string,
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("key is required and must be a string");
    });

    it("should reject null sk in get request", () => {
      const result = validateGetRequest("entity1", null, "private");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("id is required and must be a string");
    });

    it("should reject undefined sk in get request", () => {
      const result = validateGetRequest("entity1", undefined, "private");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("id is required and must be a string");
    });

    it("should reject empty string pk", () => {
      const result = validateStoreRequest({
        key: "",
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("key cannot be empty");
    });

    it("should reject whitespace-only pk", () => {
      const result = validateStoreRequest({
        key: "   ",
        id: "sort1",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("key cannot be empty");
    });

    it("should reject empty string sk", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "",
        type: "private",
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("id cannot be empty");
    });

    it("should reject null type", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: null as unknown as DataType,
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be one of");
    });

    it("should reject undefined type", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: undefined as unknown as DataType,
        ttl: 3600,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("type must be one of");
    });

    it("should reject string ttl", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: "private",
        ttl: "3600" as unknown as number,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ttl must be a number");
    });

    it("should reject null ttl", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: "private",
        ttl: null as unknown as number,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ttl must be a number");
    });

    it("should reject undefined ttl", () => {
      const result = validateStoreRequest({
        key: "entity1",
        id: "sort1",
        type: "private",
        ttl: undefined as unknown as number,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ttl must be a number");
    });
  });

});
