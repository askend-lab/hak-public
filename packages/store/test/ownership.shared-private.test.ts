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

describe("ownership: shared and private", () => {
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

  describe("shared type — anyone can overwrite (by design)", () => {
    it("should allow non-owner to overwrite shared item", async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({
        key: "wiki",
        id: "page-1",
        type: "shared" as DataType,
        ttl: 3600,
        data: { content: "Original" },
      });

      const otherStore = new Store(db, attackerContext);
      const result = await otherStore.save({
        key: "wiki",
        id: "page-1",
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
        id: "theme",
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
