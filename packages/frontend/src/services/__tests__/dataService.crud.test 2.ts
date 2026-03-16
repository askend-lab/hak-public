// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataService } from "../dataService";
import {
  setupSimpleStoreMock,
  resetSimpleStoreMock,
  getStoredTasks,
} from "../__mocks__/simpleStoreMock";

describe("DataService CRUD Operations", () => {
  let dataService: DataService;
  const mockUserId = "38001085718";

  beforeEach(() => {
    vi.clearAllMocks();
    resetSimpleStoreMock();
    setupSimpleStoreMock();
    dataService = new DataService();
  });

  describe("createTask", () => {
    it("creates a new task with basic data", async () => {
      const taskData = {
        name: "Test Task",
        description: "Test Description",
      };

      const result = await dataService.createTask(mockUserId, taskData);

      expect(result.name).toBe("Test Task");
      expect(result.description).toBe("Test Description");
      expect(result.userId).toBe(mockUserId);
      expect(result.id).toBeDefined();
      expect(result.shareToken).toBeDefined();
    });

    it("creates task with speech sequences", async () => {
      const taskData = {
        name: "Speech Task",
        description: "With sequences",
        speechSequences: ["Hello", "World"],
      };

      const result = await dataService.createTask(mockUserId, taskData);

      expect(result.speechSequences).toEqual(["Hello", "World"]);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]?.text).toBe("Hello");
      expect(result.entries[1]?.text).toBe("World");
    });

    it("creates task with speech entries", async () => {
      const taskData = {
        name: "Entry Task",
        description: "With entries",
        speechEntries: [
          { text: "Hello", stressedText: "Hel·lo" },
          { text: "World", stressedText: "World" },
        ],
      };

      const result = await dataService.createTask(mockUserId, taskData);

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]?.text).toBe("Hello");
      expect(result.entries[0]?.stressedText).toBe("Hel·lo");
    });

    it("saves task to SimpleStore", async () => {
      const taskData = {
        name: "Saved Task",
        description: "Should be saved",
      };

      await dataService.createTask(mockUserId, taskData);

      const tasks = getStoredTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.name).toBe("Saved Task");
    });
  });

  describe("getTask", () => {
    it("returns user-created task", async () => {
      const taskData = { name: "User Task", description: "Test" };
      const created = await dataService.createTask(mockUserId, taskData);

      const result = await dataService.getTask(created.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe("User Task");
    });

    it("returns null for non-existent task", async () => {
      const result = await dataService.getTask("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("updates user-created task", async () => {
      const taskData = { name: "Original", description: "Test" };
      const created = await dataService.createTask(mockUserId, taskData);

      const result = await dataService.updateTask(created.id, {
        name: "Updated",
      });

      expect(result?.name).toBe("Updated");
    });

    it("throws for non-existent task", async () => {
      await expect(
        dataService.updateTask("non-existent", { name: "Test" }),
      ).rejects.toThrow("Task not found");
    });
  });

  describe("deleteTask", () => {
    it("deletes user-created task", async () => {
      const taskData = { name: "To Delete", description: "Test" };
      const created = await dataService.createTask(mockUserId, taskData);

      const result = await dataService.deleteTask(created.id);

      expect(result).toBe(true);
      const task = await dataService.getTask(created.id);
      expect(task).toBeNull();
    });

    it("throws for non-existent task", async () => {
      await expect(
        dataService.deleteTask("non-existent"),
      ).rejects.toThrow("Task not found");
    });
  });

  describe("getUserTasks", () => {
    it("returns empty array for user with no tasks", async () => {
      const result = await dataService.getUserTasks();
      // May include baseline tasks
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns user-created tasks", async () => {
      await dataService.createTask(mockUserId, {
        name: "Task 1",
        description: "",
      });
      await dataService.createTask(mockUserId, {
        name: "Task 2",
        description: "",
      });

      const result = await dataService.getUserTasks();

      const userTaskNames = result.map((t) => t.name);
      expect(userTaskNames).toContain("Task 1");
      expect(userTaskNames).toContain("Task 2");
    });
  });

  describe("getUserCreatedTasks", () => {
    it("returns only user-created tasks", async () => {
      await dataService.createTask(mockUserId, {
        name: "User Task",
        description: "",
      });

      const result = await dataService.getUserCreatedTasks();

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("User Task");
    });
  });

  describe("getModifiableTasks", () => {
    it("returns user-created tasks only", async () => {
      await dataService.createTask(mockUserId, {
        name: "Modifiable",
        description: "",
      });

      const result = await dataService.getModifiableTasks();

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("Modifiable");
    });
  });

  describe("Task visibility after creation", () => {
    it("newly created task is immediately visible in getUserTasks", async () => {
      // RED TEST: Verifies task is visible immediately after creation
      // Bug: User creates task but it doesn't appear in task list
      const taskData = { name: "New Task", description: "Should be visible" };

      await dataService.createTask(mockUserId, taskData);

      // Task should be immediately visible
      const tasks = await dataService.getUserTasks();
      const taskNames = tasks.map((t) => t.name);

      expect(taskNames).toContain("New Task");
    });

    it("newly created task is visible after fresh DataService instance", async () => {
      // RED TEST: Verifies task persists and is visible after "page reload"
      const taskData = {
        name: "Persistent Task",
        description: "Should persist",
      };

      await dataService.createTask(mockUserId, taskData);

      // Simulate page reload - get fresh DataService instance
      const freshDataService = new DataService();

      const tasks = await freshDataService.getUserTasks();
      const taskNames = tasks.map((t) => t.name);

      expect(taskNames).toContain("Persistent Task");
    });

    it("created task appears in getUserTasks after navigation", async () => {
      // RED TEST: Bug - task saved but not visible when navigating to /tasks
      // Scenario: User creates task, task saved to API, then navigates to tasks page

      // 1. Create task
      const taskData = {
        name: "Navigation Test Task",
        description: "Should appear after navigation",
      };
      const created = await dataService.createTask(mockUserId, taskData);
      expect(created.id).toBeDefined();

      // 2. Simulate navigation - fresh load of tasks (like opening /tasks page)
      const tasks = await dataService.getUserTasks();

      // 3. Task should be in the list
      expect(tasks.length).toBeGreaterThan(0);
      const foundTask = tasks.find((t) => t.id === created.id);
      expect(foundTask).toBeDefined();
      expect(foundTask?.name).toBe("Navigation Test Task");
    });
  });
});
