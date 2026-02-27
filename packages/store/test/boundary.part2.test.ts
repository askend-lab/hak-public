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

});
