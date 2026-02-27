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

  it("does not add sentence when not found", async () => {
    const { result } = renderHook(() =>
      useTaskHandlers(sentences, setView, setTaskId),
      { wrapper: dsWrapper },
    );
    await act(async () => {
      await result.current.entries.handleAddSentenceToExistingTask(
        "nonexistent",
        "task-1",
        "Task 1",
      );
    });
    expect(mockAddTextEntriesToTask).not.toHaveBeenCalled();
  });

  it("does not add sentence with empty text", async () => {
    const empty: SentenceState[] = [
      {
        id: "1",
        text: "   ",
        tags: [],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
      },
    ];
    const { result } = renderHook(() =>
      useTaskHandlers(empty, setView, setTaskId),
      { wrapper: dsWrapper },
    );
    await act(async () => {
      await result.current.entries.handleAddSentenceToExistingTask(
        "1",
        "task-1",
        "Task 1",
      );
    });
    expect(mockAddTextEntriesToTask).not.toHaveBeenCalled();
  });

  it("handles error when adding single sentence", async () => {
    mockAddTextEntriesToTask.mockRejectedValueOnce(new Error("Failed"));
    vi.spyOn(logger, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useTaskHandlers(sentences, setView, setTaskId),
      { wrapper: dsWrapper },
    );
    await act(async () => {
      await result.current.entries.handleAddSentenceToExistingTask(
        "1",
        "task-1",
        "Task 1",
      );
    });
    expect(mockShowNotification).toHaveBeenCalledWith({
      type: "error",
      message: expect.any(String),
    });
  });

  it("creates empty task when triggered from Tasks view, not including synthesis sentences", async () => {
    const synthesisSentences: SentenceState[] = [
      {
        id: "synth-1",
        text: "Hello world",
        tags: ["Hello", "world"],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
      },
      {
        id: "synth-2",
        text: "Test sentence",
        tags: ["Test", "sentence"],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
      },
    ];
    const { result } = renderHook(() =>
      useTaskHandlers(synthesisSentences, setView, setTaskId),
      { wrapper: dsWrapper },
    );

    // User clicks "Loo uus ülesanne" (Create new task) from Tasks view - NOT from synthesis
    act(() => {
      result.current.crud.handleCreateTask();
    });
    expect(result.current.modals.showAddTaskModal).toBe(true);

    // User submits the modal to create the task
    await act(async () => {
      await result.current.crud.handleAddTask("Empty Task", "");
    });

    // Task should be created WITHOUT any sentences from synthesis
    expect(mockCreateTask).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        name: "Empty Task",
        speechEntries: null,
      }),
    );
  });

});
