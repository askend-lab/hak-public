// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";

import { DataService } from "../dataService";

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

vi.mock("../storage/SimpleStoreAdapter", () => ({ SimpleStoreAdapter: class {} }));
vi.mock("@/features/sharing/services/ShareService", () => ({
  ShareService: class {
    shareUserTask = mockShareSvc.shareUserTask;
    getTaskByShareToken = mockShareSvc.getTaskByShareToken;
  },
}));
vi.mock("../repository/TaskRepository", () => ({
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

describe("DataService", () => {
  let service: DataService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DataService();
  });

  it("getUserTasks delegates to repository", async () => {
    mockRepo.getUserTasks.mockResolvedValueOnce([{ id: "t1" }]);
    const r = await service.getUserTasks();
    expect(mockRepo.getUserTasks).toHaveBeenCalled();
    expect(r).toEqual([{ id: "t1" }]);
  });

  it("getUserCreatedTasks delegates", async () => {
    await service.getUserCreatedTasks();
    expect(mockRepo.getUserCreatedTasks).toHaveBeenCalled();
  });

  it("getModifiableTasks delegates", async () => {
    await service.getModifiableTasks();
    expect(mockRepo.getModifiableTasks).toHaveBeenCalled();
  });

  it("getTask delegates", async () => {
    await service.getTask("t1");
    expect(mockRepo.getTask).toHaveBeenCalledWith("t1");
  });

  it("shareUserTask gets task then shares", async () => {
    const task = { id: "t1" };
    mockRepo.getTask.mockResolvedValueOnce(task);
    await service.shareUserTask("t1");
    expect(mockShareSvc.shareUserTask).toHaveBeenCalledWith(task);
  });

  it("shareUserTask throws when not found", async () => {
    mockRepo.getTask.mockResolvedValueOnce(null);
    await expect(service.shareUserTask("t1")).rejects.toThrow("Task not found");
  });

  it("createTask delegates", async () => {
    await service.createTask("u1", { name: "T" } as Parameters<typeof service.createTask>[1]);
    expect(mockRepo.createTask).toHaveBeenCalledWith("u1", { name: "T" });
  });

  it("updateTask delegates", async () => {
    await service.updateTask("t1", { name: "U" });
    expect(mockRepo.updateTask).toHaveBeenCalledWith("t1", { name: "U" });
  });

  it("deleteTask delegates", async () => {
    await service.deleteTask("t1");
    expect(mockRepo.deleteTask).toHaveBeenCalledWith("t1");
  });

  it("addEntryToTask delegates to addTextEntriesToTask", async () => {
    const mockEntry = { id: "entry_1", taskId: "t1", text: "hi", stressedText: "hi", audioUrl: null, audioBlob: null, order: 1, createdAt: new Date() };
    mockRepo.addTextEntriesToTask.mockResolvedValueOnce([mockEntry]);
    const e = await service.addEntryToTask("t1", {
      text: "hi", stressedText: "hi", audioUrl: null, audioBlob: null, order: 0,
    });
    expect(mockRepo.addTextEntriesToTask).toHaveBeenCalledWith("t1", [{ text: "hi", stressedText: "hi" }]);
    expect(e.text).toBe("hi");
  });

  it("addEntryToTask throws when task not found", async () => {
    mockRepo.addTextEntriesToTask.mockRejectedValueOnce(new Error("Task not found"));
    await expect(service.addEntryToTask("t1", {
      text: "x", stressedText: "x", audioUrl: null, audioBlob: null, order: 0,
    })).rejects.toThrow("Task not found");
  });

  it("addTextEntriesToTask delegates", async () => {
    await service.addTextEntriesToTask("t1", ["hi"]);
    expect(mockRepo.addTextEntriesToTask).toHaveBeenCalledWith("t1", ["hi"], "append");
  });

  it("getTaskByShareToken delegates", async () => {
    await service.getTaskByShareToken("tok");
    expect(mockShareSvc.getTaskByShareToken).toHaveBeenCalledWith("tok");
  });

  it("updateTaskEntry delegates", async () => {
    await service.updateTaskEntry("t1", "e1", { text: "u" });
    expect(mockRepo.updateTaskEntry).toHaveBeenCalledWith("t1", "e1", { text: "u" });
  });
});
