// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimpleStoreAdapter } from "./SimpleStoreAdapter";
import { Task, TaskEntry } from "@/types/task";

vi.mock("../auth/storage", () => ({
  AuthStorage: {
    getIdToken: vi.fn(() => "test-token"),
  },
}));

describe("SimpleStoreAdapter", () => {
  let adapter: SimpleStoreAdapter;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    adapter = new SimpleStoreAdapter();
  });

  const createMockTask = (id: string, userId: string): Task => ({
    id,
    userId,
    name: "Test Task",
    description: "Test description",
    entries: [],
    speechSequences: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    shareToken: "test-token",
  });

  const createMockEntry = (id: string, taskId: string): TaskEntry => ({
    id,
    taskId,
    text: "Test entry",
    stressedText: "Test entry",
    audioUrl: null,
    audioBlob: null,
    order: 1,
    createdAt: new Date(),
  });

  describe("loadUserTasks", () => {
    it("returns tasks from SimpleStore", async () => {
      const tasks = [createMockTask("task-1", "user-1")];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: { tasks } } }),
      });

      const result = await adapter.loadUserTasks("user-1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/get?pk=tasks&sk=user-1&type=private",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        },
      );
      expect(result).toEqual(tasks);
    });

    it("returns empty array when no tasks exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await adapter.loadUserTasks("user-1");

      expect(result).toEqual([]);
    });

    it("throws error on network failure instead of silently returning empty array", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(adapter.loadUserTasks("user-1")).rejects.toThrow(
        "Network error",
      );
    });

    it("throws error when API returns HTML instead of JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON");
        },
      });

      await expect(adapter.loadUserTasks("user-1")).rejects.toThrow();
    });
  });

  describe("saveUserTasks", () => {
    it("saves tasks to SimpleStore", async () => {
      const tasks = [createMockTask("task-1", "user-1")];
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveUserTasks("user-1", tasks);

      expect(mockFetch).toHaveBeenCalledWith("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: expect.stringContaining('"pk":"tasks"'),
      });
    });

    it("throws error on save failure instead of silently swallowing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Save failed",
      });

      await expect(adapter.saveUserTasks("user-1", [])).rejects.toThrow();
    });
  });

  describe("loadBaselineTaskAdditions", () => {
    it("returns baseline additions", async () => {
      const additions = { "task-1": [createMockEntry("entry-1", "task-1")] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: { additions } } }),
      });

      const result = await adapter.loadBaselineTaskAdditions("user-1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/get?pk=tasks&sk=baseline-user-1&type=private",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        },
      );
      expect(result).toEqual(additions);
    });

    it("returns empty object when no additions", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await adapter.loadBaselineTaskAdditions("user-1");

      expect(result).toEqual({});
    });

    it("throws error on network failure instead of silently returning empty object", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(adapter.loadBaselineTaskAdditions("user-1")).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("saveBaselineTaskAdditions", () => {
    it("saves baseline additions", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveBaselineTaskAdditions("user-1", {});

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/save",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("throws error on save failure instead of silently swallowing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Save failed",
      });

      await expect(
        adapter.saveBaselineTaskAdditions("user-1", {}),
      ).rejects.toThrow();
    });
  });

  describe("loadSharedTasks", () => {
    it("returns shared tasks", async () => {
      const tasks = [createMockTask("shared-1", "user-1")];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: { tasks } } }),
      });

      const result = await adapter.loadSharedTasks();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/get-public?pk=shared&sk=tasks&type=shared",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        },
      );
      expect(result).toEqual(tasks);
    });

    it("throws error on network failure instead of silently returning empty array", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(adapter.loadSharedTasks()).rejects.toThrow("Network error");
    });

    it("throws error when API returns HTML instead of JSON (CloudFront misconfiguration)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON");
        },
      });

      await expect(adapter.loadSharedTasks()).rejects.toThrow();
    });
  });

  describe("saveSharedTasks", () => {
    it("saves shared tasks", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveSharedTasks([createMockTask("shared-1", "user-1")]);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/save",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("throws on save error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: async () => "Error" });

      await expect(adapter.saveSharedTasks([])).rejects.toThrow();
    });
  });

  describe("findAllUserTaskKeys", () => {
    it("returns empty array", async () => {
      const result = await adapter.findAllUserTaskKeys();
      expect(result).toEqual([]);
    });
  });

  describe("loadTasksByKey", () => {
    it("returns empty array", async () => {
      const result = await adapter.loadTasksByKey("some-key");
      expect(result).toEqual([]);
    });
  });

  describe("get error handling", () => {
    it("throws on non-404 error response", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal server error",
      });

      await expect(adapter.loadUserTasks("user-1")).rejects.toThrow(
        "Failed to get",
      );
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getTaskByShareToken", () => {
    it("returns task when found", async () => {
      const task = createMockTask("task-1", "user-1");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: task } }),
      });

      const result = await adapter.getTaskByShareToken("test-token");
      expect(result).toBeTruthy();
    });

    it("returns null when not found", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await adapter.getTaskByShareToken("missing-token");
      expect(result).toBeNull();
    });

    it("returns null on error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await adapter.getTaskByShareToken("bad-token");
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("saveTaskAsUnlisted", () => {
    it("saves task with shareToken", async () => {
      const task = createMockTask("task-1", "user-1");
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveTaskAsUnlisted(task);
      expect(mockFetch).toHaveBeenCalled();
    });

    it("throws when task has no shareToken", async () => {
      const task = {
        ...createMockTask("task-1", "user-1"),
        shareToken: "",
      };

      await expect(adapter.saveTaskAsUnlisted(task)).rejects.toThrow(
        "Task must have shareToken",
      );
    });
  });
});
