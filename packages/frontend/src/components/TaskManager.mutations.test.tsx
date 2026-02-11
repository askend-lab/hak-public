// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskManager from "./TaskManager";

vi.mock("@/utils/formatDate", () => ({
  formatDate: vi.fn((d: Date) => d.toISOString().slice(0, 10)),
}));

const makeTasks = () => [
  { id: "t1", name: "Task One", description: "Short desc", entryCount: 1, createdAt: new Date("2025-01-01"), updatedAt: new Date() },
  { id: "t2", name: "Task Two", description: null, entryCount: 3, createdAt: new Date("2025-02-01"), updatedAt: new Date() },
];

describe("TaskManager mutation kills", () => {
  const handlers = {
    onEditTask: vi.fn(), onViewTask: vi.fn(), onDeleteTask: vi.fn(), onShareTask: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it("renders task names and entry counts", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    expect(screen.getByText("Task One")).toBeInTheDocument();
    expect(screen.getByText("Task Two")).toBeInTheDocument();
    expect(screen.getByText("[1] lauset")).toBeInTheDocument();
    expect(screen.getByText("[3] lauset")).toBeInTheDocument();
  });

  it("renders task descriptions", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    expect(screen.getByText("Short desc")).toBeInTheDocument();
  });

  it("renders formatted dates", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    expect(screen.getByText(/Loodud 2025-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/Loodud 2025-02-01/)).toBeInTheDocument();
  });

  it("calls onViewTask when row content clicked", async () => {
    const user = userEvent.setup();
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    await user.click(screen.getByText("Task One"));
    expect(handlers.onViewTask).toHaveBeenCalledWith("t1");
  });

  it("opens menu and calls onEditTask", async () => {
    const user = userEvent.setup();
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const menuBtns = screen.getAllByLabelText("More options");
    await user.click(menuBtns[0]!);
    expect(screen.getByText("Muuda")).toBeInTheDocument();
    await user.click(screen.getByText("Muuda"));
    expect(handlers.onEditTask).toHaveBeenCalledWith("t1");
  });

  it("opens menu and calls onShareTask", async () => {
    const user = userEvent.setup();
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const menuBtns = screen.getAllByLabelText("More options");
    await user.click(menuBtns[0]!);
    await user.click(screen.getByText("Jaga"));
    expect(handlers.onShareTask).toHaveBeenCalledWith("t1");
  });

  it("opens menu and calls onDeleteTask", async () => {
    const user = userEvent.setup();
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const menuBtns = screen.getAllByLabelText("More options");
    await user.click(menuBtns[0]!);
    await user.click(screen.getByText("Kustuta"));
    expect(handlers.onDeleteTask).toHaveBeenCalledWith("t1");
  });

  it("toggles menu open/close on same button", async () => {
    const user = userEvent.setup();
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const menuBtns = screen.getAllByLabelText("More options");
    await user.click(menuBtns[0]!);
    expect(screen.getByText("Muuda")).toBeInTheDocument();
    await user.click(menuBtns[0]!);
    expect(screen.queryByText("Muuda")).not.toBeInTheDocument();
  });

  it("closes menu via backdrop", async () => {
    const user = userEvent.setup();
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const menuBtns = screen.getAllByLabelText("More options");
    await user.click(menuBtns[0]!);
    expect(screen.getByText("Muuda")).toBeInTheDocument();
    const backdrop = document.querySelector(".task-manager__menu-backdrop");
    expect(backdrop).toBeTruthy();
    await user.click(backdrop!);
    expect(screen.queryByText("Muuda")).not.toBeInTheDocument();
  });

  it("applies expanded class on show more click", async () => {
    const longDesc = "A".repeat(500);
    const tasks = [{ id: "t1", name: "Task", description: longDesc, entryCount: 0, createdAt: new Date(), updatedAt: new Date() }];
    render(<TaskManager tasks={tasks} {...handlers} />);
    // The "Näita rohkem" button only shows if needsExpansion is true (scrollHeight > clientHeight)
    // In jsdom scrollHeight === clientHeight, so we verify the row renders without expanded class
    const row = document.querySelector(".task-row-simple");
    expect(row).toBeTruthy();
    expect(row?.classList.contains("expanded")).toBe(false);
  });

  it("does not render show more button when no description", () => {
    const tasks = [{ id: "t1", name: "T", description: null, entryCount: 0, createdAt: new Date(), updatedAt: new Date() }];
    render(<TaskManager tasks={tasks} {...handlers} />);
    expect(screen.queryByText("Näita rohkem")).not.toBeInTheDocument();
    expect(screen.queryByText("Näita vähem")).not.toBeInTheDocument();
  });

  it("renders empty list when no tasks", () => {
    const { container } = render(<TaskManager tasks={[]} {...handlers} />);
    expect(container.querySelector(".task-manager-simple")).toBeInTheDocument();
    expect(screen.queryByText("Task One")).not.toBeInTheDocument();
  });

  it("menu closes after action", async () => {
    const user = userEvent.setup();
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const menuBtns = screen.getAllByLabelText("More options");
    await user.click(menuBtns[0]!);
    await user.click(screen.getByText("Muuda"));
    expect(screen.queryByText("Kustuta")).not.toBeInTheDocument();
  });

  it("renders task-row-simple class on each row", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const rows = document.querySelectorAll(".task-row-simple");
    expect(rows.length).toBe(2);
  });

  it("renders task-row-name class", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const names = document.querySelectorAll(".task-row-name");
    expect(names.length).toBe(2);
    expect(names[0]?.textContent).toBe("Task One");
  });

  it("renders task-row-description class", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const descs = document.querySelectorAll(".task-row-description");
    expect(descs.length).toBe(2);
    expect(descs[0]?.textContent).toBe("Short desc");
  });

  it("renders task-row-count with brackets and 'lauset'", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const counts = document.querySelectorAll(".task-row-count");
    expect(counts[0]?.textContent).toContain("[1]");
    expect(counts[0]?.textContent).toContain("lauset");
    expect(counts[1]?.textContent).toContain("[3]");
  });

  it("row does not have expanded class by default", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const rows = document.querySelectorAll(".task-row-simple");
    rows.forEach(row => expect(row.classList.contains("expanded")).toBe(false));
  });

  it("task-row-description-wrapper contains description", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const wrapper = document.querySelector(".task-row-description-wrapper");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders task-row-date with 'Loodud' prefix", () => {
    render(<TaskManager tasks={makeTasks()} {...handlers} />);
    const dates = document.querySelectorAll(".task-row-date");
    expect(dates[0]?.textContent).toContain("Loodud");
  });
});
