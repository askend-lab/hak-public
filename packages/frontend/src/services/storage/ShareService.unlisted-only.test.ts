import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShareService } from "./ShareService";
import { SimpleStoreAdapter } from "./SimpleStoreAdapter";
import { MockDataLoader } from "./MockDataLoader";
import { Task } from "@/types/task";

describe("ShareService unlisted-only architecture", () => {
  let shareService: ShareService;
  let mockStorage: SimpleStoreAdapter;
  let mockLoader: MockDataLoader;

  let unlistedTasksStorage: Record<string, Task>;
  let sharedTasksSaveCount: number;

  beforeEach(() => {
    unlistedTasksStorage = {};
    sharedTasksSaveCount = 0;

    mockStorage = {
      loadSharedTasks: vi.fn().mockResolvedValue([]),
      saveSharedTasks: vi.fn().mockImplementation(() => {
        sharedTasksSaveCount++;
        return Promise.resolve();
      }),
      saveTaskAsUnlisted: vi.fn().mockImplementation((task: Task) => {
        if (task.shareToken) {
          unlistedTasksStorage[task.shareToken] = task;
        }
        return Promise.resolve();
      }),
      getTaskByShareToken: vi.fn().mockImplementation((token: string) => {
        return Promise.resolve(unlistedTasksStorage[token] || null);
      }),
    } as unknown as SimpleStoreAdapter;

    mockLoader = {
      loadBaselineTasks: vi.fn().mockResolvedValue([]),
      findTaskByShareToken: vi.fn().mockResolvedValue(null),
    } as unknown as MockDataLoader;

    shareService = new ShareService(mockStorage, mockLoader);
  });

  it("RED TEST: shareUserTask should NOT save to shared storage, only unlisted", async () => {
    const task: Task = {
      id: "task-123",
      userId: "user-1",
      name: "Test Task",
      description: "Test",
      entries: [],
      speechSequences: [],
      shareToken: "token-abc",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await shareService.shareUserTask(task);

    // Should save to unlisted storage
    expect(mockStorage.saveTaskAsUnlisted).toHaveBeenCalledWith(task);
    expect(unlistedTasksStorage["token-abc"]).toBeDefined();

    // Should NOT save to shared storage
    expect(sharedTasksSaveCount).toBe(0);
    expect(mockStorage.saveSharedTasks).not.toHaveBeenCalled();
  });

  it("RED TEST: getTaskByShareToken should NOT load from shared storage", async () => {
    // Pre-populate unlisted storage
    unlistedTasksStorage["token-xyz"] = {
      id: "task-456",
      userId: "user-1",
      name: "Unlisted Task",
      description: "",
      entries: [],
      speechSequences: [],
      shareToken: "token-xyz",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const found = await shareService.getTaskByShareToken("token-xyz");

    expect(found).not.toBeNull();
    expect(found?.name).toBe("Unlisted Task");

    // Should NOT call loadSharedTasks - only use unlisted storage
    expect(mockStorage.loadSharedTasks).not.toHaveBeenCalled();
  });

  it("RED TEST: getSharedTask should NOT use shared storage fallback", async () => {
    // This method should be removed or refactored to use unlisted storage only
    // Currently it loads from shared storage which is a fallback we want to remove

    // Pre-populate unlisted storage with a task
    unlistedTasksStorage["token-abc"] = {
      id: "task-789",
      userId: "user-1",
      name: "Task In Unlisted",
      description: "",
      entries: [],
      speechSequences: [],
      shareToken: "token-abc",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // getSharedTask should NOT call loadSharedTasks
    await shareService.getSharedTask("task-789");

    expect(mockStorage.loadSharedTasks).not.toHaveBeenCalled();
  });
});
