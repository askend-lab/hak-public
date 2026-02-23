// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimpleStoreAdapter } from "./SimpleStoreAdapter";
import { Task } from "@/types/task";
import { logger } from "@hak/shared";

vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: {
    getIdToken: vi.fn(() => "test-token"),
  },
}));

describe("SimpleStoreAdapter per-task storage", () => {
  let adapter: SimpleStoreAdapter;
  const mockFetch = vi.fn();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer test-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    adapter = new SimpleStoreAdapter();
  });

  const createTask = (id: string): Task => ({
    id,
    userId: "user-1",
    name: "Test Task",
    description: "desc",
    entries: [],
    speechSequences: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    shareToken: "share-tok",
  });

  describe("saveTask", () => {
    it("saves single task with pk=task and sk=taskId", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const task = createTask("task_abc");

      await adapter.saveTask(task);

      const call = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(call[0]).toBe("/api/save");
      expect(call[1].method).toBe("POST");
      const body = JSON.parse(call[1].body as string);
      expect(body.key).toBe("task");
      expect(body.sortKey).toBe("task_abc");
      expect(body.type).toBe("private");
      expect(body.data.id).toBe("task_abc");
      expect(body.data.name).toBe("Test Task");
    });

    it("throws on save failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Save failed",
      });

      await expect(adapter.saveTask(createTask("t1"))).rejects.toThrow(
        "Failed to save",
      );
    });
  });

  describe("getTask", () => {
    it("gets single task by id with pk=task", async () => {
      const task = createTask("task_abc");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: task } }),
      });

      const result = await adapter.getTask("task_abc");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/get?key=task&sortKey=task_abc&type=private",
        { headers: authHeaders },
      );
      expect(result).toEqual(task);
    });

    it("returns null when task not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: null }),
      });

      const result = await adapter.getTask("nonexistent");

      expect(result).toBeNull();
    });

    it("returns null on 404", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await adapter.getTask("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("deleteTask", () => {
    it("deletes task by id with pk=task", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.deleteTask("task_abc");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/delete?key=task&sortKey=task_abc&type=private",
        { method: "DELETE", headers: authHeaders },
      );
    });

    it("throws on delete failure", async () => {
      const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Not found",
      });

      await expect(adapter.deleteTask("t1")).rejects.toThrow(
        "Failed to delete",
      );
      logSpy.mockRestore();
    });
  });

  describe("queryUserTasks", () => {
    it("queries tasks with prefix=task and type=private", async () => {
      const task1 = createTask("task_1");
      const task2 = createTask("task_2");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          items: [{ data: task1 }, { data: task2 }],
        }),
      });

      const result = await adapter.queryUserTasks();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/query?prefix=task&type=private",
        { headers: authHeaders },
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(task1);
      expect(result[1]).toEqual(task2);
    });

    it("returns empty array when no tasks exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, items: [] }),
      });

      const result = await adapter.queryUserTasks();

      expect(result).toEqual([]);
    });

    it("throws on query failure", async () => {
      const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Query error",
      });

      await expect(adapter.queryUserTasks()).rejects.toThrow("Failed to query");
      logSpy.mockRestore();
    });
  });
});
