// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SentenceMenu from "./SentenceMenu";

const defaultProps = {
  isAuthenticated: false,
  sentenceId: "s1",
  sentenceText: "test",
  menuSearchQuery: "",
  onSearchChange: vi.fn(),
  isLoadingTasks: false,
  tasks: [],
  onAddToTask: vi.fn(),
  onCreateNewTask: vi.fn(),
  onExplorePhonetic: vi.fn(),
  onDownload: vi.fn(),
  onCopyText: vi.fn(),
  onRemove: vi.fn(),
  onLogin: vi.fn(),
  onClose: vi.fn(),
};

describe("SentenceMenu authenticated", () => {
  const tasks = [
    { id: "t1", name: "Task 1" },
    { id: "t2", name: "Task 2" },
  ];

  it("shows search and tasks when authenticated", async () => {
    render(
      <SentenceMenu {...defaultProps} isAuthenticated={true} tasks={tasks} />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    expect(screen.getByPlaceholderText("Otsi")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("filters tasks by search query", async () => {
    render(
      <SentenceMenu
        {...defaultProps}
        isAuthenticated={true}
        tasks={tasks}
        menuSearchQuery="Task 1"
      />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
  });

  it("shows loading state", async () => {
    render(
      <SentenceMenu
        {...defaultProps}
        isAuthenticated={true}
        isLoadingTasks={true}
      />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    expect(screen.getByText("Laen...")).toBeInTheDocument();
  });

  it("calls onAddToTask when task clicked", async () => {
    const onAddToTask = vi.fn();
      const onClose = vi.fn();
    render(
      <SentenceMenu
        {...defaultProps}
        isAuthenticated={true}
        tasks={tasks}
        onAddToTask={onAddToTask}
        onClose={onClose}
      />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    await userEvent.click(screen.getByText("Task 1"));
    expect(onAddToTask).toHaveBeenCalledWith("s1", "t1", "Task 1");
  });

  it("calls onCreateNewTask", async () => {
    const onCreateNewTask = vi.fn();
    render(
      <SentenceMenu
        {...defaultProps}
        isAuthenticated={true}
        onCreateNewTask={onCreateNewTask}
      />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    await userEvent.click(screen.getByText("Loo uus ülesanne"));
    expect(onCreateNewTask).toHaveBeenCalledWith("s1");
  });

});
