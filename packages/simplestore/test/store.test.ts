// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Store } from "../src/core/store";
import { ServerContext, StoreRequest } from "../src/core/types";

import { InMemoryAdapter } from "../src/adapters/memory";
import { FailingDynamoDB } from "./mockDynamoDB";

const ONE_HOUR = 3600;

describe("Store", () => {
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

  describe("save", () => {
    it("should save an item successfully", async () => {
      const request: StoreRequest = {
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: ONE_HOUR,
        data: { name: "test" },
      };

      const result = await store.save(request);

      expect(result.success).toBe(true);
      expect(result.item).toBeDefined();
      expect(result.item?.data).toStrictEqual({ name: "test" });
      expect(result.item?.owner).toBe("user123");
      expect(db.size()).toBe(1);
    });

    it.each([
      ["zero TTL (no expiration)", 0, true],
      ["negative TTL", -1, false],
    ])("should handle %s", async (_name, ttl, expectedSuccess) => {
      const result = await store.save({ pk: "entity1", sk: "sort1", type: "private", ttl, data: {} });
      expect(result.success).toBe(expectedSuccess);
      if (!expectedSuccess) expect(result.error).toContain("TTL");
    });

    it("should set owner and timestamps from context", async () => {
      const result = await store.save({ pk: "entity1", sk: "sort1", type: "public", ttl: ONE_HOUR, data: {} });
      expect(result.item?.owner).toBe(context.userId);
      expect(result.item?.createdAt).toBeDefined();
      expect(result.item?.updatedAt).toBeDefined();
    });

    it("should default data to empty object when undefined", async () => {
      const result = await store.save({ pk: "entity1", sk: "sort1", type: "public", ttl: 3600 } as StoreRequest);
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({});
    });

    it("should increment version on each save", async () => {
      const req: StoreRequest = { pk: "entity1", sk: "sort1", type: "private", ttl: ONE_HOUR, data: { name: "v1" } };
      const r1 = await store.save(req);
      expect(r1.item?.version).toBe(1);
      const r2 = await store.save({ ...req, data: { name: "v2" } });
      expect(r2.item?.version).toBe(2);
      const r3 = await store.save({ ...req, data: { name: "v3" } });
      expect(r3.item?.version).toBe(3);
    });

    it("should preserve createdAt when updating existing item", async () => {
      const request: StoreRequest = {
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: ONE_HOUR,
        data: { version: 1 },
      };

      const createResult = await store.save(request);
      const originalCreatedAt = createResult.item?.createdAt;

      // Wait a bit to ensure timestamps differ
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updateResult = await store.save({
        ...request,
        data: { version: 2 },
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.item?.createdAt).toStrictEqual(originalCreatedAt);
      expect(updateResult.item?.data).toStrictEqual({ version: 2 });
    });
  });

  describe("get", () => {
    it("should retrieve existing item", async () => {
      await store.save({
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: ONE_HOUR,
        data: { value: 42 },
      });

      const result = await store.get("entity1", "sort1", "private");

      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ value: 42 });
    });

    it("should return error for non-existent item", async () => {
      const result = await store.get("nonexistent", "sort1", "private");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should not find private item when querying as public", async () => {
      await store.save({
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: ONE_HOUR,
        data: {},
      });

      const result = await store.get("entity1", "sort1", "public");

      expect(result.success).toBe(false);
    });
  });

  describe("delete", () => {
    it("should delete own item", async () => {
      await store.save({
        pk: "entity1",
        sk: "sort1",
        type: "private",
        ttl: ONE_HOUR,
        data: {},
      });

      const result = await store.delete("entity1", "sort1", "private");

      expect(result.success).toBe(true);
      expect(db.size()).toBe(0);
    });

    it("should not delete non-existent item", async () => {
      const result = await store.delete("nonexistent", "sort1", "private");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should not delete item owned by another user", async () => {
      await store.save({
        pk: "entity1",
        sk: "sort1",
        type: "public",
        ttl: ONE_HOUR,
        data: {},
      });

      const otherContext: ServerContext = { ...context, userId: "otherUser" };
      const otherStore = new Store(db, otherContext);

      const result = await otherStore.delete("entity1", "sort1", "public");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not owner");
      expect(db.size()).toBe(1);
    });
  });

  describe("query", () => {
    beforeEach(async () => {
      await store.save({
        pk: "user-settings",
        sk: "theme",
        type: "private",
        ttl: ONE_HOUR,
        data: { color: "dark" },
      });
      await store.save({
        pk: "user-settings",
        sk: "lang",
        type: "private",
        ttl: ONE_HOUR,
        data: { lang: "en" },
      });
      await store.save({
        pk: "app-config",
        sk: "v1",
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
        pk: "entity1",
        sk: "sort1",
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
          pk: `entity-${i}`,
          sk: `sort-${i}`,
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
          pk: "shared-entity",
          sk: "shared-sort",
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
        pk: "rw-entity",
        sk: "rw-sort",
        type: "private",
        ttl: ONE_HOUR,
        data: { initial: true },
      });

      const reads = Array.from({ length: 5 }, () =>
        store.get("rw-entity", "rw-sort", "private"),
      );
      const writes = Array.from({ length: 3 }, (_, i) =>
        store.save({
          pk: "rw-entity",
          sk: "rw-sort",
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

  describe("TTL calculation", () => {
    it("should calculate TTL correctly (future timestamp)", async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const result = await store.save({
        pk: "ttl-test",
        sk: "sort1",
        type: "private",
        ttl: ONE_HOUR,
        data: {},
      });

      expect(result.success).toBe(true);
      // TTL should be in the future, roughly now + ONE_HOUR
      const ttlValue = result.item?.ttl;
      expect(ttlValue).toBeGreaterThan(nowSeconds);
      expect(ttlValue).toBeLessThan(nowSeconds + ONE_HOUR + 10); // Allow 10s tolerance
    });

    it("should use key delimiter in composite keys", async () => {
      const result = await store.save({
        pk: "pk-part",
        sk: "sk-part",
        type: "private",
        ttl: ONE_HOUR,
        data: {},
      });

      expect(result.success).toBe(true);
      // The PK should contain the delimiter (default "#")
      expect(result.item?.PK).toContain("#");
    });
  });

  describe("config handling", () => {
    it("should use custom config when provided", () => {
      const customStore = new Store(db, context, {
        maxTtlSeconds: 1000,
        maxDataSizeBytes: 350000,
        keyDelimiter: "|",
      });
      expect(customStore).toBeDefined();
    });
  });
});
