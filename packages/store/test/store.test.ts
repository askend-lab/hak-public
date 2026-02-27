// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Store } from "../src/core/store";
import { ServerContext, StoreRequest } from "../src/core/types";

import { InMemoryAdapter } from "../src/adapters/memory";

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

  describe("save", () => {
    it("should save an item successfully", async () => {
      const request: StoreRequest = {
        key: "entity1",
        id: "sort1",
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
      const result = await store.save({ key: "entity1", id: "sort1", type: "private", ttl, data: {} });
      expect(result.success).toBe(expectedSuccess);
      if (!expectedSuccess) {expect(result.error).toContain("TTL");}
    });

    it("should set owner and timestamps from context", async () => {
      const result = await store.save({ key: "entity1", id: "sort1", type: "public", ttl: ONE_HOUR, data: {} });
      expect(result.item?.owner).toBe(context.userId);
      expect(result.item?.createdAt).toBeDefined();
      expect(result.item?.updatedAt).toBeDefined();
    });

    it("should default data to empty object when undefined", async () => {
      const result = await store.save({ key: "entity1", id: "sort1", type: "public", ttl: 3600 } as StoreRequest);
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({});
    });

    it("should increment version on each save", async () => {
      const req: StoreRequest = { key: "entity1", id: "sort1", type: "private", ttl: ONE_HOUR, data: { name: "v1" } };
      const r1 = await store.save(req);
      expect(r1.item?.version).toBe(1);
      const r2 = await store.save({ ...req, data: { name: "v2" } });
      expect(r2.item?.version).toBe(2);
      const r3 = await store.save({ ...req, data: { name: "v3" } });
      expect(r3.item?.version).toBe(3);
    });

    it("should preserve createdAt when updating existing item", async () => {
      const request: StoreRequest = {
        key: "entity1",
        id: "sort1",
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
        key: "entity1",
        id: "sort1",
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
        key: "entity1",
        id: "sort1",
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
        key: "entity1",
        id: "sort1",
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
        key: "entity1",
        id: "sort1",
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

});
