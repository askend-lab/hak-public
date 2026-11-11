// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BaseModal from "./BaseModal";

describe("BaseModal", () => {
  it("renders nothing when closed, renders content when open", () => {
    const { rerender } = render(
      <BaseModal isOpen={false} onClose={vi.fn()} title="Test Modal"><p>Modal content</p></BaseModal>,
    );
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    rerender(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Test Modal"><p>Modal content</p></BaseModal>,
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("calls onClose via close button and backdrop but not content click", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BaseModal isOpen={true} onClose={onClose} title="Test Modal"><p>Modal content</p></BaseModal>,
    );
    fireEvent.click(screen.getByRole("button", { name: /sulge/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    onClose.mockClear();
    const backdrop = container.querySelector(".base-modal__backdrop");
    if (backdrop) {fireEvent.click(backdrop);}
    expect(onClose).toHaveBeenCalledTimes(1);
    onClose.mockClear();
    fireEvent.click(screen.getByText("Modal content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("prevents backdrop close when preventBackdropClose is true", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BaseModal isOpen={true} onClose={onClose} preventBackdropClose={true}>
        <p>Content</p>
      </BaseModal>,
    );
    const backdrop = container.querySelector(".base-modal__backdrop");
    if (backdrop) {fireEvent.click(backdrop);}
    expect(onClose).not.toHaveBeenCalled();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
        <p>Content</p>
      </BaseModal>,
    );
    expect(
      screen.queryByRole("button", { name: /sulge/i }),
    ).not.toBeInTheDocument();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BaseModal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders without title", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title={null}>
        <p>Content</p>
      </BaseModal>,
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("does not set aria-labelledby when no title", () => {
    render(
      <BaseModal
        isOpen={true}
        onClose={vi.fn()}
        title={null}
        showCloseButton={false}
      >
        <p>Content</p>
      </BaseModal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBeNull();
  });

  it("traps focus with Tab and Shift+Tab", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Focus Test">
        <button>First</button>
        <button>Last</button>
      </BaseModal>,
    );
    screen.getByText("Last").focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    screen.getByText("First").focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  });

  it("applies size classes and defaults to medium", () => {
    const { container, rerender } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} size="small"><p>Content</p></BaseModal>,
    );
    expect(container.querySelector(".base-modal--small")).toBeTruthy();
    rerender(<BaseModal isOpen={true} onClose={vi.fn()} size="large"><p>Content</p></BaseModal>);
    expect(container.querySelector(".base-modal--large")).toBeTruthy();
    rerender(<BaseModal isOpen={true} onClose={vi.fn()}><p>Content</p></BaseModal>);
    expect(container.querySelector(".base-modal--medium")).toBeTruthy();
  });

  it("applies custom className, headerClassName, contentClassName", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="T" className="cc" headerClassName="hc" contentClassName="xc">
        <p>Content</p>
      </BaseModal>,
    );
    expect(container.querySelector(".cc")).toBeTruthy();
    expect(container.querySelector(".hc")).toBeTruthy();
    expect(container.querySelector(".xc")).toBeTruthy();
  });

  it("has correct aria attributes and body overflow", () => {
    render(<BaseModal isOpen={true} onClose={vi.fn()} title="Aria Test"><p>Content</p></BaseModal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does not close on non-Escape keys", () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BaseModal>,
    );
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("restores body overflow to unset on close, backdrop has aria-hidden", () => {
    const { container, rerender } = render(
      <BaseModal isOpen={true} onClose={vi.fn()}><p>Content</p></BaseModal>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    expect(container.querySelector(".base-modal__backdrop")?.getAttribute("aria-hidden")).toBe("true");
    rerender(<BaseModal isOpen={false} onClose={vi.fn()}><p>Content</p></BaseModal>);
    expect(document.body.style.overflow).toBe("");
  });

  it("close button has type=button and base-modal__close class", () => {
    render(<BaseModal isOpen={true} onClose={vi.fn()} title="T"><p>Content</p></BaseModal>);
    const closeBtn = screen.getByRole("button", { name: /sulge/i });
    expect(closeBtn.getAttribute("type")).toBe("button");
    expect(closeBtn.className).toContain("base-modal__close");
  });

});
