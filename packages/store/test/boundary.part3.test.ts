// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Boundary condition tests - edge cases and special characters
 */

import { Store } from "../src/core/store";
import { ServerContext } from "../src/core/types";
import { validateServerContext } from "../src/core/validation";
import { InMemoryAdapter } from "../src/adapters/memory";

describe("boundary.test", () => {
  let db: InMemoryAdapter;
  const context: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "user123",
  };

  beforeEach(() => {
    db = new InMemoryAdapter();
  });

  describe("server context validation", () => {
    it("should reject empty app", () => {
      const result = validateServerContext({
        app: "",
        tenant: "valid",
        env: "valid",
        userId: "valid",
      });

      expect(result.valid).toBe(false);
    });

    it("should reject empty tenant", () => {
      const result = validateServerContext({
        app: "valid",
        tenant: "",
        env: "valid",
        userId: "valid",
      });

      expect(result.valid).toBe(false);
    });

    it("should reject empty env", () => {
      const result = validateServerContext({
        app: "valid",
        tenant: "valid",
        env: "",
        userId: "valid",
      });

      expect(result.valid).toBe(false);
    });

    it("should reject empty userId", () => {
      const result = validateServerContext({
        app: "valid",
        tenant: "valid",
        env: "valid",
        userId: "",
      });

      expect(result.valid).toBe(false);
    });

    it("should accept valid context", () => {
      const result = validateServerContext({
        app: "myapp",
        tenant: "mytenant",
        env: "production",
        userId: "user-123",
      });

      expect(result.valid).toBe(true);
    });
  });

  describe("special data values", () => {
    it("should handle null values in data object", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "test",
        id: "nulls",
        type: "public",
        ttl: 3600,
        data: { nullField: null, valid: "value" },
      });

      expect(result.success).toBe(true);
    });

    it("should handle nested objects in data", async () => {
      const store = new Store(db, context);
      const nestedData = {
        level1: {
          level2: {
            level3: {
              value: "deep",
            },
          },
        },
      };

      const result = await store.save({
        key: "test",
        id: "nested",
        type: "public",
        ttl: 3600,
        data: nestedData,
      });

      expect(result.success).toBe(true);

      const getResult = await store.get("test", "nested", "public");
      expect(getResult.item?.data).toStrictEqual(nestedData);
    });

    it("should handle arrays in data", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "test",
        id: "arrays",
        type: "public",
        ttl: 3600,
        data: {
          numbers: [1, 2, 3],
          strings: ["a", "b", "c"],
          mixed: [1, "two", { three: 3 }],
        },
      });

      expect(result.success).toBe(true);
    });

    it("should handle empty data object", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "test",
        id: "empty",
        type: "public",
        ttl: 3600,
        data: {},
      });

      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({});
    });
  });

});
