// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Boundary condition tests - edge cases and special characters
 */

import { Store } from "../src/core/store";
import { ServerContext } from "../src/core/types";
import {
  validateStoreRequest,
  validateServerContext,
} from "../src/core/validation";
import { InMemoryAdapter } from "../src/adapters/memory";

describe("Boundary Conditions", () => {
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

  describe("unicode characters", () => {
    it("should handle Estonian characters (õ, ä, ö, ü)", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "töötaja-ülesanne",
        id: "öösäälane-õppetöö",
        type: "public",
        ttl: 3600,
        data: { eestiKeel: "Tere päevast! Õhtu on käes." },
      });

      expect(result.success).toBe(true);

      const getResult = await store.get(
        "töötaja-ülesanne",
        "öösäälane-õppetöö",
        "public",
      );
      expect(getResult.success).toBe(true);
      expect(getResult.item?.data.eestiKeel).toBe(
        "Tere päevast! Õhtu on käes.",
      );
    });

    it("should handle unicode in pk", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "用户-日本語-émojis-🎉",
        id: "data",
        type: "public",
        ttl: 3600,
        data: { unicode: true },
      });

      expect(result.success).toBe(true);

      const getResult = await store.get(
        "用户-日本語-émojis-🎉",
        "data",
        "public",
      );
      expect(getResult.success).toBe(true);
    });

    it("should handle unicode in sk", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "entity",
        id: "Привет-мир-🌍",
        type: "private",
        ttl: 3600,
        data: {},
      });

      expect(result.success).toBe(true);
    });

    it("should handle unicode in data", async () => {
      const store = new Store(db, context);
      const result = await store.save({
        key: "entity",
        id: "data",
        type: "public",
        ttl: 3600,
        data: {
          chinese: "中文",
          japanese: "日本語",
          korean: "한국어",
          arabic: "العربية",
          emoji: "🎉🚀💻",
        },
      });

      expect(result.success).toBe(true);
      expect(result.item?.data.emoji).toBe("🎉🚀💻");
    });
  });

  describe("TTL boundary conditions", () => {
    it("should accept TTL of 1 second", () => {
      const result = validateStoreRequest({
        key: "test",
        id: "test",
        type: "public",
        ttl: 1,
      });

      expect(result.valid).toBe(true);
    });

    it("should accept TTL at exactly max limit", () => {
      const result = validateStoreRequest({
        key: "test",
        id: "test",
        type: "public",
        ttl: 31536000, // exactly 1 year
      });

      expect(result.valid).toBe(true);
    });

    it("should reject negative TTL", () => {
      const result = validateStoreRequest({
        key: "test",
        id: "test",
        type: "public",
        ttl: -1,
      });

      expect(result.valid).toBe(false);
    });

    it("should reject TTL just over max limit", () => {
      const result = validateStoreRequest({
        key: "test",
        id: "test",
        type: "public",
        ttl: 31536001, // 1 year + 1 second
      });

      expect(result.valid).toBe(false);
    });
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
