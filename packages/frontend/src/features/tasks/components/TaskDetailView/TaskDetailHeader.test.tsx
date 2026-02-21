// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetailHeader } from "./TaskDetailHeader";

const mockTask = {
  id: "task-1",
  name: "Test Task",
  description: "Test description",
  userId: "user-1",
  entries: [],
  speechSequences: [],
  shareToken: "share-token-123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const defaultProps = {
  task: mockTask,
  entriesCount: 5,
  isLoadingPlayAll: false,
  isPlayingAll: false,
  isHeaderMenuOpen: false,
  setIsHeaderMenuOpen: vi.fn(),
  onShare: vi.fn(),
  onPlayAll: vi.fn(),
  onDownloadZip: vi.fn(),
  isDownloading: false,
  onEditTask: vi.fn(),
  onDeleteTask: vi.fn(),
  onCopyToSynthesis: vi.fn(),
};

describe("TaskDetailHeader rendering", () => {
  it("returns null when entriesCount is 0", () => {
    const { container } = render(
      <TaskDetailHeader {...defaultProps} entriesCount={0} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders task name and description", () => {
    render(<TaskDetailHeader {...defaultProps} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders without description when null", () => {
    render(
      <TaskDetailHeader
        {...defaultProps}
        task={{ ...mockTask, description: null }}
      />,
    );
    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });
});

describe("TaskDetailHeader actions", () => {
  it("calls onShare when clicked", async () => {
    const onShare = vi.fn();
    render(<TaskDetailHeader {...defaultProps} onShare={onShare} />);
    await userEvent.click(screen.getByText("Jaga"));
    expect(onShare).toHaveBeenCalled();
  });

  it("calls onPlayAll when clicked", async () => {
    const onPlayAll = vi.fn();
    render(<TaskDetailHeader {...defaultProps} onPlayAll={onPlayAll} />);
    await userEvent.click(screen.getByText("Mängi kõik"));
    expect(onPlayAll).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    render(<TaskDetailHeader {...defaultProps} isLoadingPlayAll={true} />);
    expect(screen.getByText("Laadimine")).toBeInTheDocument();
  });

  it("shows pause state", () => {
    render(<TaskDetailHeader {...defaultProps} isPlayingAll={true} />);
    expect(screen.getByText("Peata")).toBeInTheDocument();
  });
});

describe("TaskDetailHeader download", () => {
  it("calls onDownloadZip when clicked", async () => {
    const onDownloadZip = vi.fn();
    const setMenu = vi.fn();
    render(<TaskDetailHeader {...defaultProps} onDownloadZip={onDownloadZip} isHeaderMenuOpen={true} setIsHeaderMenuOpen={setMenu} />);
    await userEvent.click(screen.getByText(/Lae alla/));
    expect(onDownloadZip).toHaveBeenCalled();
  });

  it("shows loading text when downloading", async () => {
    render(<TaskDetailHeader {...defaultProps} isHeaderMenuOpen={true} isDownloading={true} />);
    expect(screen.getByText("Laadin...")).toBeInTheDocument();
  });

  it("disables button when downloading", () => {
    render(<TaskDetailHeader {...defaultProps} isHeaderMenuOpen={true} isDownloading={true} />);
    const btn = screen.getByText("Laadin...").closest("button");
    expect(btn).toBeDisabled();
  });
});

describe("TaskDetailHeader menu open", () => {
  it("opens menu on click", async () => {
    const setMenu = vi.fn();
    render(
      <TaskDetailHeader {...defaultProps} setIsHeaderMenuOpen={setMenu} />,
    );
    await userEvent.click(screen.getByLabelText("Rohkem valikuid"));
    expect(setMenu).toHaveBeenCalledWith(true);
  });

  it("shows menu items when open", () => {
    render(<TaskDetailHeader {...defaultProps} isHeaderMenuOpen={true} />);
    expect(screen.getByText(/Muuda ülesande kirjeldust/)).toBeInTheDocument();
  });
});

describe("TaskDetailHeader menu actions", () => {
  it("handles edit click", async () => {
    const onEdit = vi.fn();
    render(
      <TaskDetailHeader
        {...defaultProps}
        isHeaderMenuOpen={true}
        onEditTask={onEdit}
      />,
    );
    await userEvent.click(screen.getByText(/Muuda ülesande kirjeldust/));
    expect(onEdit).toHaveBeenCalledWith("task-1");
  });

  it("handles delete click", async () => {
    const onDelete = vi.fn();
    render(
      <TaskDetailHeader
        {...defaultProps}
        isHeaderMenuOpen={true}
        onDeleteTask={onDelete}
      />,
    );
    await userEvent.click(screen.getByText(/Kustuta ülesanne/));
    expect(onDelete).toHaveBeenCalledWith("task-1");
  });

  it("closes on backdrop click", async () => {
    const setMenu = vi.fn();
    render(
      <TaskDetailHeader
        {...defaultProps}
        isHeaderMenuOpen={true}
        setIsHeaderMenuOpen={setMenu}
      />,
    );
    const bd = document.querySelector(".task-detail__menu-backdrop");
    if (bd) await userEvent.click(bd);
    expect(setMenu).toHaveBeenCalledWith(false);
  });

  it("closes on Escape keydown on backdrop", async () => {
    const setMenu = vi.fn();
    render(
      <TaskDetailHeader
        {...defaultProps}
        isHeaderMenuOpen={true}
        setIsHeaderMenuOpen={setMenu}
      />,
    );
    const bd = document.querySelector(".task-detail__menu-backdrop");
    if (bd) await userEvent.type(bd as HTMLElement, "{Escape}");
    expect(setMenu).toHaveBeenCalledWith(false);
  });

  it("handles copy to synthesis click", async () => {
    const onCopy = vi.fn();
    const setMenu = vi.fn();
    render(
      <TaskDetailHeader
        {...defaultProps}
        isHeaderMenuOpen={true}
        onCopyToSynthesis={onCopy}
        setIsHeaderMenuOpen={setMenu}
      />,
    );
    await userEvent.click(screen.getByText("Muuda ülesande lauseid"));
    expect(onCopy).toHaveBeenCalled();
    expect(setMenu).toHaveBeenCalledWith(false);
  });
});
