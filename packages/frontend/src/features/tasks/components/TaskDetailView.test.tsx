// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TaskDetailView from "./TaskDetailView";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-1", name: "Test User" },
    isAuthenticated: true,
  })),
}));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({
    showNotification: vi.fn(),
  })),
}));
vi.mock("@/contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({ copiedEntries: null, setCopiedEntries: vi.fn(), consumeCopiedEntries: vi.fn().mockReturnValue(null), hasCopiedEntries: false }),
}));

const mockTask = {
  id: "task-1",
  name: "Test Task",
  description: "Test Description",
  shareToken: "share-token-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  speechEntries: [
    { id: "entry-1", text: "Entry 1", stressedText: "Entry 1", order: 0 },
    { id: "entry-2", text: "Entry 2", stressedText: "Entry 2", order: 1 },
  ],
};

const mockGetTask = vi.fn().mockResolvedValue(mockTask);
const mockDS = createMockDataService({
  getTask: mockGetTask,
  deleteTaskEntry: vi.fn().mockResolvedValue({}),
  reorderTaskEntries: vi.fn().mockResolvedValue({}),
} as never);
const dsWrapper = ({ children }: { children: React.ReactNode }) => <DataServiceTestWrapper dataService={mockDS}>{children}</DataServiceTestWrapper>;

describe("TaskDetailView", () => {
  const defaultProps = {
    taskId: "task-1",
    onBack: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onNavigateToSynthesis: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTask.mockResolvedValue(mockTask);
  });

  it("should render loading state initially", () => {
    render(<TaskDetailView {...defaultProps} />, { wrapper: dsWrapper });
    expect(screen.getByText(/laen/i)).toBeInTheDocument();
  });

  it("should render task name after loading", async () => {
    render(<TaskDetailView {...defaultProps} />, { wrapper: dsWrapper });

    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });
  });

  it("should call getTask with correct params", async () => {
    render(<TaskDetailView {...defaultProps} />, { wrapper: dsWrapper });

    await waitFor(() => {
      expect(mockGetTask).toHaveBeenCalledWith("task-1");
    });
  });

  it("should show error when task not found", async () => {
    mockGetTask.mockResolvedValue(null);
    render(<TaskDetailView {...defaultProps} />, { wrapper: dsWrapper });

    await waitFor(() => {
      expect(screen.getByText(/ei leitud/i)).toBeInTheDocument();
    });
  });

  it("should render task description when available", async () => {
    render(<TaskDetailView {...defaultProps} />, { wrapper: dsWrapper });

    await waitFor(() => {
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
  });
});
