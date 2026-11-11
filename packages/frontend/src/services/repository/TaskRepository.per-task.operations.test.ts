// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskRepository } from "./TaskRepository";
import { SimpleStoreAdapter } from "../storage/SimpleStoreAdapter";
import { ShareService } from "@/features/sharing/services/ShareService";
import { Task } from "@/types/task";

describe("TaskRepository per-task storage", () => {
  let repository: TaskRepository;
  let storage: {
    queryUserTasks: ReturnType<typeof vi.fn>;
    getTask: ReturnType<typeof vi.fn>;
    saveTask: ReturnType<typeof vi.fn>;
    deleteTask: ReturnType<typeof vi.fn>;
    deleteUnlistedTask: ReturnType<typeof vi.fn>;
    saveTaskAsUnlisted: ReturnType<typeof vi.fn>;
  };
  const testUserId = "38001085718";

  const createTask = (id: string, name = "Task"): Task => ({
    id,
    userId: testUserId,
    name,
    description: "desc",
    entries: [],
    speechSequences: [],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    shareToken: `share-${id}`,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    storage = {
      queryUserTasks: vi.fn().mockResolvedValue([]),
      getTask: vi.fn().mockResolvedValue(null),
      saveTask: vi.fn().mockResolvedValue(undefined),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      deleteUnlistedTask: vi.fn().mockResolvedValue(undefined),
      saveTaskAsUnlisted: vi.fn().mockResolvedValue(undefined),
    };
    const shareService = new ShareService(
      storage as unknown as SimpleStoreAdapter,
    );
    repository = new TaskRepository(
      storage as unknown as SimpleStoreAdapter,
      shareService,
    );
  });

  describe("addTextEntriesToTask", () => {
    it("appends entries to existing task without loading all tasks", async () => {
      const task = createTask("t1");
      task.entries = [
        {
          id: "e1",
          taskId: "t1",
          text: "Old",
          stressedText: "Old",
          audioUrl: null,
          audioBlob: null,
          order: 1,
          createdAt: new Date(),
        },
      ];
      task.speechSequences = ["Old"];
      storage.getTask.mockResolvedValue(task);

      const entries = await repository.addTextEntriesToTask(
        "t1",
        ["New"],
        "append",
      );

      expect(storage.getTask).toHaveBeenCalledWith("t1");
      expect(entries).toHaveLength(1);
      expect(entries[0]?.text).toBe("New");
      const savedTask = storage.saveTask.mock.calls[0]?.[0] as Task;
      expect(savedTask.entries).toHaveLength(2);
    });

    it("replaces entries in existing task", async () => {
      const task = createTask("t1");
      task.entries = [
        {
          id: "e1",
          taskId: "t1",
          text: "Old",
          stressedText: "Old",
          audioUrl: null,
          audioBlob: null,
          order: 1,
          createdAt: new Date(),
        },
      ];
      storage.getTask.mockResolvedValue(task);

      const entries = await repository.addTextEntriesToTask(
        "t1",
        ["A", "B"],
        "replace",
      );

      expect(entries).toHaveLength(2);
      const savedTask = storage.saveTask.mock.calls[0]?.[0] as Task;
      expect(savedTask.entries).toHaveLength(2);
      expect(savedTask.entries[0]?.text).toBe("A");
    });
  });

  describe("updateTaskEntry", () => {
    it("updates single entry without loading all tasks", async () => {
      const task = createTask("t1");
      task.entries = [
        {
          id: "e1",
          taskId: "t1",
          text: "Original",
          stressedText: "Original",
          audioUrl: null,
          audioBlob: null,
          order: 1,
          createdAt: new Date(),
        },
      ];
      storage.getTask.mockResolvedValue(task);

      const result = await repository.updateTaskEntry(
        "t1",
        "e1",
        { text: "Updated", stressedText: "Updated" },
      );

      expect(storage.getTask).toHaveBeenCalledWith("t1");
      expect(result?.text).toBe("Updated");
    });
  });

});
