// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
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

  it("should update task", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    const updatedTask = {
      id: "task-1",
      name: "Updated Task",
      description: "Updated Desc",
    };

    // Call handleTaskUpdated with updated task data
    await act(async () => {
      await result.current.crud.handleTaskUpdated(updatedTask);
    });

    expect(mockUpdateTask).toHaveBeenCalledWith("task-1", {
      name: "Updated Task",
      description: "Updated Desc",
    });
    expect(result.current.modals.showTaskEditModal).toBe(false);
  });

  it("should share task", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    await act(async () => {
      await result.current.sharing.handleShareTask({ id: "task-1", name: "Task 1" });
    });

    expect(mockShareUserTask).toHaveBeenCalledWith("task-1");
    expect(result.current.modals.showShareTaskModal).toBe(true);
    expect(result.current.modals.taskToShare).toMatchObject({
      id: "task-1",
      name: "Task 1",
    });
  });

  it("should revoke share", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );
    await act(async () => {
      await result.current.sharing.handleRevokeShare("share-token-abc");
    });
    expect(mockRevokeShare).toHaveBeenCalledWith("share-token-abc");
  });

  it("should handle error when adding entries to task", async () => {
    mockAddTextEntriesToTask.mockRejectedValueOnce(new Error("Failed"));
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    await act(async () => {
      await result.current.entries.handleSelectTaskFromDropdown("task-1", "Task 1", "append");
    });

    expect(mockShowNotification).toHaveBeenCalledWith({
      type: "error",
      message: expect.any(String),
    });
    consoleSpy.mockRestore();
  });

  it("should handle empty sentences when adding to task", async () => {
    const emptySentences: SentenceState[] = [
      {
        id: "1",
        text: "",
        tags: [],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
      },
    ];
    const { result } = renderHook(() =>
      useTaskHandlers(
        emptySentences,
        mockSetCurrentView,
        mockSetSelectedTaskId,
      ),
      { wrapper: dsWrapper },
    );

    await act(async () => {
      await result.current.entries.handleSelectTaskFromDropdown("task-1", "Task 1", "append");
    });

    expect(mockAddTextEntriesToTask).not.toHaveBeenCalled();
  });

  it("should handle error when updating task", async () => {
    mockUpdateTask.mockRejectedValueOnce(new Error("Failed"));
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    // Set taskToEdit first in a separate act
    act(() => {
      result.current.modals.setTaskToEdit({
        id: "task-1",
        name: "Updated",
        description: "Desc",
      });
    });

    const updatedTask = { id: "task-1", name: "Updated", description: "Desc" };

    // Then call handleTaskUpdated
    await act(async () => {
      await result.current.crud.handleTaskUpdated(updatedTask);
    });
    expect(mockShowNotification).toHaveBeenCalledWith({
      type: "error",
      message: expect.any(String),
    });
    consoleSpy.mockRestore();
  });

  it("should close share modal", () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    act(() => {
      result.current.modals.setShowShareTaskModal(true);
    });
    expect(result.current.modals.showShareTaskModal).toBe(true);

    act(() => {
      result.current.modals.setShowShareTaskModal(false);
    });
    expect(result.current.modals.showShareTaskModal).toBe(false);
  });

});
