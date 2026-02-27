// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataService } from "../dataService";
import { setupSimpleStoreMock, resetSimpleStoreMock } from "../__mocks__/simpleStoreMock";

describe("DataService CRUD Operations", () => {
  let dataService: DataService;
  const mockUserId = "38001085718";

  beforeEach(() => {
    vi.clearAllMocks();
    resetSimpleStoreMock();
    setupSimpleStoreMock();
    dataService = new DataService();
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
