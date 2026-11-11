// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataService } from "../dataService";
import {
  setupSimpleStoreMock,
  resetSimpleStoreMock,
} from "../__mocks__/simpleStoreMock";

describe("DataService Error Handling and Edge Cases", () => {
  let dataService: DataService;
  const mockUserId = "38001085718";

  beforeEach(() => {
    vi.clearAllMocks();
    resetSimpleStoreMock();
    setupSimpleStoreMock();
    dataService = new DataService();
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("SimpleStore error handling", () => {
    it("throws error on fetch failure for user tasks", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(dataService.getUserCreatedTasks()).rejects.toThrow(
        "Network error",
      );
    });

    it("throws error on fetch failure during save", async () => {
      // Save call fails directly (no load-all needed with per-task storage)
      global.fetch = vi.fn().mockRejectedValue(new Error("Save failed"));

      await expect(
        dataService.createTask(mockUserId, { name: "Test", description: "" }),
      ).rejects.toThrow("Save failed");
    });

    it("handles 404 responses gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Not found",
      });
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const tasks = await dataService.getUserTasks();
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

      const entry = await dataService.addEntryToTask(task.id, {
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
        dataService.addEntryToTask("non-existent", {
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
        dataService.addTextEntriesToTask("non-existent", ["Entry"]),
      ).rejects.toThrow("Task not found");
    });

    it("calculates correct order for new entries", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Order Test",
        description: "Test",
        speechSequences: ["Existing 1", "Existing 2"],
      });

      const entries = await dataService.addTextEntriesToTask(
        task.id,
        ["New 1", "New 2"],
      );

      expect(entries[0]?.order).toBe(3);
      expect(entries[1]?.order).toBe(4);
    });
  });

  });

  });

  });

  });

  });

});
