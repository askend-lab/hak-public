// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataService } from "./dataService";
import {
  setupSimpleStoreMock,
  resetSimpleStoreMock,
} from "./__mocks__/simpleStoreMock";

describe("DataService Error Handling and Edge Cases", () => {
  let dataService: DataService;
  const mockUserId = "38001085718";

  beforeEach(() => {
    vi.clearAllMocks();
    resetSimpleStoreMock();
    setupSimpleStoreMock();
    (DataService as unknown as { instance: null }).instance = null;
    dataService = DataService.getInstance();
  });

  describe("SimpleStore error handling", () => {
    it("throws error on fetch failure for user tasks", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(dataService.getUserCreatedTasks(mockUserId)).rejects.toThrow(
        "Network error",
      );
    });

    it("throws error on fetch failure during save", async () => {
      // First call succeeds (load), second fails (save)
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 1) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.reject(new Error("Save failed"));
      });

      await expect(
        dataService.createTask(mockUserId, { name: "Test", description: "" }),
      ).rejects.toThrow("Save failed");
    });

    it("handles 404 responses gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const tasks = await dataService.getUserTasks(mockUserId);
      expect(Array.isArray(tasks)).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe("addEntryToTask", () => {
    it("adds entry to user-created task", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Task with Entry",
        description: "Test",
      });

      const entry = await dataService.addEntryToTask(mockUserId, task.id, {
        text: "New Entry",
        stressedText: "New Entry",
        audioUrl: null,
        audioBlob: null,
        order: 1,
      });

      expect(entry.text).toBe("New Entry");
      expect(entry.taskId).toBe(task.id);
      expect(entry.id).toBeDefined();
    });

    it("throws when adding entry to non-existent task", async () => {
      await expect(
        dataService.addEntryToTask(mockUserId, "non-existent", {
          text: "Entry",
          stressedText: "Entry",
          audioUrl: null,
          audioBlob: null,
          order: 1,
        }),
      ).rejects.toThrow("Task not found");
    });
  });

  describe("addTextEntriesToTask", () => {
    it("adds multiple string entries", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Multi Entry Task",
        description: "Test",
      });

      const entries = await dataService.addTextEntriesToTask(
        mockUserId,
        task.id,
        ["Entry 1", "Entry 2", "Entry 3"],
      );

      expect(entries).toHaveLength(3);
      expect(entries[0]?.text).toBe("Entry 1");
      expect(entries[2]?.text).toBe("Entry 3");
    });

    it("adds multiple object entries with stressed text", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Stressed Entry Task",
        description: "Test",
      });

      const entries = await dataService.addTextEntriesToTask(
        mockUserId,
        task.id,
        [
          { text: "Hello", stressedText: "Hel·lo" },
          { text: "World", stressedText: "World" },
        ],
      );

      expect(entries).toHaveLength(2);
      expect(entries[0]?.stressedText).toBe("Hel·lo");
    });

    it("throws when adding entries to non-existent task", async () => {
      await expect(
        dataService.addTextEntriesToTask(mockUserId, "non-existent", ["Entry"]),
      ).rejects.toThrow("Task not found");
    });

    it("calculates correct order for new entries", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Order Test",
        description: "Test",
        speechSequences: ["Existing 1", "Existing 2"],
      });

      const entries = await dataService.addTextEntriesToTask(
        mockUserId,
        task.id,
        ["New 1", "New 2"],
      );

      expect(entries[0]?.order).toBe(3);
      expect(entries[1]?.order).toBe(4);
    });
  });

  describe("updateTaskEntry", () => {
    it("updates entry in user-created task", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Entry Update Task",
        description: "Test",
        speechSequences: ["Original text"],
      });

      const entryId = task.entries[0]?.id ?? "";

      const updated = await dataService.updateTaskEntry(
        mockUserId,
        task.id,
        entryId,
        { text: "Updated text", stressedText: "Updated text" },
      );

      expect(updated?.text).toBe("Updated text");
    });

    it("throws when task not found", async () => {
      await expect(
        dataService.updateTaskEntry(mockUserId, "non-existent", "entry-id", {
          text: "Test",
        }),
      ).rejects.toThrow("Task not found");
    });

    it("throws when entry not found", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Task",
        description: "Test",
        speechSequences: ["Text"],
      });

      await expect(
        dataService.updateTaskEntry(mockUserId, task.id, "non-existent-entry", {
          text: "Test",
        }),
      ).rejects.toThrow("Entry not found");
    });
  });

  describe("getTaskByShareToken edge cases", () => {
    it("returns null when task not found", async () => {
      const result =
        await dataService.getTaskByShareToken("non-existent-token");
      expect(result).toBeNull();
    });

    it("finds task by shareToken", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Shared Task",
        description: "",
      });
      await dataService.shareUserTask(mockUserId, task.id);

      const result = await dataService.getTaskByShareToken(task.shareToken);
      expect(result?.name).toBe("Shared Task");
    });
  });

  describe("shareUserTask error handling", () => {
    it("handles fetch error during share", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Task to Share",
        description: "Test",
      });

      // Make save fail for unlisted tasks
      const originalFetch = global.fetch;
      global.fetch = vi
        .fn()
        .mockImplementation(async (url: string, options?: RequestInit) => {
          if (
            options?.method === "POST" &&
            (options?.body as string)?.includes('"type":"unlisted"')
          ) {
            return {
              ok: false,
              text: async (): Promise<string> => "Save error",
            };
          }
          return originalFetch(url, options);
        });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(
        dataService.shareUserTask(mockUserId, task.id),
      ).rejects.toThrow("Failed to share task");

      consoleSpy.mockRestore();
      global.fetch = originalFetch;
    });
  });
});
