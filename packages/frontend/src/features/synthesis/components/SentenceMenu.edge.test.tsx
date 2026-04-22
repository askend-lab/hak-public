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
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    const input = screen.getByPlaceholderText("Otsi");
    const event = new MouseEvent("click", { bubbles: true });
    const stopProp = vi.spyOn(event, "stopPropagation");
    fireEvent(input, event);
    expect(stopProp).toHaveBeenCalled();
  });

});
