// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Boundary condition tests - edge cases and special characters
 */

import { Store } from "../src/core/store";
import { ServerContext } from "../src/core/types";
import { validateStoreRequest } from "../src/core/validation";
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

  describe("pk/sk with delimiter character #", () => {
    it("should handle pk containing # character", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "user#123",
        id: "settings",
        type: "private",
        ttl: 3600,
        data: { value: "test" },
      });

      expect(result.success).toBe(true);

      const getResult = await store.get("user#123", "settings", "private");
      expect(getResult.success).toBe(true);
      expect(getResult.item?.data).toStrictEqual({ value: "test" });
    });

    it("should handle sk containing # character", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "entity",
        id: "version#1.0.0",
        type: "public",
        ttl: 3600,
        data: {},
      });

      expect(result.success).toBe(true);
    });

    it("should handle both pk and sk containing # character", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "user#456",
        id: "doc#rev#2",
        type: "shared",
        ttl: 3600,
        data: { complex: true },
      });

      expect(result.success).toBe(true);

      const getResult = await store.get("user#456", "doc#rev#2", "shared");
      expect(getResult.success).toBe(true);
    });
  });

  describe("empty and whitespace strings", () => {
    it("should reject empty pk in validation", () => {
      const result = validateStoreRequest({
        key: "",
        id: "valid",
        type: "public",
        ttl: 3600,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("key"))).toBe(true);
    });

    it("should reject empty sk in validation", () => {
      const result = validateStoreRequest({
        key: "valid",
        id: "",
        type: "public",
        ttl: 3600,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("id"))).toBe(true);
    });

    it("should reject whitespace-only pk", () => {
      const result = validateStoreRequest({
        key: "   ",
        id: "valid",
        type: "public",
        ttl: 3600,
      });

      expect(result.valid).toBe(false);
    });

    it("should reject whitespace-only sk", () => {
      const result = validateStoreRequest({
        key: "valid",
        id: "\t\n",
        type: "public",
        ttl: 3600,
      });

      expect(result.valid).toBe(false);
    });
  });

  describe("long strings", () => {
    it("should handle very long pk", async () => {
      const store = new Store(db, context);
      const longPk = "a".repeat(1000);

      const result = await store.save({
        key: longPk,
        id: "short",
        type: "private",
        ttl: 3600,
        data: {},
      });

      expect(result.success).toBe(true);

      const getResult = await store.get(longPk, "short", "private");
      expect(getResult.success).toBe(true);
    });

    it("should handle very long sk", async () => {
      const store = new Store(db, context);
      const longSk = "b".repeat(1000);

      const result = await store.save({
        key: "short",
        id: longSk,
        type: "private",
        ttl: 3600,
        data: {},
      });

      expect(result.success).toBe(true);
    });
  });

});
