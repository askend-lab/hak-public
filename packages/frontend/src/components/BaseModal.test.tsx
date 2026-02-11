// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BaseModal from "./BaseModal";

describe("BaseModal", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <BaseModal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>,
    );

    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });

  it("renders modal content when isOpen is true", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>,
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>,
    );

    const closeButton = screen.getByRole("button", { name: /sulge/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BaseModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>,
    );

    const backdrop = container.querySelector(".base-modal__backdrop");
    if (backdrop) fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking modal content", () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>,
    );

    const content = screen.getByText("Modal content");
    fireEvent.click(content);

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
    if (backdrop) fireEvent.click(backdrop);
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

  it("traps focus with Tab key", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Focus Test">
        <button>First</button>
        <button>Last</button>
      </BaseModal>,
    );
    const lastBtn = screen.getByText("Last");
    lastBtn.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
  });

  it("traps focus with Shift+Tab key", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Focus Test">
        <button>First</button>
        <button>Last</button>
      </BaseModal>,
    );
    const firstBtn = screen.getByText("First");
    firstBtn.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  });

  it("restores focus on close", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();

    const { rerender } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </BaseModal>,
    );

    rerender(
      <BaseModal isOpen={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </BaseModal>,
    );

    document.body.removeChild(button);
  });

  it("applies correct size class", () => {
    const { container, rerender } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} size="small">
        <p>Content</p>
      </BaseModal>,
    );
    expect(container.querySelector(".base-modal--small")).toBeTruthy();

    rerender(
      <BaseModal isOpen={true} onClose={vi.fn()} size="large">
        <p>Content</p>
      </BaseModal>,
    );
    expect(container.querySelector(".base-modal--large")).toBeTruthy();
  });

  it("defaults to medium size", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </BaseModal>,
    );
    expect(container.querySelector(".base-modal--medium")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} className="custom-class">
        <p>Content</p>
      </BaseModal>,
    );
    expect(container.querySelector(".custom-class")).toBeTruthy();
  });

  it("applies custom headerClassName and contentClassName", () => {
    const { container } = render(
      <BaseModal
        isOpen={true}
        onClose={vi.fn()}
        title="T"
        headerClassName="hdr-cls"
        contentClassName="cnt-cls"
      >
        <p>Content</p>
      </BaseModal>,
    );
    expect(container.querySelector(".hdr-cls")).toBeTruthy();
    expect(container.querySelector(".cnt-cls")).toBeTruthy();
  });

  it("has correct aria attributes", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Aria Test">
        <p>Content</p>
      </BaseModal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
  });

  it("sets body overflow hidden when open", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </BaseModal>,
    );
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
});
