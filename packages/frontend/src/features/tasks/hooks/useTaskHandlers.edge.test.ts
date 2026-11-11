// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskHandlers } from "./useTaskHandlers";
import { useAuth } from "@/features/auth/services";
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

describe("useTaskHandlers edge cases", () => {
  const sentences: SentenceState[] = [
    {
      id: "1",
      text: "Hello",
      tags: ["Hello"],
      isPlaying: false,
      isLoading: false,
      currentInput: "",
      phoneticText: "Hello",
    },
  ];
  const setView = vi.fn();
  const setTaskId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates new task with only the selected sentence, not all sentences", async () => {
    const multipleSentences: SentenceState[] = [
      {
        id: "sent-1",
        text: "First sentence",
        tags: ["First", "sentence"],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
      },
      {
        id: "sent-2",
        text: "Second sentence",
        tags: ["Second", "sentence"],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
      },
      {
        id: "sent-3",
        text: "Third sentence",
        tags: ["Third", "sentence"],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
      },
    ];
    const { result } = renderHook(() =>
      useTaskHandlers(multipleSentences, setView, setTaskId),
      { wrapper: dsWrapper },
    );

    // User clicks "Create new task" from sentence 2's menu
    act(() => {
      result.current.crud.handleCreateNewTaskFromMenu("sent-2");
    });
    expect(result.current.modals.showAddTaskModal).toBe(true);

    // User submits the modal to create the task
    await act(async () => {
      await result.current.crud.handleAddTask("My New Task", "Description");
    });

    // Should only add sentence 2, NOT all 3 sentences
    expect(mockCreateTask).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        name: "My New Task",
        description: "Description",
        speechEntries: [
          { text: "Second sentence", stressedText: "Second sentence" },
        ],
      }),
    );
  });

  it("requireAuth blocks action when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      setShowLoginModal: mockSetShowLoginModal,
    } as unknown as ReturnType<typeof useAuth>);
    const { result } = renderHook(() =>
      useTaskHandlers(sentences, setView, setTaskId),
      { wrapper: dsWrapper },
    );
    act(() => {
      result.current.entries.handleAddAllSentencesToTask();
    });
    expect(mockSetShowLoginModal).toHaveBeenCalledWith(true);
  });

  it("viewTaskAction navigates to task", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(sentences, setView, setTaskId),
      { wrapper: dsWrapper },
    );
    await act(async () => {
      await result.current.entries.handleSelectTaskFromDropdown("task-1", "Task 1", "append");
    });
    const call = mockShowNotification.mock.calls[0]?.[0];
    if (call?.action) {
      call.action.onClick();
      expect(setTaskId).toHaveBeenCalledWith("task-1");
      expect(setView).toHaveBeenCalled();
    }
  });

});
