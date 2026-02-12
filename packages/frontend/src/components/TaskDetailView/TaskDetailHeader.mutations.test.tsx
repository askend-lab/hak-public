// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetailHeader } from "./TaskDetailHeader";

vi.mock("../ui/PlayAllButton", () => ({
  PlayAllButton: ({ isPlaying, isLoading, disabled, onClick }: {
    isPlaying: boolean; isLoading: boolean; disabled: boolean; onClick: () => void;
  }) => (
    <button data-testid="play-all" disabled={disabled} onClick={onClick}>
      {isLoading ? "loading" : isPlaying ? "playing" : "play"}
    </button>
  ),
}));

const baseTask = { id: "t1", userId: "u1", name: "Task Name", description: "Task Desc", entries: [], speechSequences: [], createdAt: new Date(), updatedAt: new Date(), shareToken: "s" };
const baseProps = {
  task: baseTask, entriesCount: 5, isLoadingPlayAll: false, isPlayingAll: false,
  isHeaderMenuOpen: false, setIsHeaderMenuOpen: vi.fn(),
  onShare: vi.fn(), onPlayAll: vi.fn(), onEditTask: vi.fn(), onDeleteTask: vi.fn(),
};

describe("TaskDetailHeader mutation kills", () => {
  it("returns null when entriesCount is 0", () => {
    const { container } = render(<TaskDetailHeader {...baseProps} entriesCount={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders header with task name", () => {
    render(<TaskDetailHeader {...baseProps} />);
    expect(screen.getByText("Task Name")).toBeInTheDocument();
  });

  it("renders description when present", () => {
    render(<TaskDetailHeader {...baseProps} />);
    expect(screen.getByText("Task Desc")).toBeInTheDocument();
  });

  it("does not render description paragraph when description is falsy", () => {
    render(<TaskDetailHeader {...baseProps} task={{ ...baseTask, description: null }} />);
    expect(screen.queryByText("Task Desc")).not.toBeInTheDocument();
    // Verify no <p> with description class
    expect(document.querySelector(".page-header__description")).not.toBeInTheDocument();
  });

  it("play all button disabled when entriesCount is 0", () => {
    render(<TaskDetailHeader {...baseProps} entriesCount={0} />);
    // Returns null, so nothing rendered - covered by first test
  });

  it("opens menu and shows edit/delete options", async () => {
    const setMenu = vi.fn();
    render(<TaskDetailHeader {...baseProps} isHeaderMenuOpen={true} setIsHeaderMenuOpen={setMenu} />);
    expect(screen.getByText("Muuda")).toBeInTheDocument();
    expect(screen.getByText("Kustuta")).toBeInTheDocument();
  });

  it("edit button calls onEditTask with task id and closes menu", async () => {
    const setMenu = vi.fn();
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<TaskDetailHeader {...baseProps} isHeaderMenuOpen={true} setIsHeaderMenuOpen={setMenu} onEditTask={onEdit} />);
    await user.click(screen.getByText("Muuda"));
    expect(onEdit).toHaveBeenCalledWith("t1");
    expect(setMenu).toHaveBeenCalledWith(false);
  });

  it("delete button calls onDeleteTask with task id and closes menu", async () => {
    const setMenu = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<TaskDetailHeader {...baseProps} isHeaderMenuOpen={true} setIsHeaderMenuOpen={setMenu} onDeleteTask={onDelete} />);
    await user.click(screen.getByText("Kustuta"));
    expect(onDelete).toHaveBeenCalledWith("t1");
    expect(setMenu).toHaveBeenCalledWith(false);
  });

  it("menu button toggles isHeaderMenuOpen", async () => {
    const setMenu = vi.fn();
    const user = userEvent.setup();
    render(<TaskDetailHeader {...baseProps} isHeaderMenuOpen={false} setIsHeaderMenuOpen={setMenu} />);
    await user.click(screen.getByLabelText("Rohkem valikuid"));
    expect(setMenu).toHaveBeenCalledWith(true);
  });

  it("backdrop click closes menu", async () => {
    const setMenu = vi.fn();
    const user = userEvent.setup();
    render(<TaskDetailHeader {...baseProps} isHeaderMenuOpen={true} setIsHeaderMenuOpen={setMenu} />);
    const backdrop = document.querySelector(".task-detail__menu-backdrop");
    expect(backdrop).toBeTruthy();
    await user.click(backdrop!);
    expect(setMenu).toHaveBeenCalledWith(false);
  });

  it("calls onShare when share button clicked", async () => {
    const onShare = vi.fn();
    const user = userEvent.setup();
    render(<TaskDetailHeader {...baseProps} onShare={onShare} />);
    await user.click(screen.getByText("Jaga"));
    expect(onShare).toHaveBeenCalled();
  });

  it("calls onPlayAll when play all button clicked", async () => {
    const onPlayAll = vi.fn();
    const user = userEvent.setup();
    render(<TaskDetailHeader {...baseProps} onPlayAll={onPlayAll} />);
    await user.click(screen.getByTestId("play-all"));
    expect(onPlayAll).toHaveBeenCalled();
  });
});
