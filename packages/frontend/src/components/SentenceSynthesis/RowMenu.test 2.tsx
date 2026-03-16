// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RowMenu } from "./RowMenu";

vi.mock("../ui/Icons", () => ({
  MoreIcon: (): React.ReactElement => <span data-testid="more-icon">⋮</span>,
}));

describe("RowMenu", () => {
  const baseProps = {
    id: "s1",
    isOpen: false,
    items: [
      { label: "Edit", onClick: vi.fn() },
      {
        label: "Delete",
        onClick: vi.fn(),
        danger: true,
        icon: <span>🗑</span>,
      },
    ],
    onOpen: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders menu button", () => {
    render(<RowMenu {...baseProps} />);
    expect(
      screen.getByRole("button", { name: "Rohkem valikuid" }),
    ).toBeInTheDocument();
  });

  it("opens menu on button click", () => {
    const onOpen = vi.fn();
    render(<RowMenu {...baseProps} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Rohkem valikuid" }));
    expect(onOpen).toHaveBeenCalledWith("s1");
  });

  it("renders dropdown when open", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls item onClick and onClose when item clicked", () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    const items = [{ label: "Action", onClick }];
    render(
      <RowMenu {...baseProps} isOpen={true} items={items} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText("Action"));
    expect(onClick).toHaveBeenCalledWith("s1");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on backdrop click", () => {
    const onClose = vi.fn();
    const { container } = render(
      <RowMenu {...baseProps} isOpen={true} onClose={onClose} />,
    );
    const backdrop = container.querySelector(
      ".sentence-synthesis-item__menu-backdrop",
    );
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<RowMenu {...baseProps} isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders icon when provided", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    expect(screen.getByText("🗑")).toBeInTheDocument();
  });

  it("renders danger class for danger items", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    const deleteBtn = screen.getByText("Delete").closest("button");
    expect(deleteBtn?.className).toContain("danger");
  });

  it("non-danger items don't have danger class", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    const editBtn = screen.getByText("Edit").closest("button");
    expect(editBtn?.className).not.toContain("danger");
  });

  it("menu button has aria-haspopup=menu", () => {
    render(<RowMenu {...baseProps} />);
    const btn = screen.getByLabelText("Rohkem valikuid");
    expect(btn.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("menu button has aria-expanded matching isOpen", () => {
    const { rerender } = render(<RowMenu {...baseProps} isOpen={false} />);
    expect(screen.getByLabelText("Rohkem valikuid").getAttribute("aria-expanded")).toBe("false");
    rerender(<RowMenu {...baseProps} isOpen={true} />);
    expect(screen.getByLabelText("Rohkem valikuid").getAttribute("aria-expanded")).toBe("true");
  });

  it("dropdown menu has aria-label", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    expect(screen.getByRole("menu").getAttribute("aria-label")).toBe("Lausungi valikud");
  });

  it("backdrop has aria-hidden=true", () => {
    const { container } = render(<RowMenu {...baseProps} isOpen={true} />);
    const bd = container.querySelector(".sentence-synthesis-item__menu-backdrop");
    expect(bd?.getAttribute("aria-hidden")).toBe("true");
  });

  it("menu items have role=menuitem", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    const items = screen.getAllByRole("menuitem");
    expect(items.length).toBe(2);
  });

  it("icon span has aria-hidden=true", () => {
    const { container } = render(<RowMenu {...baseProps} isOpen={true} />);
    const iconSpan = container.querySelector(".sentence-synthesis-item__menu-item-icon");
    expect(iconSpan?.getAttribute("aria-hidden")).toBe("true");
  });

  it("sets data-onboarding-target when provided", () => {
    render(<RowMenu {...baseProps} data-onboarding-target="row-menu" />);
    const btn = screen.getByLabelText("Rohkem valikuid");
    expect(btn.getAttribute("data-onboarding-target")).toBe("row-menu");
  });

  it("dropdown has fixed class", () => {
    const { container } = render(<RowMenu {...baseProps} isOpen={true} />);
    expect(container.querySelector(".sentence-synthesis-item__dropdown-menu--fixed")).toBeTruthy();
  });

  it("does not render dropdown when closed", () => {
    render(<RowMenu {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("menu button has correct class", () => {
    const { container } = render(<RowMenu {...baseProps} />);
    expect(container.querySelector(".sentence-synthesis-item__menu-button")).toBeTruthy();
  });

  it("menu item content has correct class", () => {
    const { container } = render(<RowMenu {...baseProps} isOpen={true} />);
    const contents = container.querySelectorAll(".sentence-synthesis-item__menu-item-content");
    expect(contents.length).toBe(2);
  });
});
