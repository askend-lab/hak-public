// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddToTaskDropdown from "./AddToTaskDropdown";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

const stableUser = {
  id: "38001085718",
  name: "Test User",
  email: "test@test.ee",
};
vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    user: stableUser,
  })),
}));

const mockDS = createMockDataService({
  getUserTasks: vi.fn().mockResolvedValue([
    { id: "task-1", name: "Task One", description: "", entryCount: 0 },
    { id: "task-2", name: "Task Two", description: "", entryCount: 0 },
  ]),
});
const dsWrapper = ({ children }: { children: React.ReactNode }) => <DataServiceTestWrapper dataService={mockDS}>{children}</DataServiceTestWrapper>;

describe("AddToTaskDropdown", () => {
  const mockOnClose = vi.fn();
  const mockOnSelectTask = vi.fn();
  const mockOnCreateNew = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("confirm panel", () => {
    const fullTaskDS = createMockDataService({
      getUserTasks: vi.fn().mockResolvedValue([
        { id: "task-3", name: "Full Task", description: "", entryCount: 5 },
      ]),
    });
    const fullTaskWrapper = ({ children }: { children: React.ReactNode }) => <DataServiceTestWrapper dataService={fullTaskDS}>{children}</DataServiceTestWrapper>;

    it("shows confirm panel when task with entries is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={2}
        />,
        { wrapper: fullTaskWrapper },
      );
      await waitFor(() => expect(screen.getByText("Full Task")).toBeInTheDocument());
      await user.click(screen.getByText("Full Task"));
      await waitFor(() => expect(screen.getByText("Lisa juurde")).toBeInTheDocument());
      expect(screen.getByText("Asenda olemasolevad")).toBeInTheDocument();
    });

    it("calls onSelectTask with append when Lisa juurde clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={2}
        />,
        { wrapper: fullTaskWrapper },
      );
      await waitFor(() => expect(screen.getByText("Full Task")).toBeInTheDocument());
      await user.click(screen.getByText("Full Task"));
      await waitFor(() => expect(screen.getByText("Lisa juurde")).toBeInTheDocument());
      await user.click(screen.getByText("Lisa juurde"));
      expect(mockOnSelectTask).toHaveBeenCalledWith("task-3", "Full Task", "append");
    });

    it("calls onSelectTask with replace when Asenda clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={2}
        />,
        { wrapper: fullTaskWrapper },
      );
      await waitFor(() => expect(screen.getByText("Full Task")).toBeInTheDocument());
      await user.click(screen.getByText("Full Task"));
      await waitFor(() => expect(screen.getByText("Asenda olemasolevad")).toBeInTheDocument());
      await user.click(screen.getByText("Asenda olemasolevad"));
      expect(mockOnSelectTask).toHaveBeenCalledWith("task-3", "Full Task", "replace");
    });

    it("goes back from confirm panel when Tagasi clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={2}
        />,
        { wrapper: fullTaskWrapper },
      );
      await waitFor(() => expect(screen.getByText("Full Task")).toBeInTheDocument());
      await user.click(screen.getByText("Full Task"));
      await waitFor(() => expect(screen.getByText("Lisa juurde")).toBeInTheDocument());
      await user.click(screen.getByLabelText("Tagasi"));
      await waitFor(() => expect(screen.getByPlaceholderText("Otsi")).toBeInTheDocument());
    });
  });

  describe("search functionality", () => {
    it("filters tasks based on search query", async () => {
      const { fireEvent } = await import("@testing-library/react");
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
        { wrapper: dsWrapper },
      );

      await waitFor(
        () => {
          expect(screen.getByText("Task One")).toBeInTheDocument();
          expect(screen.getByText("Task Two")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      fireEvent.change(screen.getByPlaceholderText("Otsi"), {
        target: { value: "One" },
      });

      await waitFor(
        () => {
          expect(screen.getByText("Task One")).toBeInTheDocument();
          expect(screen.queryByText("Task Two")).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("shows empty message when no tasks match", async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
        { wrapper: dsWrapper },
      );

      await waitFor(() => {
        expect(screen.getByText("Task One")).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText("Otsi"), "xyz");

      await waitFor(() => {
        expect(screen.queryByText("Task One")).not.toBeInTheDocument();
      });
    });
  });

});
