// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskHandlers } from "./useTaskHandlers";
import { SentenceState } from "@/types/synthesis";
import { createElement } from "react";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

const mockShowNotification = vi.fn();
const mockSetShowLoginModal = vi.fn();

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-1", name: "Test User" },
    isAuthenticated: true,
    setShowLoginModal: mockSetShowLoginModal,
  })),
}));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({
    showNotification: mockShowNotification,
  })),
}));

const mockCreateTask = vi
  .fn()
  .mockResolvedValue({ id: "new-task-1", name: "New Task" });
const mockGetTask = vi.fn().mockResolvedValue({
  id: "task-1",
  name: "Task 1",
  description: "Desc",
  shareToken: "token",
});
const mockUpdateTask = vi.fn().mockResolvedValue({});
const mockDeleteTask = vi.fn().mockResolvedValue({});
const mockShareUserTask = vi.fn().mockResolvedValue({});
const mockAddTextEntriesToTask = vi.fn().mockResolvedValue({});
const mockGetUserTasks = vi
  .fn()
  .mockResolvedValue([{ id: "task-1", name: "Task 1" }]);
const mockRevokeShare = vi.fn().mockResolvedValue(undefined);

const mockDS = createMockDataService({
  createTask: mockCreateTask,
  getTask: mockGetTask,
  updateTask: mockUpdateTask,
  deleteTask: mockDeleteTask,
  shareUserTask: mockShareUserTask,
  addTextEntriesToTask: mockAddTextEntriesToTask,
  getUserTasks: mockGetUserTasks,
  revokeShare: mockRevokeShare,
} as never);
function dsWrapper({ children }: { children: React.ReactNode }) { return createElement(DataServiceTestWrapper, { dataService: mockDS }, children); }

describe("useTaskHandlers", () => {
  const mockSentences: SentenceState[] = [
    {
      id: "1",
      text: "Hello world",
      tags: ["Hello", "world"],
      isPlaying: false,
      isLoading: false,
      currentInput: "",
      phoneticText: "Héllo wórld",
    },
    {
      id: "2",
      text: "Test",
      tags: ["Test"],
      isPlaying: false,
      isLoading: false,
      currentInput: "",
    },
  ];
  const mockSetCurrentView = vi.fn();
  const mockSetSelectedTaskId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with closed modals", () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    expect(result.current.modals.showAddTaskModal).toBe(false);
    expect(result.current.modals.showAddToTaskDropdown).toBe(false);
  });

  it("should toggle add to task dropdown", () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    act(() => {
      result.current.entries.handleAddAllSentencesToTask();
    });

    expect(result.current.modals.showAddToTaskDropdown).toBe(true);

    act(() => {
      result.current.entries.handleAddAllSentencesToTask();
    });

    expect(result.current.modals.showAddToTaskDropdown).toBe(false);
  });

  it("should add sentences to existing task", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    await act(async () => {
      await result.current.entries.handleSelectTaskFromDropdown("task-1", "Task 1", "append");
    });

    expect(mockAddTextEntriesToTask).toHaveBeenCalledWith(
      "task-1",
      expect.any(Array),
      "append",
    );
    expect(mockShowNotification).toHaveBeenCalledWith({
      type: "success",
      message: expect.any(String),
      description: expect.any(String),
      action: expect.any(Object),
    });
  });

  it("should open add task modal from dropdown", () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    act(() => {
      result.current.entries.handleCreateNewFromDropdown();
    });

    expect(result.current.modals.showAddTaskModal).toBe(true);
  });

  it("should add single sentence to existing task", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    await act(async () => {
      await result.current.entries.handleAddSentenceToExistingTask(
        "1",
        "task-1",
        "Task 1",
      );
    });

    expect(mockAddTextEntriesToTask).toHaveBeenCalled();
    expect(mockShowNotification).toHaveBeenCalled();
  });

  it("should open add task modal from menu", () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    act(() => {
      result.current.crud.handleCreateNewTaskFromMenu("1");
    });

    expect(result.current.modals.showAddTaskModal).toBe(true);
  });

  it("should create task", () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    act(() => {
      result.current.crud.handleCreateTask();
    });

    expect(result.current.modals.showAddTaskModal).toBe(true);
  });

  it("should add task with playlist entries", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    await act(async () => {
      await result.current.crud.handleAddTask("New Task", "Description");
    });

    expect(mockCreateTask).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        name: "New Task",
        description: "Description",
      }),
    );
  });

  it("should edit task", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    await act(async () => {
      await result.current.crud.handleEditTask({
        id: "task-1",
        name: "Task 1",
        description: "Desc",
      });
    });

    expect(mockGetTask).toHaveBeenCalledWith("task-1");
    expect(result.current.modals.showTaskEditModal).toBe(true);
    expect(result.current.modals.taskToEdit).toEqual({
      id: "task-1",
      name: "Task 1",
      description: "Desc",
    });
  });

});
