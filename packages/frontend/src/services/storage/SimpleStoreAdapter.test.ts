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
    it("saves tasks to SimpleStore with exact body", async () => {
      const tasks = [createMockTask("task-1", "user-1")];
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveUserTasks("user-1", tasks);

      const call = mockFetch.mock.calls[0] as [string, RequestInit];
      const callBody = JSON.parse(call[1].body as string);
      expect(callBody.pk).toBe("tasks");
      expect(callBody.sk).toBe("user-1");
      expect(callBody.type).toBe("private");
      expect(callBody.ttl).toBe(31536000);
      expect(callBody.data.tasks).toHaveLength(1);
      expect(callBody.data.tasks[0].id).toBe("task-1");
      expect(call[1].method).toBe("POST");
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
    it("saves baseline additions with correct sk", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveBaselineTaskAdditions("user-1", {});

      const call = mockFetch.mock.calls[0] as [string, RequestInit];
      const callBody = JSON.parse(call[1].body as string);
      expect(callBody.pk).toBe("tasks");
      expect(callBody.sk).toBe("baseline-user-1");
      expect(callBody.type).toBe("private");
      expect(callBody.data).toStrictEqual({ additions: {} });
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
});
