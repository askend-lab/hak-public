// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Store } from "../src/core/store";
import { ServerContext } from "../src/core/types";

import { InMemoryAdapter } from "../src/adapters/memory";
import { FailingDynamoDB } from "./mockDynamoDB";

const ONE_HOUR = 3600;

describe("store.test", () => {
  let db: InMemoryAdapter;
  let store: Store;
  const context: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "user123",
  };

  beforeEach(() => {
    db = new InMemoryAdapter();
    store = new Store(db, context);
  });

  describe("query", () => {
    beforeEach(async () => {
      await store.save({
        key: "user-settings",
        id: "theme",
        type: "private",
        ttl: ONE_HOUR,
        data: { color: "dark" },
      });
      await store.save({
        key: "user-settings",
        id: "lang",
        type: "private",
        ttl: ONE_HOUR,
        data: { lang: "en" },
      });
      await store.save({
        key: "app-config",
        id: "v1",
        type: "private",
        ttl: ONE_HOUR,
        data: {},
      });
    });

    it("should query items by prefix", async () => {
      const result = await store.query("user-", "private");

      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(2);
    });

    it("should return empty array for no matches", async () => {
      const result = await store.query("nonexistent-", "private");

      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(0);
    });

    it("should not find items of different type", async () => {
      const result = await store.query("user-", "public");

      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(0);
    });
  });

  describe("error handling", () => {
    let failingStore: Store;

    beforeEach(() => {
      failingStore = new Store(new FailingDynamoDB(), context);
    });

    it("should handle save errors", async () => {
      const result = await failingStore.save({
        key: "entity1",
        id: "sort1",
        type: "private",
        ttl: ONE_HOUR,
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("DB error");
    });

    it("should handle get errors", async () => {
      const result = await failingStore.get("entity1", "sort1", "private");

      expect(result.success).toBe(false);
      expect(result.error).toContain("DB error");
    });

    it("should handle delete errors", async () => {
      const result = await failingStore.delete("entity1", "sort1", "private");

      expect(result.success).toBe(false);
      expect(result.error).toContain("DB error");
    });

    it("should handle query errors", async () => {
      const result = await failingStore.query("prefix-", "private");

      expect(result.success).toBe(false);
      expect(result.error).toContain("DB error");
    });
  });

  describe("concurrent access", () => {
    it("should handle concurrent saves to different keys", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        store.save({
          key: `entity-${i}`,
          id: `sort-${i}`,
          type: "private",
          ttl: ONE_HOUR,
          data: { index: i },
        }),
      );

      const results = await Promise.all(promises);
      results.forEach((r) => expect(r.success).toBe(true));

      // Verify all items were saved
      for (let i = 0; i < 10; i++) {
        const get = await store.get(`entity-${i}`, `sort-${i}`, "private");
        expect(get.success).toBe(true);
        expect(get.item?.data.index).toBe(i);
      }
    });

    it("should handle concurrent saves to the same key (version conflicts expected)", async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        store.save({
          key: "shared-entity",
          id: "shared-sort",
          type: "private",
          ttl: ONE_HOUR,
          data: { version: i },
        }),
      );

      const results = await Promise.all(promises);
      // With optimistic locking, some saves may fail with version conflicts
      const successes = results.filter((r) => r.success);
      const failures = results.filter((r) => !r.success);
      expect(successes.length).toBeGreaterThanOrEqual(1);
      // Version conflicts are expected for concurrent writes
      failures.forEach((r) => expect(r.error).toContain("modified"));
    });

    it("should handle concurrent reads and writes", async () => {
      await store.save({
        key: "rw-entity",
        id: "rw-sort",
        type: "private",
        ttl: ONE_HOUR,
        data: { initial: true },
      });

      const reads = Array.from({ length: 5 }, () =>
        store.get("rw-entity", "rw-sort", "private"),
      );
      const writes = Array.from({ length: 3 }, (_, i) =>
        store.save({
          key: "rw-entity",
          id: "rw-sort",
          type: "private",
          ttl: ONE_HOUR,
          data: { version: i },
        }),
      );

      const allResults = await Promise.all([...reads, ...writes]);
      // All reads should succeed
      allResults.slice(0, 5).forEach((r) => expect(r.success).toBe(true));
      // At least one write should succeed; others may have version conflicts
      const writeResults = allResults.slice(5);
      expect(writeResults.filter((r) => r.success).length).toBeGreaterThanOrEqual(1);
    });
  });

});
