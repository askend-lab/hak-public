// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskRepository } from "./TaskRepository";
import { SimpleStoreAdapter } from "../storage/SimpleStoreAdapter";
import { MockDataLoader } from "../storage/MockDataLoader";
import { ShareService } from "@/features/sharing/services/ShareService";
import { Task, TaskEntry } from "@/types/task";

describe("TaskRepository append/replace mode", () => {
  let repository: TaskRepository;
  let storage: {
    loadUserTasks: ReturnType<typeof vi.fn>;
    saveUserTasks: ReturnType<typeof vi.fn>;
    loadBaselineTaskAdditions: ReturnType<typeof vi.fn>;
    saveBaselineTaskAdditions: ReturnType<typeof vi.fn>;
    loadSharedTasks: ReturnType<typeof vi.fn>;
    saveSharedTasks: ReturnType<typeof vi.fn>;
    findAllUserTaskKeys: ReturnType<typeof vi.fn>;
    loadTasksByKey: ReturnType<typeof vi.fn>;
    saveTaskAsUnlisted: ReturnType<typeof vi.fn>;
  };
  let mockLoader: MockDataLoader;
  const testUserId = "38001085718";

  const createUserTask = (id: string): Task => ({
    id,
    userId: testUserId,
    name: "User Task",
    description: "Test",
    entries: [
      {
        id: "old-entry-1",
        taskId: id,
        text: "Old sentence",
        stressedText: "Old sentence",
        audioUrl: null,
        audioBlob: null,
        order: 1,
        createdAt: new Date(),
      },
    ],
    speechSequences: ["Old sentence"],
    createdAt: new Date(),
    updatedAt: new Date(),
    shareToken: "token-1",
  });

  const createBaselineTask = (id: string): Task => ({
    id,
    userId: testUserId,
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
      findAllUserTaskKeys: vi.fn().mockResolvedValue([]),
      loadTasksByKey: vi.fn().mockResolvedValue([]),
      saveTaskAsUnlisted: vi.fn().mockResolvedValue(undefined),
    };
    mockLoader = new MockDataLoader();
    const shareService = new ShareService(
      storage as unknown as SimpleStoreAdapter,
      mockLoader,
    );
    repository = new TaskRepository(
      storage as unknown as SimpleStoreAdapter,
      mockLoader,
      shareService,
    );
  });

  it("appends entries by default (backward compatible)", async () => {
    const task = createUserTask("task-append-1");
    storage.loadUserTasks.mockResolvedValue([task]);

    await repository.addTextEntriesToTask(
      testUserId,
      "task-append-1",
      ["New sentence"],
    );

    const savedTasks = storage.saveUserTasks.mock.calls[0]?.[1] as Task[];
    const savedTask = savedTasks?.find((t) => t.id === "task-append-1");
    expect(savedTask?.entries).toHaveLength(2);
    expect(savedTask?.entries[0]?.text).toBe("Old sentence");
    expect(savedTask?.entries[1]?.text).toBe("New sentence");
  });

  it("appends entries when mode is 'append'", async () => {
    const task = createUserTask("task-append-2");
    storage.loadUserTasks.mockResolvedValue([task]);

    await repository.addTextEntriesToTask(
      testUserId,
      "task-append-2",
      ["New sentence"],
      "append",
    );

    const savedTasks = storage.saveUserTasks.mock.calls[0]?.[1] as Task[];
    const savedTask = savedTasks?.find((t) => t.id === "task-append-2");
    expect(savedTask?.entries).toHaveLength(2);
    expect(savedTask?.entries[0]?.text).toBe("Old sentence");
    expect(savedTask?.entries[1]?.text).toBe("New sentence");
  });

  it("replaces all entries when mode is 'replace'", async () => {
    const task = createUserTask("task-replace-1");
    storage.loadUserTasks.mockResolvedValue([task]);

    await repository.addTextEntriesToTask(
      testUserId,
      "task-replace-1",
      ["Replacement A", "Replacement B"],
      "replace",
    );

    const savedTasks = storage.saveUserTasks.mock.calls[0]?.[1] as Task[];
    const savedTask = savedTasks?.find((t) => t.id === "task-replace-1");
    expect(savedTask?.entries).toHaveLength(2);
    expect(savedTask?.entries[0]?.text).toBe("Replacement A");
    expect(savedTask?.entries[1]?.text).toBe("Replacement B");
    expect(savedTask?.speechSequences).toEqual(["Replacement A", "Replacement B"]);
  });

  it("replace mode starts order from 1", async () => {
    const task = createUserTask("task-replace-2");
    storage.loadUserTasks.mockResolvedValue([task]);

    const entries = await repository.addTextEntriesToTask(
      testUserId,
      "task-replace-2",
      ["First", "Second"],
      "replace",
    );

    expect(entries[0]?.order).toBe(1);
    expect(entries[1]?.order).toBe(2);
  });

  it("replace mode clears baseline additions", async () => {
    const baselineTask = createBaselineTask("baseline-replace-1");
    vi.spyOn(mockLoader, "loadBaselineTasks").mockResolvedValue([
      baselineTask,
    ]);

    const existingAdditions: Record<string, TaskEntry[]> = {
      "baseline-replace-1": [
        {
          id: "old-addition",
          taskId: "baseline-replace-1",
          text: "Old addition",
          stressedText: "Old addition",
          audioUrl: null,
          audioBlob: null,
          order: 2,
          createdAt: new Date(),
        },
      ],
    };
    storage.loadBaselineTaskAdditions.mockResolvedValue(existingAdditions);

    await repository.addTextEntriesToTask(
      testUserId,
      "baseline-replace-1",
      ["Replacement"],
      "replace",
    );

    const savedAdditions = storage.saveBaselineTaskAdditions.mock.calls[0]?.[1] as Record<string, TaskEntry[]>;
    expect(savedAdditions["baseline-replace-1"]).toHaveLength(1);
    expect(savedAdditions["baseline-replace-1"]?.[0]?.text).toBe("Replacement");
  });
});
