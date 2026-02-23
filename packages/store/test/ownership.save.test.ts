// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * TDD tests for audit finding #3: save ownership check
 *
 * Expected behavior after fix:
 * - public/unlisted: only owner can overwrite existing items
 * - shared: anyone can overwrite (by design, per API.md)
 * - private: isolated by userId in partition key (no cross-user access)
 */

import { Store } from "../src/core/store";
import { ServerContext, DataType } from "../src/core/types";
import { InMemoryAdapter } from "../src/adapters/memory";

describe("Audit #3: save ownership check for public/unlisted types", () => {
  let db: InMemoryAdapter;

  const ownerContext: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "owner123",
  };

  const attackerContext: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "attacker456",
  };

  beforeEach(() => {
    db = new InMemoryAdapter();
  });

  describe("public type — non-owner cannot overwrite", () => {
    it("should reject save from non-owner on existing public item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "lesson",
        sortKey: "lesson-1",
        type: "public",
        ttl: 3600,
        data: { title: "Original" },
      });

      const attackerStore = new Store(db, attackerContext);
      const result = await attackerStore.save({
        key: "lesson",
        sortKey: "lesson-1",
        type: "public",
        ttl: 3600,
        data: { title: "Hijacked!" },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not owner");
    });

    it("should preserve original data after rejected overwrite", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "lesson",
        sortKey: "lesson-1",
        type: "public",
        ttl: 3600,
        data: { title: "Original" },
      });

      const attackerStore = new Store(db, attackerContext);
      await attackerStore.save({
        key: "lesson",
        sortKey: "lesson-1",
        type: "public",
        ttl: 3600,
        data: { title: "Hijacked!" },
      });

      const getResult = await ownerStore.get("lesson", "lesson-1", "public");
      expect(getResult.item?.data).toStrictEqual({ title: "Original" });
      expect(getResult.item?.owner).toBe("owner123");
    });

    it("should allow owner to update own public item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "lesson",
        sortKey: "lesson-1",
        type: "public",
        ttl: 3600,
        data: { title: "v1" },
      });

      const result = await ownerStore.save({
        key: "lesson",
        sortKey: "lesson-1",
        type: "public",
        ttl: 3600,
        data: { title: "v2" },
      });

      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ title: "v2" });
    });

    it("should allow first save of new public item by any user", async () => {
      const store = new Store(db, attackerContext);
      const result = await store.save({
        key: "new-lesson",
        sortKey: "new-1",
        type: "public",
        ttl: 3600,
        data: { title: "New" },
      });

      expect(result.success).toBe(true);
    });
  });

  describe("unlisted type — non-owner cannot overwrite", () => {
    it("should reject save from non-owner on existing unlisted item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "share-link",
        sortKey: "doc-1",
        type: "unlisted" as DataType,
        ttl: 3600,
        data: { content: "Secret doc" },
      });

      const attackerStore = new Store(db, attackerContext);
      const result = await attackerStore.save({
        key: "share-link",
        sortKey: "doc-1",
        type: "unlisted" as DataType,
        ttl: 3600,
        data: { content: "Replaced!" },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not owner");
    });

    it("should allow owner to update own unlisted item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "share-link",
        sortKey: "doc-1",
        type: "unlisted" as DataType,
        ttl: 3600,
        data: { content: "v1" },
      });

      const result = await ownerStore.save({
        key: "share-link",
        sortKey: "doc-1",
        type: "unlisted" as DataType,
        ttl: 3600,
        data: { content: "v2" },
      });

      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ content: "v2" });
    });
  });

  describe("shared type — anyone can overwrite (by design)", () => {
    it("should allow non-owner to overwrite shared item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "wiki",
        sortKey: "page-1",
        type: "shared" as DataType,
        ttl: 3600,
        data: { content: "Original" },
      });

      const otherStore = new Store(db, attackerContext);
      const result = await otherStore.save({
        key: "wiki",
        sortKey: "page-1",
        type: "shared" as DataType,
        ttl: 3600,
        data: { content: "Updated by other" },
      });

      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ content: "Updated by other" });
    });
  });

  describe("private type — isolated by userId (no change needed)", () => {
    it("different users have separate private namespaces", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "settings",
        sortKey: "theme",
        type: "private",
        ttl: 3600,
        data: { color: "dark" },
      });

      const otherStore = new Store(db, attackerContext);
      const result = await otherStore.get("settings", "theme", "private");
      expect(result.success).toBe(false);
    });
  });
});
