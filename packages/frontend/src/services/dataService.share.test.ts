import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataService } from "./dataService";
import {
  setupSimpleStoreMock,
  resetSimpleStoreMock,
} from "./__mocks__/simpleStoreMock";

describe("DataService Share Operations", () => {
  let ds: DataService;
  const userId = "38001085718";

  beforeEach(() => {
    vi.clearAllMocks();
    resetSimpleStoreMock();
    setupSimpleStoreMock();
    (DataService as unknown as { instance: null }).instance = null;
    ds = DataService.getInstance();
  });

  it("shareUserTask shares a task", async () => {
    const task = await ds.createTask(userId, {
      name: "Share Test",
      description: "",
    });
    await ds.shareUserTask(userId, task.id);
    // Verify task is now shared by checking it can be found by shareToken
    const shared = await ds.getTaskByShareToken(task.shareToken);
    expect(shared?.name).toBe("Share Test");
  });

  it("shareUserTask throws for non-existent task", async () => {
    await expect(ds.shareUserTask(userId, "non-existent")).rejects.toThrow(
      "Task not found",
    );
  });

  it("getTaskByShareToken finds shared task", async () => {
    const task = await ds.createTask(userId, {
      name: "Token Test",
      description: "",
    });
    await ds.shareUserTask(userId, task.id);
    const found = await ds.getTaskByShareToken(task.shareToken);
    expect(found?.name).toBe("Token Test");
  });

  it("getTaskByShareToken returns null for invalid token", async () => {
    const found = await ds.getTaskByShareToken("invalid-token");
    expect(found).toBeNull();
  });

  it("getSharedTask returns null for non-shared task", async () => {
    const task = await ds.createTask(userId, {
      name: "Not Shared",
      description: "",
    });
    const found = await ds.getSharedTask(task.id);
    expect(found).toBeNull();
  });

  it("getTaskByShareToken finds task after sharing", async () => {
    const task = await ds.createTask(userId, {
      name: "Shared Task",
      description: "",
    });
    await ds.shareUserTask(userId, task.id);
    const found = await ds.getTaskByShareToken(task.shareToken);
    expect(found?.name).toBe("Shared Task");
  });

  it("handles empty shared tasks", async () => {
    const found = await ds.getTaskByShareToken("any-token");
    expect(found).toBeNull();
  });

  it("task is accessible by shareToken immediately after creation (without explicit share)", async () => {
    // RED TEST: This is the core unlisted architecture requirement
    // Tasks should be accessible via shareToken right after creation
    // without needing to call shareUserTask first
    const task = await ds.createTask(userId, {
      name: "Instant Access Task",
      description: "",
    });

    // Task should have a shareToken
    expect(task.shareToken).toBeDefined();
    expect(task.shareToken.length).toBeGreaterThan(0);

    // Task should be findable by shareToken immediately (no shareUserTask call!)
    const found = await ds.getTaskByShareToken(task.shareToken);
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Instant Access Task");
    expect(found?.id).toBe(task.id);
  });
});
