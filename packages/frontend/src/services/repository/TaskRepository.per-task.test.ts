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

  describe("getUserTasks", () => {
    it("uses queryUserTasks instead of loading all tasks as blob", async () => {
      const tasks = [createTask("t1", "Alpha"), createTask("t2", "Beta")];
      storage.queryUserTasks.mockResolvedValue(tasks);

      const result = await repository.getUserTasks(testUserId);

      expect(storage.queryUserTasks).toHaveBeenCalledOnce();
      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe("Alpha");
      expect(result[1]?.name).toBe("Beta");
    });

    it("returns empty array when no tasks", async () => {
      storage.queryUserTasks.mockResolvedValue([]);

      const result = await repository.getUserTasks(testUserId);

      expect(result).toEqual([]);
    });
  });

  describe("getTask", () => {
    it("uses getTask to fetch single task instead of loading all", async () => {
      const task = createTask("t1");
      storage.getTask.mockResolvedValue(task);

      const result = await repository.getTask("t1", testUserId);

      expect(storage.getTask).toHaveBeenCalledWith("t1");
      expect(result).toEqual(task);
    });

    it("returns null when task not found", async () => {
      storage.getTask.mockResolvedValue(null);

      const result = await repository.getTask("nonexistent", testUserId);

      expect(result).toBeNull();
    });
  });

  describe("createTask", () => {
    it("saves only the new task, not all tasks", async () => {
      const result = await repository.createTask(testUserId, {
        name: "New Task",
      });

      expect(storage.saveTask).toHaveBeenCalledOnce();
      const savedTask = storage.saveTask.mock.calls[0]?.[0] as Task;
      expect(savedTask.name).toBe("New Task");
      expect(savedTask.userId).toBe(testUserId);
      expect(savedTask.id).toMatch(/^task_/);
      expect(result.name).toBe("New Task");
    });

    it("also saves as unlisted for sharing", async () => {
      await repository.createTask(testUserId, { name: "Shared" });

      expect(storage.saveTaskAsUnlisted).toHaveBeenCalledOnce();
    });
  });

  describe("updateTask", () => {
    it("fetches single task, updates it, saves it back", async () => {
      const task = createTask("t1", "Old Name");
      storage.getTask.mockResolvedValue(task);

      const result = await repository.updateTask(testUserId, "t1", {
        name: "New Name",
      });

      expect(storage.getTask).toHaveBeenCalledWith("t1");
      expect(storage.saveTask).toHaveBeenCalledOnce();
      const savedTask = storage.saveTask.mock.calls[0]?.[0] as Task;
      expect(savedTask.name).toBe("New Name");
      expect(result?.name).toBe("New Name");
    });

    it("throws when task not found", async () => {
      storage.getTask.mockResolvedValue(null);

      await expect(
        repository.updateTask(testUserId, "nonexistent", { name: "X" }),
      ).rejects.toThrow("Task not found");
    });

    it("syncs unlisted storage after update", async () => {
      storage.getTask.mockResolvedValue(createTask("t1"));

      await repository.updateTask(testUserId, "t1", { name: "Updated" });

      expect(storage.saveTaskAsUnlisted).toHaveBeenCalledOnce();
    });
  });

  describe("deleteTask", () => {
    it("deletes single task by id", async () => {
      storage.getTask.mockResolvedValue(createTask("t1"));

      const result = await repository.deleteTask(testUserId, "t1");

      expect(storage.deleteTask).toHaveBeenCalledWith("t1");
      expect(result).toBe(true);
    });

    it("throws when task not found", async () => {
      storage.getTask.mockResolvedValue(null);

      await expect(
        repository.deleteTask(testUserId, "nonexistent"),
      ).rejects.toThrow("Task not found");
    });
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
        testUserId,
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
        testUserId,
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
        testUserId,
        "t1",
        "e1",
        { text: "Updated", stressedText: "Updated" },
      );

      expect(storage.getTask).toHaveBeenCalledWith("t1");
      expect(result?.text).toBe("Updated");
    });
  });
});
