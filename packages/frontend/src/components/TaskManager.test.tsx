// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskManager from "./TaskManager";
import { TaskSummary } from "@/types/task";

const mockTasks: TaskSummary[] = [
  {
    id: "task-1",
    name: "Task 1",
    description: "Description 1",
    createdAt: new Date(),
    updatedAt: new Date(),
    entryCount: 5,
  },
  {
    id: "task-2",
    name: "Task 2",
    description: "Description 2",
    createdAt: new Date(),
    updatedAt: new Date(),
    entryCount: 3,
  },
];

describe("TaskManager", () => {
  const defaultProps = {
    tasks: mockTasks,
    onEditTask: vi.fn(),
    onViewTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onShareTask: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render tasks", () => {
    render(<TaskManager {...defaultProps} />);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("should call onViewTask when task is clicked", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);

    await user.click(screen.getByText("Task 1"));
    expect(defaultProps.onViewTask).toHaveBeenCalledWith("task-1");
  });

  it("should open menu when more options clicked", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);

    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText("Muuda")).toBeInTheDocument();
      expect(screen.getByText("Jaga")).toBeInTheDocument();
      expect(screen.getByText("Kustuta")).toBeInTheDocument();
    });
  });

  it("should call onEditTask when edit clicked", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);

    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText("Muuda")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Muuda"));
    expect(defaultProps.onEditTask).toHaveBeenCalledWith("task-1");
  });

  it("should call onShareTask when share clicked", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);

    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText("Jaga")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Jaga"));
    expect(defaultProps.onShareTask).toHaveBeenCalledWith("task-1");
  });

  it("should call onDeleteTask when delete clicked", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);

    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText("Kustuta")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Kustuta"));
    expect(defaultProps.onDeleteTask).toHaveBeenCalledWith("task-1");
  });

  it("should close menu when backdrop clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<TaskManager {...defaultProps} />);

    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText("Muuda")).toBeInTheDocument();
    });

    const backdrop = container.querySelector(".task-manager__menu-backdrop");
    if (backdrop) await user.click(backdrop);

    await waitFor(() => {
      expect(screen.queryByText("Muuda")).not.toBeInTheDocument();
    });
  });

  it("should render empty when no tasks provided", () => {
    render(<TaskManager {...defaultProps} tasks={[]} />);
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
  });

  it("should toggle expanded description", async () => {
    const longDesc = "A".repeat(200);
    const tasks: TaskSummary[] = [
      {
        id: "task-1",
        name: "Task 1",
        description: longDesc,
        createdAt: new Date(),
        updatedAt: new Date(),
        entryCount: 5,
      },
    ];
    // Mock scrollHeight > clientHeight to trigger needsExpansion
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return 100;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get() {
        return 20;
      },
    });

    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} tasks={tasks} />);

    const expandBtn = screen.getByText("Näita rohkem");
    await user.click(expandBtn);
    // Should not trigger onViewTask due to stopPropagation
    expect(defaultProps.onViewTask).not.toHaveBeenCalled();
    // Should now show "Näita vähem"
    expect(screen.getByText("Näita vähem")).toBeInTheDocument();

    // Click again to collapse
    await user.click(screen.getByText("Näita vähem"));
    expect(screen.getByText("Näita rohkem")).toBeInTheDocument();

    // Cleanup
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return 0;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get() {
        return 0;
      },
    });
  });

  it("should stop propagation on menu button click", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);

    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);

    // Menu should be open, onViewTask should NOT be called
    await waitFor(() => {
      expect(screen.getByText("Muuda")).toBeInTheDocument();
    });
    expect(defaultProps.onViewTask).not.toHaveBeenCalled();
  });

  it("has correct root class", () => {
    const { container } = render(<TaskManager {...defaultProps} />);
    expect(container.querySelector(".task-manager-simple")).toBeTruthy();
  });

  it("renders entry count", () => {
    render(<TaskManager {...defaultProps} />);
    expect(screen.getByText(/\[5\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[3\]/)).toBeInTheDocument();
  });

  it("renders descriptions", () => {
    render(<TaskManager {...defaultProps} />);
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("delete button has danger class", async () => {
    const user = userEvent.setup();
    const { container } = render(<TaskManager {...defaultProps} />);
    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);
    await waitFor(() => expect(screen.getByText("Kustuta")).toBeInTheDocument());
    expect(container.querySelector(".task-manager__menu-item--danger")).toBeTruthy();
  });

  it("closes menu when clicking same more button again", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);
    await waitFor(() => expect(screen.getByText("Muuda")).toBeInTheDocument());
    await user.click(moreButtons[0]!);
    await waitFor(() => expect(screen.queryByText("Muuda")).not.toBeInTheDocument());
  });

  it("menu closes after edit action", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    const moreButtons = screen.getAllByLabelText("More options");
    await user.click(moreButtons[0]!);
    await waitFor(() => expect(screen.getByText("Muuda")).toBeInTheDocument());
    await user.click(screen.getByText("Muuda"));
    await waitFor(() => expect(screen.queryByText("Muuda")).not.toBeInTheDocument());
  });

  it("renders Loodud prefix for date", () => {
    render(<TaskManager {...defaultProps} />);
    const dates = screen.getAllByText(/^Loodud/);
    expect(dates.length).toBe(2);
  });

  it("renders lauset suffix for entry count", () => {
    render(<TaskManager {...defaultProps} />);
    expect(screen.getAllByText(/lauset/).length).toBe(2);
  });
});
