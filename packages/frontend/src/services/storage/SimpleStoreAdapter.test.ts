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

  describe("queryUserTasks", () => {
    it("returns tasks from SimpleStore query endpoint", async () => {
      const task = createMockTask("task-1", "user-1");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, items: [{ data: task }] }),
      });

      const result = await adapter.queryUserTasks();

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/query?prefix=task&type=private",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        },
      );
      expect(result).toEqual([task]);
    });

    it("returns empty array on 404", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await adapter.queryUserTasks();

      expect(result).toEqual([]);
    });

    it("throws error on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(adapter.queryUserTasks()).rejects.toThrow("Network error");
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
    await adapter.saveTask(mkTask("t1"));
    const url = mockFetch.mock.calls[0]?.[0] as string;
    expect(url).toBe("/api/save");
  });

  it("save error includes exact message prefix", async () => {
    const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "bad" });
    await expect(adapter.saveTask(mkTask("t1"))).rejects.toThrow("Failed to save: bad");
    expect(logSpy).toHaveBeenCalledWith(
      "API error: SimpleStore save failed — 500 /api/save",
      expect.objectContaining({ status: 500, url: "/api/save", body: "bad" }),
    );
    logSpy.mockRestore();
  });

  it("get error includes exact message prefix", async () => {
    const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "err" });
    await expect(adapter.getTask("t1")).rejects.toThrow("Failed to get: err");
    expect(logSpy).toHaveBeenCalledWith(
      "API error: SimpleStore get failed — 500 /api/get",
      expect.objectContaining({ status: 500, url: "/api/get", body: "err" }),
    );
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
