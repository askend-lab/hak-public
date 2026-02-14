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
      expect(callBody.ttl).toBe(0);
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

});

// --- Merged from SimpleStoreAdapter.mutations.test.ts ---
vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: { getIdToken: vi.fn(() => "test-token") },
}));

describe("SimpleStoreAdapter mutation kills", () => {
  let adapter: SimpleStoreAdapter;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    adapter = new SimpleStoreAdapter();
  });

  const mkTask = (id: string): Task => ({
    id, userId: "u1", name: "T", description: "", entries: [],
    speechSequences: [], createdAt: new Date(), updatedAt: new Date(), shareToken: "st",
  });

  it("save uses /api/save URL", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    await adapter.saveUserTasks("u1", [mkTask("t1")]);
    const url = mockFetch.mock.calls[0]?.[0] as string;
    expect(url).toBe("/api/save");
  });

  it("save error includes exact message prefix", async () => {
    const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, text: async () => "bad" });
    await expect(adapter.saveUserTasks("u1", [])).rejects.toThrow("Failed to save: bad");
    expect(logSpy).toHaveBeenCalledWith("SimpleStore save failed:", "bad");
    logSpy.mockRestore();
  });

  it("get error includes exact message prefix", async () => {
    const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "err" });
    await expect(adapter.loadUserTasks("u1")).rejects.toThrow("Failed to get: err");
    expect(logSpy).toHaveBeenCalledWith("SimpleStore get failed:", "err");
    logSpy.mockRestore();
  });

  it("getTaskByShareToken uses unlisted type string", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, item: { data: mkTask("t1") } }),
    });
    await adapter.getTaskByShareToken("tok");
    const url = mockFetch.mock.calls[0]?.[0] as string;
    expect(url).toContain("type=unlisted");
  });

  it("getTaskByShareToken error logs exact message", async () => {
    const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error("net"));
    await adapter.getTaskByShareToken("tok");
    expect(logSpy).toHaveBeenCalledWith(
      "Failed to get task by share token:",
      expect.any(Error),
    );
    logSpy.mockRestore();
  });
});
