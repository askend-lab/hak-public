// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskRepository } from "./TaskRepository";
import { SimpleStoreAdapter } from "../storage/SimpleStoreAdapter";
import { ShareService } from "@/features/sharing/services/ShareService";
import { Task } from "@/types/task";

describe("TaskRepository append/replace mode", () => {
  let repository: TaskRepository;
  let storage: {
    loadUserTasks: ReturnType<typeof vi.fn>;
    saveUserTasks: ReturnType<typeof vi.fn>;
    saveTaskAsUnlisted: ReturnType<typeof vi.fn>;
  };
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

  beforeEach(() => {
    vi.clearAllMocks();
    storage = {
      loadUserTasks: vi.fn().mockResolvedValue([]),
      saveUserTasks: vi.fn().mockResolvedValue(undefined),
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

});
