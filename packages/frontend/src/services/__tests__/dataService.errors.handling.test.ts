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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("updateTaskEntry", () => {
    it("updates entry in user-created task", async () => {
      const task = await dataService.createTask(mockUserId, {
        name: "Entry Update Task",
        description: "Test",
        speechSequences: ["Original text"],
      });

      const entryId = task.entries[0]?.id ?? "";

      const updated = await dataService.updateTaskEntry(
        task.id,
        entryId,
        { text: "Updated text", stressedText: "Updated text" },
      );

      expect(updated?.text).toBe("Updated text");
    });

    it("throws when task not found", async () => {
      await expect(
        dataService.updateTaskEntry("non-existent", "entry-id", {
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
        dataService.updateTaskEntry(task.id, "non-existent-entry", {
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
      await dataService.shareUserTask(task.id);

      const result = await dataService.getTaskByShareToken(task.shareToken);
      expect(result?.name).toBe("Shared Task");
    });
  });

  });

  });

  });

  });

  });

});
