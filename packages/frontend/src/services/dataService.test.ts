// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@hak/shared", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

const mockRepo = {
  getUserTasks: vi.fn().mockResolvedValue([]),
  getUserCreatedTasks: vi.fn().mockResolvedValue([]),
  getModifiableTasks: vi.fn().mockResolvedValue([]),
  getTask: vi.fn().mockResolvedValue(null),
  createTask: vi.fn().mockResolvedValue({ id: "t1" }),
  updateTask: vi.fn().mockResolvedValue(null),
  deleteTask: vi.fn().mockResolvedValue(false),
  addTextEntriesToTask: vi.fn().mockResolvedValue([]),
  updateTaskEntry: vi.fn().mockResolvedValue(null),
};

const mockShareSvc = {
  shareUserTask: vi.fn().mockResolvedValue(undefined),
  getTaskByShareToken: vi.fn().mockResolvedValue(null),
};

vi.mock("./storage/SimpleStoreAdapter", () => ({ SimpleStoreAdapter: class {} }));
vi.mock("@/features/sharing/services/ShareService", () => ({
  ShareService: class {
    shareUserTask = mockShareSvc.shareUserTask;
    getTaskByShareToken = mockShareSvc.getTaskByShareToken;
  },
}));
vi.mock("./repository/TaskRepository", () => ({
  TaskRepository: class {
    getUserTasks = mockRepo.getUserTasks;
    getUserCreatedTasks = mockRepo.getUserCreatedTasks;
    getModifiableTasks = mockRepo.getModifiableTasks;
    getTask = mockRepo.getTask;
    createTask = mockRepo.createTask;
    updateTask = mockRepo.updateTask;
    deleteTask = mockRepo.deleteTask;
    addTextEntriesToTask = mockRepo.addTextEntriesToTask;
    updateTaskEntry = mockRepo.updateTaskEntry;
  },
}));

import { DataService } from "./dataService";

describe("DataService", () => {
  let service: DataService;

  beforeEach(() => {
    vi.clearAllMocks();
    (DataService as unknown as { instance: undefined }).instance = undefined;
    service = DataService.getInstance();
  });

  it("returns singleton instance", () => {
    expect(DataService.getInstance()).toBe(service);
  });

  it("getUserTasks delegates to repository", async () => {
    mockRepo.getUserTasks.mockResolvedValueOnce([{ id: "t1" }]);
    const r = await service.getUserTasks("u1");
    expect(mockRepo.getUserTasks).toHaveBeenCalledWith("u1");
    expect(r).toEqual([{ id: "t1" }]);
  });

  it("getUserCreatedTasks delegates", async () => {
    await service.getUserCreatedTasks("u1");
    expect(mockRepo.getUserCreatedTasks).toHaveBeenCalledWith("u1");
  });

  it("getModifiableTasks delegates", async () => {
    await service.getModifiableTasks("u1");
    expect(mockRepo.getModifiableTasks).toHaveBeenCalledWith("u1");
  });

  it("getTask delegates", async () => {
    await service.getTask("t1", "u1");
    expect(mockRepo.getTask).toHaveBeenCalledWith("t1", "u1");
  });

  it("shareUserTask gets task then shares", async () => {
    const task = { id: "t1" };
    mockRepo.getTask.mockResolvedValueOnce(task);
    await service.shareUserTask("u1", "t1");
    expect(mockShareSvc.shareUserTask).toHaveBeenCalledWith(task);
  });

  it("shareUserTask throws when not found", async () => {
    mockRepo.getTask.mockResolvedValueOnce(null);
    await expect(service.shareUserTask("u1", "t1")).rejects.toThrow("Task not found");
  });

  it("createTask delegates", async () => {
    await service.createTask("u1", { name: "T" } as Parameters<typeof service.createTask>[1]);
    expect(mockRepo.createTask).toHaveBeenCalledWith("u1", { name: "T" });
  });

  it("updateTask delegates", async () => {
    await service.updateTask("u1", "t1", { name: "U" });
    expect(mockRepo.updateTask).toHaveBeenCalledWith("u1", "t1", { name: "U" });
  });

  it("deleteTask delegates", async () => {
    await service.deleteTask("u1", "t1");
    expect(mockRepo.deleteTask).toHaveBeenCalledWith("u1", "t1");
  });

  it("addEntryToTask delegates to addTextEntriesToTask", async () => {
    const mockEntry = { id: "entry_1", taskId: "t1", text: "hi", stressedText: "hi", audioUrl: null, audioBlob: null, order: 1, createdAt: new Date() };
    mockRepo.addTextEntriesToTask.mockResolvedValueOnce([mockEntry]);
    const e = await service.addEntryToTask("u1", "t1", {
      text: "hi", stressedText: "hi", audioUrl: null, audioBlob: null, order: 0,
    });
    expect(mockRepo.addTextEntriesToTask).toHaveBeenCalledWith("u1", "t1", [{ text: "hi", stressedText: "hi" }]);
    expect(e.text).toBe("hi");
  });

  it("addEntryToTask throws when task not found", async () => {
    mockRepo.addTextEntriesToTask.mockRejectedValueOnce(new Error("Task not found"));
    await expect(service.addEntryToTask("u1", "t1", {
      text: "x", stressedText: "x", audioUrl: null, audioBlob: null, order: 0,
    })).rejects.toThrow("Task not found");
  });

  it("addTextEntriesToTask delegates", async () => {
    await service.addTextEntriesToTask("u1", "t1", ["hi"]);
    expect(mockRepo.addTextEntriesToTask).toHaveBeenCalledWith("u1", "t1", ["hi"], "append");
  });

  it("getTaskByShareToken delegates", async () => {
    await service.getTaskByShareToken("tok");
    expect(mockShareSvc.getTaskByShareToken).toHaveBeenCalledWith("tok");
  });

  it("updateTaskEntry delegates", async () => {
    await service.updateTaskEntry("u1", "t1", "e1", { text: "u" });
    expect(mockRepo.updateTaskEntry).toHaveBeenCalledWith("u1", "t1", "e1", { text: "u" });
  });
});
