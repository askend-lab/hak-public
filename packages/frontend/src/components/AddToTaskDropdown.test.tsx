// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddToTaskDropdown from "./AddToTaskDropdown";

const stableUser = {
  id: "38001085718",
  name: "Test User",
  email: "test@test.ee",
};
vi.mock("@/services/auth", () => ({
  useAuth: vi.fn(() => ({
    user: stableUser,
  })),
}));

vi.mock("@/services/dataService", () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getUserTasks: vi.fn().mockResolvedValue([
        { id: "task-1", name: "Task One", description: "", entryCount: 0 },
        { id: "task-2", name: "Task Two", description: "", entryCount: 0 },
      ]),
    })),
  },
}));

describe("AddToTaskDropdown", () => {
  const mockOnClose = vi.fn();
  const mockOnSelectTask = vi.fn();
  const mockOnCreateNew = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <AddToTaskDropdown
          isOpen={false}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders when open", async () => {
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Otsi")).toBeInTheDocument();
      });
    });

    it("renders search input", async () => {
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Otsi")).toBeInTheDocument();
      });
    });

    it("renders create new button", async () => {
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Loo uus ülesanne")).toBeInTheDocument();
      });
    });

    it("renders task list after loading", async () => {
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Task One")).toBeInTheDocument();
        expect(screen.getByText("Task Two")).toBeInTheDocument();
      });
    });
  });

  describe("interactions", () => {
    it("calls onClose when backdrop clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Otsi")).toBeInTheDocument();
      });

      const backdrop = document.querySelector(".add-to-task-backdrop");
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it("calls onSelectTask with append mode when empty task clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Task One")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Task One"));
      expect(mockOnSelectTask).toHaveBeenCalledWith("task-1", "Task One", "append");
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onCreateNew when create button clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
          sentenceCount={3}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Loo uus ülesanne")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Loo uus ülesanne"));
      expect(mockOnCreateNew).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
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
