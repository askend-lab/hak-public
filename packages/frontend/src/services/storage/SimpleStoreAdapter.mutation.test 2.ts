// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimpleStoreAdapter } from "./SimpleStoreAdapter";
import { Task } from "@/types/task";

vi.mock("../auth/storage", () => ({
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
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, text: async () => "bad" });
    await expect(adapter.saveUserTasks("u1", [])).rejects.toThrow("Failed to save: bad");
    expect(consoleSpy).toHaveBeenCalledWith("SimpleStore save failed:", "bad");
    consoleSpy.mockRestore();
  });

  it("get error includes exact message prefix", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "err" });
    await expect(adapter.loadUserTasks("u1")).rejects.toThrow("Failed to get: err");
    expect(consoleSpy).toHaveBeenCalledWith("SimpleStore get failed:", "err");
    consoleSpy.mockRestore();
  });

  it("saveSharedTasks passes tasks data not empty object", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const task = mkTask("s1");
    await adapter.saveSharedTasks([task]);
    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.data.tasks).toHaveLength(1);
    expect(body.data.tasks[0].id).toBe("s1");
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
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error("net"));
    await adapter.getTaskByShareToken("tok");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to get task by share token:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
