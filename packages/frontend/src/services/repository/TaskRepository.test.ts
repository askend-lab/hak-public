// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskRepository } from "./TaskRepository";
import { SimpleStoreAdapter } from "../storage/SimpleStoreAdapter";
import { MockDataLoader } from "../storage/MockDataLoader";
import { ShareService } from "../storage/ShareService";
import { Task, TaskEntry } from "@/types/task";

describe("TaskRepository", () => {
  let repository: TaskRepository;
  let storage: {
    loadUserTasks: ReturnType<typeof vi.fn>;
    saveUserTasks: ReturnType<typeof vi.fn>;
    loadBaselineTaskAdditions: ReturnType<typeof vi.fn>;
    saveBaselineTaskAdditions: ReturnType<typeof vi.fn>;
    loadSharedTasks: ReturnType<typeof vi.fn>;
    saveSharedTasks: ReturnType<typeof vi.fn>;
  };
  let mockLoader: MockDataLoader;
  let shareService: ShareService;
  const testUserId = "38001085718";

  const createBaselineTask = (id: string, userId: string): Task => ({
    id,
    userId,
    name: "Baseline Task",
    description: "Test baseline",
    entries: [
      {
        id: "baseline-entry-1",
        taskId: id,
        text: "Entry 1",
        stressedText: "Entry 1",
        audioUrl: null,
        audioBlob: null,
        order: 1,
        createdAt: new Date(),
      },
    ],
    speechSequences: ["Entry 1"],
    createdAt: new Date(),
    updatedAt: new Date(),
    shareToken: "baseline-token",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    storage = {
      loadUserTasks: vi.fn().mockResolvedValue([]),
      saveUserTasks: vi.fn().mockResolvedValue(undefined),
      loadBaselineTaskAdditions: vi.fn().mockResolvedValue({}),
      saveBaselineTaskAdditions: vi.fn().mockResolvedValue(undefined),
      loadSharedTasks: vi.fn().mockResolvedValue([]),
      saveSharedTasks: vi.fn().mockResolvedValue(undefined),
    };
    mockLoader = new MockDataLoader();
    shareService = new ShareService(
      storage as unknown as SimpleStoreAdapter,
      mockLoader,
    );
    repository = new TaskRepository(
      storage as unknown as SimpleStoreAdapter,
      mockLoader,
      shareService,
    );
  });

  describe("updateTask with baseline task", () => {
    it("creates a copy when updating baseline task", async () => {
      const baselineTask = createBaselineTask("baseline-1", testUserId);
      vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
        baselineTask,
      ]);

      const updated = await repository.updateTask(testUserId, "baseline-1", {
        name: "Updated Name",
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.id).not.toBe("baseline-1");
    });

    it("merges baseline additions when copying baseline task", async () => {
      const baselineTask = createBaselineTask("baseline-2", testUserId);
      vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
        baselineTask,
      ]);

      const additions: Record<string, TaskEntry[]> = {
        "baseline-2": [
          {
            id: "added-1",
            taskId: "baseline-2",
            text: "Added",
            stressedText: "Added",
            audioUrl: null,
            audioBlob: null,
            order: 2,
            createdAt: new Date(),
          },
        ],
      };
      storage.loadBaselineTaskAdditions.mockResolvedValue(additions);

      const updated = await repository.updateTask(testUserId, "baseline-2", {
        name: "Updated",
      });

      expect(updated?.entries).toHaveLength(2);
    });

    it("clears baseline additions after copying", async () => {
      const baselineTask = createBaselineTask("baseline-4", testUserId);
      vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
        baselineTask,
      ]);

      const additions: Record<string, TaskEntry[]> = {
        "baseline-4": [
          {
            id: "added-1",
            taskId: "baseline-4",
            text: "Added",
            stressedText: "Added",
            audioUrl: null,
            audioBlob: null,
            order: 2,
            createdAt: new Date(),
          },
        ],
      };
      storage.loadBaselineTaskAdditions.mockResolvedValue(additions);

      await repository.updateTask(testUserId, "baseline-4", { name: "Copy" });

      expect(storage.saveBaselineTaskAdditions).toHaveBeenCalledWith(
        testUserId,
        expect.not.objectContaining({ "baseline-4": expect.anything() }),
      );
    });
  });

  describe("addTextEntriesToTask with baseline task", () => {
    it("stores additions separately for baseline task", async () => {
      const baselineTask = createBaselineTask("baseline-5", testUserId);
      vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
        baselineTask,
      ]);

      const entries = await repository.addTextEntriesToTask(
        testUserId,
        "baseline-5",
        ["New Text"],
      );

      expect(entries).toHaveLength(1);
      expect(entries[0]?.text).toBe("New Text");
      expect(storage.saveBaselineTaskAdditions).toHaveBeenCalledWith(
        testUserId,
        expect.objectContaining({
          "baseline-5": expect.arrayContaining([
            expect.objectContaining({ text: "New Text" }),
          ]),
        }),
      );
    });

    it("appends to existing baseline additions", async () => {
      const baselineTask = createBaselineTask("baseline-6", testUserId);
      vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
        baselineTask,
      ]);

      const existingAdditions: Record<string, TaskEntry[]> = {
        "baseline-6": [
          {
            id: "existing-1",
            taskId: "baseline-6",
            text: "Existing",
            stressedText: "Existing",
            audioUrl: null,
            audioBlob: null,
            order: 2,
            createdAt: new Date(),
          },
        ],
      };
      storage.loadBaselineTaskAdditions.mockResolvedValue(existingAdditions);

      await repository.addTextEntriesToTask(testUserId, "baseline-6", [
        "Another",
      ]);

      expect(storage.saveBaselineTaskAdditions).toHaveBeenCalledWith(
        testUserId,
        expect.objectContaining({
          "baseline-6": expect.arrayContaining([
            expect.objectContaining({ text: "Existing" }),
            expect.objectContaining({ text: "Another" }),
          ]),
        }),
      );
    });
  });

  describe("deleteTask with baseline task", () => {
    it("throws error when trying to delete baseline task", async () => {
      const baselineTask = createBaselineTask("baseline-del-1", testUserId);
      vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
        baselineTask,
      ]);

      await expect(
        repository.deleteTask(testUserId, "baseline-del-1"),
      ).rejects.toThrow("Cannot delete baseline task");
    });
  });

  describe("updateTaskEntry with baseline task", () => {
    it("updates baseline entry by creating task copy", async () => {
      const baselineTask = createBaselineTask("baseline-7", testUserId);
      vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
        baselineTask,
      ]);

      const updated = await repository.updateTaskEntry(
        testUserId,
        "baseline-7",
        "baseline-entry-1",
        {
          text: "Modified",
          stressedText: "Modified",
        },
      );

      expect(updated?.text).toBe("Modified");
    });

    it("updates added entry in baseline task additions", async () => {
      const baselineTask = createBaselineTask("baseline-8", testUserId);
      vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
        baselineTask,
      ]);

      const addedEntry: TaskEntry = {
        id: "added-entry-1",
        taskId: "baseline-8",
        text: "Added",
        stressedText: "Added",
        audioUrl: null,
        audioBlob: null,
        order: 2,
        createdAt: new Date(),
      };
      storage.loadBaselineTaskAdditions.mockResolvedValue({
        "baseline-8": [addedEntry],
      });

      const updated = await repository.updateTaskEntry(
        testUserId,
        "baseline-8",
        "added-entry-1",
        {
          text: "Modified Added",
          stressedText: "Modified Added",
        },
      );

      expect(updated?.text).toBe("Modified Added");
      expect(storage.saveBaselineTaskAdditions).toHaveBeenCalledWith(
        testUserId,
        expect.objectContaining({
          "baseline-8": expect.arrayContaining([
            expect.objectContaining({ text: "Modified Added" }),
          ]),
        }),
      );
    });
  });
});
