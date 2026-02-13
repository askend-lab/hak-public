// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { renderHook, act } from "@testing-library/react";
import { useTaskHandlers } from "./useTaskHandlers";
import { SentenceState } from "@/types/synthesis";

const mockShowNotification = vi.fn();
const mockSetShowLoginModal = vi.fn();

vi.mock("@/services/auth", () => ({
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

const mockDeleteTask = vi.fn().mockResolvedValue({});
const mockGetTask = vi.fn().mockResolvedValue({
  id: "task-1",
  name: "Task 1",
  description: "Desc",
  shareToken: "token",
});

vi.mock("@/services/dataService", () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      deleteTask: mockDeleteTask,
      getTask: mockGetTask,
    })),
  },
}));

describe("useTaskHandlers - Task Deletion", () => {
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
  ];
  const mockSetCurrentView = vi.fn();
  const mockSetSelectedTaskId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete task with confirmation", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
    );

    await act(async () => {
      await result.current.handleDeleteTask("task-1");
    });

    expect(result.current.showDeleteConfirmation).toBe(true);
    expect(result.current.taskToDelete).toEqual({
      id: "task-1",
      name: "Task 1",
    });
  });

  it("should confirm delete", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
    );

    await act(async () => {
      await result.current.handleDeleteTask("task-1");
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteTask).toHaveBeenCalledWith("user-1", "task-1");
    expect(result.current.showDeleteConfirmation).toBe(false);
  });

  it("should redirect to task list after successful deletion", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
    );

    await act(async () => {
      await result.current.handleDeleteTask("task-1");
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteTask).toHaveBeenCalledWith("user-1", "task-1");
    expect(mockSetSelectedTaskId).toHaveBeenCalledWith(null);
    expect(mockSetCurrentView).toHaveBeenCalledWith("tasks");
  });

  it("should cancel delete", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
    );

    await act(async () => {
      await result.current.handleDeleteTask("task-1");
    });

    act(() => {
      result.current.handleCancelDelete();
    });

    expect(result.current.showDeleteConfirmation).toBe(false);
    expect(result.current.taskToDelete).toBeNull();
  });

  it("should handle error when deleting task", async () => {
    mockDeleteTask.mockRejectedValueOnce(new Error("Failed"));
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
    );

    await act(async () => {
      await result.current.handleDeleteTask("task-1");
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockShowNotification).toHaveBeenCalledWith(
      "error",
      "Ülesande kustutamine ebaõnnestus",
    );
    consoleSpy.mockRestore();
  });
});
