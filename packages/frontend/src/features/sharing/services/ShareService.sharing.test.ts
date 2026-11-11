// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShareService } from "./ShareService";
import { SimpleStoreAdapter } from "@/services/storage/SimpleStoreAdapter";
import { Task } from "@/types/task";

describe("ShareService sharing flow", () => {
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

  it("should find shared task by shareToken after sharing", async () => {
    // This test verifies the complete sharing flow:
    // 1. User shares a task (shareUserTask is called)
    // 2. Another user (or incognito) opens the share link
    // 3. getTaskByShareToken should find the task

    const taskToShare: Task = {
      id: "task-123",
      userId: "user-1",
      name: "Shared Task",
      description: "Test",
      entries: [],
      speechSequences: [],
      shareToken: "share-token-abc",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Step 1: Share the task
    await shareService.shareUserTask(taskToShare);

    // Verify task was saved to unlisted storage
    expect(mockStorage.saveTaskAsUnlisted).toHaveBeenCalled();
    expect(unlistedTasksStorage["share-token-abc"]).toBeDefined();

    // Step 2: Find the task by share token (simulating incognito access)
    const foundTask = await shareService.getTaskByShareToken("share-token-abc");

    // BUG: This should find the task but may fail if storage isn't working correctly
    expect(foundTask).not.toBeNull();
    expect(foundTask?.id).toBe("task-123");
    expect(foundTask?.name).toBe("Shared Task");
  });

  it("should return null for non-existent share token", async () => {
    const result = await shareService.getTaskByShareToken("non-existent-token");
    expect(result).toBeNull();
  });

  it("should update shared task when re-shared", async () => {
    const task: Task = {
      id: "task-456",
      userId: "user-1",
      name: "Original Name",
      description: "Test",
      entries: [],
      speechSequences: [],
      shareToken: "token-xyz",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Share original
    await shareService.shareUserTask(task);

    // Update and re-share
    const updatedTask = { ...task, name: "Updated Name" };
    await shareService.shareUserTask(updatedTask);

    // Should find updated version
    const found = await shareService.getTaskByShareToken("token-xyz");
    expect(found?.name).toBe("Updated Name");
  });
});
