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

  it("should close edit modal", () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    act(() => {
      result.current.modals.setShowTaskEditModal(true);
    });
    expect(result.current.modals.showTaskEditModal).toBe(true);

    act(() => {
      result.current.modals.setShowTaskEditModal(false);
    });
    expect(result.current.modals.showTaskEditModal).toBe(false);
  });

  it("should toggle add task dropdown", () => {
    const { result } = renderHook(() =>
      useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId),
      { wrapper: dsWrapper },
    );

    act(() => {
      result.current.modals.setShowAddToTaskDropdown(true);
    });
    expect(result.current.modals.showAddToTaskDropdown).toBe(true);
  });

});
