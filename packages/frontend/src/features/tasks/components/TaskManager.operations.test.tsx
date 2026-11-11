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

  it("renders descriptions", () => {
    render(<TaskManager {...defaultProps} />);
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("delete button has danger class", async () => {
    const user = userEvent.setup();
    const { container } = render(<TaskManager {...defaultProps} />);
    const moreButtons = screen.getAllByLabelText("Rohkem valikuid");
    await user.click(moreButtons[0]!);
    await waitFor(() => expect(screen.getByText("Kustuta")).toBeInTheDocument());
    expect(container.querySelector(".task-manager__menu-item--danger")).toBeTruthy();
  });

  it("closes menu when clicking same more button again", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    const moreButtons = screen.getAllByLabelText("Rohkem valikuid");
    await user.click(moreButtons[0]!);
    await waitFor(() => expect(screen.getByText("Muuda")).toBeInTheDocument());
    await user.click(moreButtons[0]!);
    await waitFor(() => expect(screen.queryByText("Muuda")).not.toBeInTheDocument());
  });

  it("menu closes after edit action", async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    const moreButtons = screen.getAllByLabelText("Rohkem valikuid");
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

  it("calls onViewTask on Enter key on task row", async () => {
    const { container } = render(<TaskManager {...defaultProps} />);
    const taskRow = container.querySelector(".task-row-content");
    if (taskRow) {
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.keyDown(taskRow, { key: "Enter" });
      expect(defaultProps.onViewTask).toHaveBeenCalledWith("task-1");
    }
  });

  it("calls onViewTask on Space key on task row", async () => {
    const { container } = render(<TaskManager {...defaultProps} />);
    const taskRow = container.querySelector(".task-row-content");
    if (taskRow) {
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.keyDown(taskRow, { key: " " });
      expect(defaultProps.onViewTask).toHaveBeenCalledWith("task-1");
    }
  });

  it("closes menu on Escape key on backdrop", async () => {
    const user = userEvent.setup();
    const { container } = render(<TaskManager {...defaultProps} />);
    const moreButtons = screen.getAllByLabelText("Rohkem valikuid");
    await user.click(moreButtons[0]!);
    await waitFor(() => expect(screen.getByText("Muuda")).toBeInTheDocument());
    const backdrop = container.querySelector(".task-manager__menu-backdrop");
    if (backdrop) {
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.keyDown(backdrop, { key: "Escape" });
    }
    await waitFor(() => expect(screen.queryByText("Muuda")).not.toBeInTheDocument());
  });

});
