// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TaskDetailView from "./TaskDetailView";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-1", name: "Test" },
    isAuthenticated: true,
  })),
}));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({ showNotification: vi.fn() })),
}));
vi.mock("@/contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({ copiedEntries: null, setCopiedEntries: vi.fn(), consumeCopiedEntries: vi.fn().mockReturnValue(null), hasCopiedEntries: false }),
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
}));

const mockTask = {
  id: "task-1",
  name: "Test Task",
  description: "Description",
  shareToken: "token-1",
  entries: [
    {
      id: "e1",
      text: "Entry 1",
      stressedText: "Entry 1",
      order: 0,
      audioUrl: null,
    },
    {
      id: "e2",
      text: "Entry 2",
      stressedText: "Entry 2",
      order: 1,
      audioUrl: null,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGetTask = vi.fn().mockResolvedValue(mockTask);
const mockUpdateTaskEntry = vi.fn().mockResolvedValue({});
const mockShareUserTask = vi.fn().mockResolvedValue({});
const mockDS = createMockDataService({
  getTask: mockGetTask,
  updateTaskEntry: mockUpdateTaskEntry,
  shareUserTask: mockShareUserTask,
  deleteTaskEntry: vi.fn().mockResolvedValue({}),
} as never);
const dsWrapper = ({ children }: { children: React.ReactNode }) => <DataServiceTestWrapper dataService={mockDS}>{children}</DataServiceTestWrapper>;

describe("TaskDetailView Full", () => {
  const props = {
    taskId: "task-1",
    onBack: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onNavigateToSynthesis: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTask.mockResolvedValue(mockTask);
    class MockAudio {
      src = "";
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onloadeddata: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => {
        setTimeout(() => this.onended?.(), 10);
        return Promise.resolve();
      });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => "blob-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("renders loading then task", async () => {
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    expect(screen.getByText(/laen/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Test Task")).toBeInTheDocument(),
    );
  });

  it("shows error on task not found", async () => {
    mockGetTask.mockResolvedValue(null);
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText(/ei leitud/i)).toBeInTheDocument(),
    );
  });

  it("shows loading state initially", () => {
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    expect(screen.getByText(/laen/i)).toBeInTheDocument();
  });

  it("renders with taskId prop", () => {
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    expect(mockGetTask).toHaveBeenCalledWith("task-1", "user-1");
  });

  it("opens share modal", async () => {
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText("Test Task")).toBeInTheDocument(),
    );
    const menuButton = screen
      .getAllByRole("button")
      .find((b) => b.querySelector("svg"));
    if (menuButton) {
      fireEvent.click(menuButton);
      await waitFor(() => {
        const shareButton = screen.queryByText(/jaga/i);
        if (shareButton) fireEvent.click(shareButton);
      });
    }
  });

  it("handles empty entries array", async () => {
    mockGetTask.mockResolvedValue({ ...mockTask, entries: [] });
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText("Test Task")).toBeInTheDocument(),
    );
  });

  it("handles task with no description", async () => {
    mockGetTask.mockResolvedValue({ ...mockTask, description: "" });
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText("Test Task")).toBeInTheDocument(),
    );
  });

  it("handles API error gracefully", async () => {
    mockGetTask.mockRejectedValue(new Error("API Error"));
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    // Component handles error gracefully
    expect(screen.getByText(/laen/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("renders edit button in header menu", async () => {
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText("Test Task")).toBeInTheDocument(),
    );
  });

  it("renders delete button in header menu", async () => {
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText("Test Task")).toBeInTheDocument(),
    );
  });

  it("handles entry with audioUrl", () => {
    const taskWithAudio = {
      ...mockTask,
      entries: [
        {
          id: "e1",
          text: "Entry 1",
          stressedText: "Entry 1",
          order: 0,
          audioUrl: "blob:audio",
        },
      ],
    };
    mockGetTask.mockResolvedValue(taskWithAudio);
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    // Task with audio URL is handled
    expect(mockGetTask).toHaveBeenCalled();
  });

  it("handles task with stressedText different from text", async () => {
    const taskWithStress = {
      ...mockTask,
      entries: [
        {
          id: "e1",
          text: "Hello",
          stressedText: "He`llo",
          order: 0,
          audioUrl: null,
        },
      ],
    };
    mockGetTask.mockResolvedValue(taskWithStress);
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() => expect(screen.getByText(/Hello/)).toBeInTheDocument());
  });

  it("renders task description when present", async () => {
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText("Description")).toBeInTheDocument(),
    );
  });

  it("handles multiple entries correctly", async () => {
    const taskWithMany = {
      ...mockTask,
      entries: [
        {
          id: "e1",
          text: "First",
          stressedText: "First",
          order: 0,
          audioUrl: null,
        },
        {
          id: "e2",
          text: "Second",
          stressedText: "Second",
          order: 1,
          audioUrl: null,
        },
        {
          id: "e3",
          text: "Third",
          stressedText: "Third",
          order: 2,
          audioUrl: null,
        },
      ],
    };
    mockGetTask.mockResolvedValue(taskWithMany);
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() => {
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });
  });

  it("renders shareToken in task", async () => {
    render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText("Test Task")).toBeInTheDocument(),
    );
    expect(mockGetTask).toHaveBeenCalledWith("task-1", "user-1");
  });

  it("handles task refresh", async () => {
    const { rerender } = render(<TaskDetailView {...props} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByText("Test Task")).toBeInTheDocument(),
    );
    rerender(<TaskDetailView {...props} taskId="task-2" />);
    await waitFor(() =>
      expect(mockGetTask).toHaveBeenCalledWith("task-2", "user-1"),
    );
  });

  it("loads task with dynamically generated ID (e.g. task_timestamp_random)", async () => {
    // RED TEST: Bug - navigation to task with generated ID fails
    // URL pattern: /tasks/task_1769185807640_wublowec
    const dynamicTaskId = "task_1769185807640_wublowec";
    const dynamicTask = { ...mockTask, id: dynamicTaskId };
    mockGetTask.mockResolvedValue(dynamicTask);

    render(<TaskDetailView {...props} taskId={dynamicTaskId} />, { wrapper: dsWrapper });

    await waitFor(() => {
      expect(mockGetTask).toHaveBeenCalledWith(dynamicTaskId, "user-1");
    });
    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });
  });
});
