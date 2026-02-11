// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShareService } from "./ShareService";

vi.mock("@hak/shared", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

const mockBaselineTasks: any[] = [];
vi.mock("./MockDataLoader", () => {
  return {
    MockDataLoader: class {
      loadBaselineTasks(): Promise<any[]> { return Promise.resolve([...mockBaselineTasks]); }
      findTaskByShareToken(): Promise<null> { return Promise.resolve(null); }
    },
  };
});

const mockStorage = {
  saveTaskAsUnlisted: vi.fn().mockResolvedValue(undefined),
  getTaskByShareToken: vi.fn().mockResolvedValue(null),
};

const mockTask = {
  id: "task-1",
  name: "Test Task",
  description: "",
  userId: "user-1",
  entries: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  shareToken: "abc123",
};

const mockLoader = {
  loadBaselineTasks: vi.fn().mockResolvedValue([]),
  findTaskByShareToken: vi.fn().mockResolvedValue(null),
};

describe("ShareService", () => {
  let service: ShareService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ShareService(mockStorage as any, mockLoader as any);
  });

  describe("generateShareToken", () => {
    it("returns a 16-character hex string", () => {
      const token = service.generateShareToken();
      expect(token).toHaveLength(16);
      expect(/^[0-9a-f]{16}$/.test(token)).toBe(true);
    });

    it("returns different tokens each call", () => {
      const t1 = service.generateShareToken();
      const t2 = service.generateShareToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe("getSharedTask", () => {
    it("returns baseline task when found", async () => {
      mockBaselineTasks.push(mockTask);
      const result = await service.getSharedTask("task-1");
      expect(result).toEqual(mockTask);
      mockBaselineTasks.length = 0;
    });

    it("returns null when no baseline task found", async () => {
      const result = await service.getSharedTask("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("shareUserTask", () => {
    it("calls saveTaskAsUnlisted", async () => {
      await service.shareUserTask(mockTask as any);
      expect(mockStorage.saveTaskAsUnlisted).toHaveBeenCalledWith(mockTask);
    });

    it("throws on storage error", async () => {
      mockStorage.saveTaskAsUnlisted.mockRejectedValueOnce(new Error("storage fail"));
      await expect(service.shareUserTask(mockTask as any)).rejects.toThrow("Failed to share task");
    });
  });

  describe("getTaskByShareToken", () => {
    it("returns baseline task when found by share token", async () => {
      mockLoader.findTaskByShareToken.mockResolvedValueOnce(mockTask);
      const result = await service.getTaskByShareToken("abc123");
      expect(result).toEqual(mockTask);
    });

    it("returns unlisted task when baseline not found", async () => {
      mockStorage.getTaskByShareToken.mockResolvedValueOnce(mockTask);
      const result = await service.getTaskByShareToken("abc123");
      expect(result).toEqual(mockTask);
    });

    it("returns null when no task found", async () => {
      const result = await service.getTaskByShareToken("nonexistent");
      expect(result).toBeNull();
    });
  });
});
