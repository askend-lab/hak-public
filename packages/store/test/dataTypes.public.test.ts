// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * TDD tests for 4-type data access system (public, shared, type isolation)
 *
 * Types:
 * - public: everyone sees/searches, only owner modifies
 * - shared: everyone sees, everyone can modify
 */

import { Store } from "../src/core/store";
import { ServerContext } from "../src/core/types";
import { InMemoryAdapter } from "../src/adapters/memory";

describe("dataTypes.public.test", () => {
  let db: InMemoryAdapter;

  const ownerContext: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "owner123",
  };

  const otherUserContext: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "otherUser456",
  };

  beforeEach(() => {
    db = new InMemoryAdapter();
  });

  describe("public type", () => {
    it("owner can save public item", async () => {
      const store = new Store(db, ownerContext);
      const result = await store.save({
        key: "article",
        id: "post1",
        type: "public",
        ttl: 3600,
        data: { title: "Hello World" },
      });
      expect(result.success).toBe(true);
    });

    it("any user can read public item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "article",
        id: "post1",
        type: "public",
        ttl: 3600,
        data: { title: "Hello World" },
      });

      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.get("article", "post1", "public");
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ title: "Hello World" });
    });

    it("any user can query public items", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "article",
        id: "post1",
        type: "public",
        ttl: 3600,
        data: {},
      });
      await ownerStore.save({
        key: "article",
        id: "post2",
        type: "public",
        ttl: 3600,
        data: {},
      });

      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.query("article", "public");
      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(2);
    });

    it("other user cannot modify public item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "article",
        id: "post1",
        type: "public",
        ttl: 3600,
        data: {},
      });

      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.delete("article", "post1", "public");
      expect(result.success).toBe(false);
      expect(result.error).toContain("not owner");
    });

    it("owner can delete public item", async () => {
      const store = new Store(db, ownerContext);
      await store.save({
        key: "article",
        id: "post1",
        type: "public",
        ttl: 3600,
        data: {},
      });

      const result = await store.delete("article", "post1", "public");
      expect(result.success).toBe(true);
    });
  });

});
