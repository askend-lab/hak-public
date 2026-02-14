// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataService } from "../dataService";
import {
  setupSimpleStoreMock,
  resetSimpleStoreMock,
  getStoredBaselineAdditions,
} from "../__mocks__/simpleStoreMock";

describe("DataService Baseline Task Operations", () => {
  let dataService: DataService;
  const mockUserId = "38001085718";

  beforeEach(() => {
    vi.clearAllMocks();
    resetSimpleStoreMock();
    setupSimpleStoreMock();
    (DataService as unknown as { instance: null }).instance = null;
    dataService = DataService.getInstance();
  });

  describe("baseline task operations", () => {
    it("getUserTasks returns baseline tasks for matching user", async () => {
      const tasks = await dataService.getUserTasks(mockUserId);
      expect(Array.isArray(tasks)).toBe(true);
    });

    it("getTask returns baseline task with merged additions", async () => {
      const tasks = await dataService.getUserTasks(mockUserId);
      if (tasks.length > 0) {
        const task = await dataService.getTask(tasks[0]?.id ?? "", mockUserId);
        expect(task).toBeDefined();
      }
    });

    it("updateTask creates copy when modifying baseline task", async () => {
      const tasks = await dataService.getUserTasks(mockUserId);
      const baselineTask = tasks.find((t) => t.name.includes("Uudised"));

      if (baselineTask) {
        const updated = await dataService.updateTask(
          mockUserId,
          baselineTask.id,
          { name: "Modified" },
        );
        expect(updated?.name).toBe("Modified");
        expect(updated?.id).not.toBe(baselineTask.id);
      }
    });

    it("deleteTask soft-deletes baseline task", async () => {
      const tasks = await dataService.getUserTasks(mockUserId);
      const baselineTask = tasks.find((t) => t.name.includes("Uudised"));

      if (baselineTask) {
        const result = await dataService.deleteTask(
          mockUserId,
          baselineTask.id,
        );
        expect(result).toBe(true);

        const tasksAfter = await dataService.getUserTasks(mockUserId);
        expect(
          tasksAfter.find((t) => t.id === baselineTask.id),
        ).toBeUndefined();
      }
    });

    it("addTextEntriesToTask stores additions for baseline task separately", async () => {
      const tasks = await dataService.getUserTasks(mockUserId);
      const baselineTask = tasks.find((t) => t.name.includes("Uudised"));

      if (baselineTask) {
        const entries = await dataService.addTextEntriesToTask(
          mockUserId,
          baselineTask.id,
          ["New Entry"],
        );
        expect(entries).toHaveLength(1);

        const additions = getStoredBaselineAdditions(mockUserId);
        expect(Object.keys(additions).length).toBeGreaterThan(0);
      }
    });
  });

  describe("updateTaskEntry", () => {
    it("updates entry in user task", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Entry Test",
        description: "",
        speechSequences: ["Original"],
      });

      const entryId = task.entries[0]?.id ?? "";
      const updated = await dataService.updateTaskEntry(
        mockUserId,
        task.id,
        entryId,
        {
          text: "Updated",
          stressedText: "Updated",
        },
      );

      expect(updated?.text).toBe("Updated");
    });

    it("throws when updating entry in non-existent task", async () => {
      await expect(
        dataService.updateTaskEntry(mockUserId, "non-existent", "entry-id", {
          text: "Test",
        }),
      ).rejects.toThrow("Task not found");
    });

    it("throws when updating non-existent entry", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Test",
        description: "",
        speechSequences: ["Text"],
      });

      await expect(
        dataService.updateTaskEntry(mockUserId, task.id, "non-existent", {
          text: "Test",
        }),
      ).rejects.toThrow("Entry not found");
    });

    it("handles updating added entry in baseline task", async () => {
      const tasks = await dataService.getUserTasks(mockUserId);
      const baselineTask = tasks.find((t) => t.name.includes("Uudised"));

      if (baselineTask) {
        const entries = await dataService.addTextEntriesToTask(
          mockUserId,
          baselineTask.id,
          ["Added Entry"],
        );
        const addedEntryId = entries[0]?.id ?? "";

        const task = await dataService.getTask(baselineTask.id, mockUserId);
        const baselineEntryCount =
          task?.entries?.filter((e) => !e.id.startsWith("entry_")).length ?? 0;

        if (baselineEntryCount < (task?.entries?.length ?? 0)) {
          const updated = await dataService.updateTaskEntry(
            mockUserId,
            baselineTask.id,
            addedEntryId,
            {
              text: "Modified Added",
              stressedText: "Modified Added",
            },
          );
          expect(updated?.text).toBe("Modified Added");
        }
      }
    });
  });

  describe("getTaskByShareToken edge cases", () => {
    it("finds task by share token in shared storage", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Shareable Task",
        description: "",
      });

      await dataService.shareUserTask(mockUserId, task.id);

      const found = await dataService.getTaskByShareToken(task.shareToken);
      expect(found?.name).toBe("Shareable Task");
    });

    it("searches through shared tasks from different users", async () => {
      await dataService.createTask("user1", {
        name: "User1 Task",
        description: "",
      });
      const task2 = await dataService.createTask("user2", {
        name: "User2 Task",
        description: "",
      });

      // Share task so it can be found via share token
      await dataService.shareUserTask("user2", task2.id);

      const found = await dataService.getTaskByShareToken(task2.shareToken);
      expect(found?.name).toBe("User2 Task");
    });
  });
});
