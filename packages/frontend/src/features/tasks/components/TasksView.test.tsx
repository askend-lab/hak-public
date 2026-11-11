// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TasksView from "./TasksView";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

const mockGetTask = vi.fn();
const mockGetTasks = vi.fn();
const mockDS = createMockDataService({ getTask: mockGetTask, getTasks: mockGetTasks } as never);
const dsWrapper = ({ children }: { children: React.ReactNode }) => <DataServiceTestWrapper dataService={mockDS}>{children}</DataServiceTestWrapper>;

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-1", name: "Test User" },
    isAuthenticated: true,
  })),
}));

vi.mock("@/hooks", () => ({
  useUserTasks: vi.fn(() => ({
    tasks: [
      { id: "task-1", name: "Test Task", description: "Test Description" },
    ],
    isLoading: false,
    error: null,
    isEmpty: false,
    refresh: vi.fn(),
  })),
}));

vi.mock("./TaskManager", () => ({
  default: ({
    onEditTask,
    onShareTask,
  }: {
    onEditTask: (taskId: string) => void;
    onShareTask: (taskId: string) => void;
  }) => (
    <div data-testid="task-manager">
      <button onClick={() => onEditTask("task-1")}>Edit Task 1</button>
      <button onClick={() => onShareTask("task-1")}>Share Task 1</button>
    </div>
  ),
}));

vi.mock("./TaskDetailView", () => ({
  default: ({
    taskId,
    onEditTask,
  }: {
    taskId: string;
    onEditTask: (id: string) => void;
  }) => (
    <div data-testid="task-detail-view">
      <div>Task ID: {taskId}</div>
      <button onClick={() => onEditTask(taskId)}>Muuda</button>
    </div>
  ),
}));

describe("TasksView - Edit Task Bug", () => {
  const mockOnBack = vi.fn();
  const mockOnViewTask = vi.fn();
  const mockOnCreateTask = vi.fn();
  const mockOnEditTask = vi.fn();
  const mockOnDeleteTask = vi.fn();
  const mockOnShareTask = vi.fn();
  const mockOnNavigateToSynthesis = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTask.mockResolvedValue({
      id: "task-1",
      name: "Test Task",
      description: "Test Description",
      entries: [],
    });
  });

  it("should pass full task data when editing from task list", async () => {
    const user = userEvent.setup();

    render(
      <TasksView
        selectedTaskId={null}
        taskRefreshTrigger={0}
        onBack={mockOnBack}
        onViewTask={mockOnViewTask}
        onCreateTask={mockOnCreateTask}
        onEditTask={mockOnEditTask}
        onDeleteTask={mockOnDeleteTask}
        onShareTask={mockOnShareTask}
        onNavigateToSynthesis={mockOnNavigateToSynthesis}
      />,
      { wrapper: dsWrapper },
    );

    const editButton = screen.getByText("Edit Task 1");
    await user.click(editButton);

    await waitFor(() => {
      expect(mockOnEditTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "task-1",
          name: expect.any(String),
          description: expect.any(String),
        }),
      );
    });

    const call = mockOnEditTask.mock.calls[0]?.[0];
    expect(call?.name).not.toBe("");
    expect(call?.description).toBeDefined();
  });

  it("should pass full task data when editing from detail view", async () => {
    const user = userEvent.setup();

    render(
      <TasksView
        selectedTaskId="task-1"
        taskRefreshTrigger={0}
        onBack={mockOnBack}
        onViewTask={mockOnViewTask}
        onCreateTask={mockOnCreateTask}
        onEditTask={mockOnEditTask}
        onDeleteTask={mockOnDeleteTask}
        onShareTask={mockOnShareTask}
        onNavigateToSynthesis={mockOnNavigateToSynthesis}
      />,
      { wrapper: dsWrapper },
    );

    const editButton = screen.getByText("Muuda");
    await user.click(editButton);

    await waitFor(() => {
      expect(mockOnEditTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "task-1",
          name: expect.any(String),
          description: expect.any(String),
        }),
      );
    });

    const call = mockOnEditTask.mock.calls[0]?.[0];
    expect(call?.name).not.toBe("");
  });

  it("should pass task data with shareToken when sharing from task list", async () => {
    mockGetTask.mockResolvedValueOnce({
      id: "task-1",
      name: "Test Task",
      description: "Test Description",
      shareToken: "share-tok-123",
      entries: [],
    });

    const user = userEvent.setup();
    render(
      <TasksView
        selectedTaskId={null}
        taskRefreshTrigger={0}
        onBack={mockOnBack}
        onViewTask={mockOnViewTask}
        onCreateTask={mockOnCreateTask}
        onEditTask={mockOnEditTask}
        onDeleteTask={mockOnDeleteTask}
        onShareTask={mockOnShareTask}
        onNavigateToSynthesis={mockOnNavigateToSynthesis}
      />,
      { wrapper: dsWrapper },
    );

    await user.click(screen.getByText("Share Task 1"));

    await waitFor(() => {
      expect(mockOnShareTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "task-1",
          shareToken: "share-tok-123",
        }),
      );
    });
  });

  it("should handle edit task error gracefully", async () => {
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockGetTask.mockRejectedValueOnce(new Error("fetch fail"));

    const user = userEvent.setup();
    render(
      <TasksView
        selectedTaskId={null}
        taskRefreshTrigger={0}
        onBack={mockOnBack}
        onViewTask={mockOnViewTask}
        onCreateTask={mockOnCreateTask}
        onEditTask={mockOnEditTask}
        onDeleteTask={mockOnDeleteTask}
        onShareTask={mockOnShareTask}
        onNavigateToSynthesis={mockOnNavigateToSynthesis}
      />,
      { wrapper: dsWrapper },
    );

    await user.click(screen.getByText("Edit Task 1"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

});
