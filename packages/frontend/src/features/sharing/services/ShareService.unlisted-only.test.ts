// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShareService } from "./ShareService";
import { SimpleStoreAdapter } from "@/services/storage/SimpleStoreAdapter";
import { Task } from "@/types/task";

describe("ShareService unlisted-only architecture", () => {
  let shareService: ShareService;
  let mockStorage: SimpleStoreAdapter;

  let unlistedTasksStorage: Record<string, Task>;

  beforeEach(() => {
    unlistedTasksStorage = {};

    mockStorage = {
      saveTaskAsUnlisted: vi.fn().mockImplementation((task: Task) => {
        if (task.shareToken) {
          unlistedTasksStorage[task.shareToken] = task;
        }
        return Promise.resolve();
      }),
      getTaskByShareToken: vi.fn().mockImplementation((token: string) => {
        return Promise.resolve(unlistedTasksStorage[token] || null);
      }),
    } as unknown as SimpleStoreAdapter;

    shareService = new ShareService(mockStorage);
  });

  it("shareUserTask saves to unlisted storage only", async () => {
    const task: Task = {
      id: "task-123",
      userId: "user-1",
      name: "Test Task",
      description: "Test",
      entries: [],
      speechSequences: [],
      shareToken: "token-abc",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await shareService.shareUserTask(task);

    // Should save to unlisted storage
    expect(mockStorage.saveTaskAsUnlisted).toHaveBeenCalledWith(task);
    expect(unlistedTasksStorage["token-abc"]).toBeDefined();
  });

  it("getTaskByShareToken uses unlisted storage", async () => {
    // Pre-populate unlisted storage
    unlistedTasksStorage["token-xyz"] = {
      id: "task-456",
      userId: "user-1",
      name: "Unlisted Task",
      description: "",
      entries: [],
      speechSequences: [],
      shareToken: "token-xyz",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const found = await shareService.getTaskByShareToken("token-xyz");

    expect(found).not.toBeNull();
    expect(found?.name).toBe("Unlisted Task");
  });
});
