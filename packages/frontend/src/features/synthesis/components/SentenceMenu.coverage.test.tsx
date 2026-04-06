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

describe("SentenceMenu structure and classes", () => {
  it("menu has role=menu and aria-label", () => {
    render(<SentenceMenu {...defaultProps} />);
    const menu = screen.getByRole("menu");
    expect(menu.getAttribute("aria-label")).toBe("Lausungi valikud");
  });

  it("backdrop has aria-hidden=true", () => {
    const { container } = render(<SentenceMenu {...defaultProps} />);
    const bd = container.querySelector(".synthesis__menu-backdrop");
    expect(bd?.getAttribute("aria-hidden")).toBe("true");
  });

  it("remove button has danger class", () => {
    const { container } = render(<SentenceMenu {...defaultProps} />);
    const danger = container.querySelector(".synthesis__menu-item--danger");
    expect(danger).toBeTruthy();
    expect(danger?.textContent).toContain("Eemalda");
  });

  it("authenticated menu shows divider", () => {
    const { container } = render(<SentenceMenu {...defaultProps} isAuthenticated={true} />);
    const divider = container.querySelector('[role="separator"]');
    expect(divider).toBeTruthy();
    expect(divider?.className).toContain("synthesis__menu-divider");
  });

  it("loading state has aria-busy=true", async () => {
    const { container } = render(
      <SentenceMenu {...defaultProps} isAuthenticated={true} isLoadingTasks={true} />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    const loading = container.querySelector('[aria-busy="true"]');
    expect(loading).toBeTruthy();
  });

  it("task list has role=group and aria-label", async () => {
    const { container } = render(
      <SentenceMenu {...defaultProps} isAuthenticated={true} />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute("aria-label")).toBe("Ülesanded");
  });

  it("search input has visually-hidden label", async () => {
    render(<SentenceMenu {...defaultProps} isAuthenticated={true} />);
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    expect(screen.getByLabelText("Otsi ülesandeid")).toBeInTheDocument();
  });

  it("create button icon has aria-hidden=true", async () => {
    const { container } = render(<SentenceMenu {...defaultProps} isAuthenticated={true} />);
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    const icon = container.querySelector(".synthesis__menu-item-create-icon");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("menu items have role=menuitem", () => {
    render(<SentenceMenu {...defaultProps} />);
    const items = screen.getAllByRole("menuitem");
    expect(items.length).toBeGreaterThan(0);
  });

  it("onClose called when task is added", async () => {
    const onClose = vi.fn();
    const tasks = [{ id: "t1", name: "T1" }];
    render(<SentenceMenu {...defaultProps} isAuthenticated={true} tasks={tasks} onClose={onClose} />);
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    await userEvent.click(screen.getByText("T1"));
    expect(onClose).toHaveBeenCalled();
  });

  it("onClose called when create new task clicked", async () => {
    const onClose = vi.fn();
    render(<SentenceMenu {...defaultProps} isAuthenticated={true} onClose={onClose} />);
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    await userEvent.click(screen.getByText("Loo uus ülesanne"));
    expect(onClose).toHaveBeenCalled();
  });

  it("search input click stops propagation", async () => {
    render(<SentenceMenu {...defaultProps} isAuthenticated={true} />);
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    const searchInput = screen.getByPlaceholderText("Otsi");
    const { fireEvent } = await import("@testing-library/react");
    const event = new MouseEvent("click", { bubbles: true });
    const stopSpy = vi.spyOn(event, "stopPropagation");
    fireEvent(searchInput, event);
    expect(stopSpy).toHaveBeenCalled();
  });

  it("Escape in tasks panel goes back to main", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <SentenceMenu {...defaultProps} isAuthenticated={true} onClose={onClose} />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    const { fireEvent } = await import("@testing-library/react");
    const menuEl = container.querySelector(".synthesis__dropdown-menu");
    if (menuEl) {fireEvent.keyDown(menuEl, { key: "Escape" });}
    expect(screen.getByText("Uuri häälduskuju")).toBeInTheDocument();
  });

  it("Escape in main panel calls onClose", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <SentenceMenu {...defaultProps} isAuthenticated={true} onClose={onClose} />,
    );
    const { fireEvent } = await import("@testing-library/react");
    const menuEl = container.querySelector(".synthesis__dropdown-menu");
    if (menuEl) {fireEvent.keyDown(menuEl, { key: "Escape" });}
    expect(onClose).toHaveBeenCalled();
  });

});
