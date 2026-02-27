// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * TDD tests for 4-type data access system (public, shared, type isolation)
 *
 * Types:
 * - public: everyone sees/searches, only owner modifies
 * - shared: everyone sees, everyone can modify
 */

import { Store, ERRORS } from "../src/core/store";
import { ServerContext, DataType } from "../src/core/types";
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

  describe("shared type", () => {
    it("any user can save shared item", async () => {
      const store = new Store(db, ownerContext);
      const result = await store.save({
        key: "wiki",
        id: "page1",
        type: "shared" as DataType,
        ttl: 3600,
        data: { content: "Initial content" },
      });
      expect(result.success).toBe(true);
    });

    it("any user can read shared item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "wiki",
        id: "page1",
        type: "shared" as DataType,
        ttl: 3600,
        data: { content: "Hello" },
      });

      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.get(
        "wiki",
        "page1",
        "shared" as DataType,
      );
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ content: "Hello" });
    });

    it("any user can query shared items", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "wiki",
        id: "page1",
        type: "shared" as DataType,
        ttl: 3600,
        data: {},
      });
      await ownerStore.save({
        key: "wiki",
        id: "page2",
        type: "shared" as DataType,
        ttl: 3600,
        data: {},
      });

      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.query("wiki", "shared" as DataType);
      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(2);
    });

    it("non-owner cannot delete shared item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "wiki",
        id: "page1",
        type: "shared" as DataType,
        ttl: 3600,
        data: {},
      });

      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.delete(
        "wiki",
        "page1",
        "shared" as DataType,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERRORS.ACCESS_DENIED);
    });

    it("owner can delete shared item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "wiki",
        id: "page1",
        type: "shared" as DataType,
        ttl: 3600,
        data: {},
      });

      const result = await ownerStore.delete(
        "wiki",
        "page1",
        "shared" as DataType,
      );
      expect(result.success).toBe(true);
    });

    it("any user can overwrite shared item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "wiki",
        id: "page1",
        type: "shared" as DataType,
        ttl: 3600,
        data: { v: 1 },
      });

      const otherStore = new Store(db, otherUserContext);
      const saveResult = await otherStore.save({
        key: "wiki",
        id: "page1",
        type: "shared" as DataType,
        ttl: 3600,
        data: { v: 2 },
      });
      expect(saveResult.success).toBe(true);

      const getResult = await ownerStore.get(
        "wiki",
        "page1",
        "shared" as DataType,
      );
      expect(getResult.item?.data).toStrictEqual({ v: 2 });
    });
  });

});
