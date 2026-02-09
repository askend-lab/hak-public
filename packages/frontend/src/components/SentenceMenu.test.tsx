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

describe("SentenceMenu unauthenticated", () => {
  it("shows login button when not authenticated", () => {
    render(<SentenceMenu {...defaultProps} />);
    expect(screen.getByText("Lisa ülesandesse")).toBeInTheDocument();
  });

  it("calls onLogin on click", async () => {
    const onLogin = vi.fn(),
      onClose = vi.fn();
    render(
      <SentenceMenu {...defaultProps} onLogin={onLogin} onClose={onClose} />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    expect(onLogin).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

describe("SentenceMenu authenticated", () => {
  const tasks = [
    { id: "t1", name: "Task 1" },
    { id: "t2", name: "Task 2" },
  ];

  it("shows search and tasks when authenticated", () => {
    render(
      <SentenceMenu {...defaultProps} isAuthenticated={true} tasks={tasks} />,
    );
    expect(screen.getByPlaceholderText("Otsi")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("filters tasks by search query", () => {
    render(
      <SentenceMenu
        {...defaultProps}
        isAuthenticated={true}
        tasks={tasks}
        menuSearchQuery="Task 1"
      />,
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <SentenceMenu
        {...defaultProps}
        isAuthenticated={true}
        isLoadingTasks={true}
      />,
    );
    expect(screen.getByText("Laen...")).toBeInTheDocument();
  });

  it("calls onAddToTask when task clicked", async () => {
    const onAddToTask = vi.fn(),
      onClose = vi.fn();
    render(
      <SentenceMenu
        {...defaultProps}
        isAuthenticated={true}
        tasks={tasks}
        onAddToTask={onAddToTask}
        onClose={onClose}
      />,
    );
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
    await userEvent.click(screen.getByText("Loo uus ülesanne"));
    expect(onCreateNewTask).toHaveBeenCalledWith("s1");
  });
});

describe("SentenceMenu actions", () => {
  it("calls onExplorePhonetic", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onExplorePhonetic={fn} />);
    await userEvent.click(screen.getByText("Uuri häälduskuju"));
    expect(fn).toHaveBeenCalledWith("s1");
  });

  it("calls onDownload", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onDownload={fn} />);
    await userEvent.click(screen.getByText("Lae alla .wav fail"));
    expect(fn).toHaveBeenCalledWith("s1");
  });

  it("calls onCopyText", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onCopyText={fn} />);
    await userEvent.click(screen.getByText("Kopeeri tekst"));
    expect(fn).toHaveBeenCalledWith("s1");
  });

  it("calls onRemove", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onRemove={fn} />);
    await userEvent.click(screen.getByText("Eemalda"));
    expect(fn).toHaveBeenCalledWith("s1");
  });

  it("closes on backdrop", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onClose={fn} />);
    const bd = document.querySelector(".synthesis__menu-backdrop");
    if (bd) await userEvent.click(bd);
    expect(fn).toHaveBeenCalled();
  });
});

describe("SentenceMenu disabled state", () => {
  it("disables when no text", () => {
    render(<SentenceMenu {...defaultProps} sentenceText="" />);
    expect(
      screen.getByText("Lisa ülesandesse").closest("button"),
    ).toBeDisabled();
  });
});

describe("SentenceMenu keyboard and positioning", () => {
  it("closes on Escape key", async () => {
    const { fireEvent } = await import("@testing-library/react");
    const onClose = vi.fn();
    render(<SentenceMenu {...defaultProps} onClose={onClose} />);
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("uses fixed positioning when anchorEl provided", () => {
    const anchorEl = document.createElement("button");
    anchorEl.getBoundingClientRect = vi.fn().mockReturnValue({
      bottom: 100,
      right: 300,
      top: 80,
      left: 50,
      width: 40,
      height: 20,
    });
    document.body.appendChild(anchorEl);
    render(<SentenceMenu {...defaultProps} anchorEl={anchorEl} />);
    const menu = screen.getByRole("menu");
    expect(menu.className).toContain("synthesis__dropdown-menu--fixed");
    document.body.removeChild(anchorEl);
  });

  it("stops propagation on search input click", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(
      <SentenceMenu
        {...defaultProps}
        isAuthenticated={true}
        tasks={[{ id: "t1", name: "T1" }]}
      />,
    );
    const input = screen.getByPlaceholderText("Otsi");
    const event = new MouseEvent("click", { bubbles: true });
    const stopProp = vi.spyOn(event, "stopPropagation");
    fireEvent(input, event);
    expect(stopProp).toHaveBeenCalled();
  });
});
