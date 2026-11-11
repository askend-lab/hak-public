// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * TDD tests for 4-type data access system (private, unlisted)
 *
 * Types:
 * - private: only owner sees, only owner modifies
 * - unlisted: owner modifies, anyone with exact key can read, no query/search
 */

import { Store } from "../src/core/store";
import { ServerContext } from "../src/core/types";
import { InMemoryAdapter } from "../src/adapters/memory";

describe("dataTypes.test", () => {
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

  describe("private type", () => {
    it("owner can save private item", async () => {
      const store = new Store(db, ownerContext);
      const result = await store.save({
        key: "my-data",
        id: "key1",
        type: "private",
        ttl: 3600,
        data: { secret: "value" },
      });
      expect(result.success).toBe(true);
    });

    it("owner can read own private item", async () => {
      const store = new Store(db, ownerContext);
      await store.save({
        key: "my-data",
        id: "key1",
        type: "private",
        ttl: 3600,
        data: { secret: "value" },
      });

      const result = await store.get("my-data", "key1", "private");
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ secret: "value" });
    });

    it("other user cannot read private item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "my-data",
        id: "key1",
        type: "private",
        ttl: 3600,
        data: { secret: "value" },
      });

      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.get("my-data", "key1", "private");
      expect(result.success).toBe(false);
    });

    it("owner can delete own private item", async () => {
      const store = new Store(db, ownerContext);
      await store.save({
        key: "my-data",
        id: "key1",
        type: "private",
        ttl: 3600,
        data: {},
      });

      const result = await store.delete("my-data", "key1", "private");
      expect(result.success).toBe(true);
    });

    it("owner can query own private items", async () => {
      const store = new Store(db, ownerContext);
      await store.save({
        key: "settings",
        id: "theme",
        type: "private",
        ttl: 3600,
        data: {},
      });
      await store.save({
        key: "settings",
        id: "lang",
        type: "private",
        ttl: 3600,
        data: {},
      });

      const result = await store.query("settings", "private");
      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(2);
    });
  });

});
