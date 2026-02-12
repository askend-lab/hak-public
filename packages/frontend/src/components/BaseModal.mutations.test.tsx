// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BaseModal from "./BaseModal";

/**
 * Mutation-killing tests for BaseModal
 * Targets: focus trap logic, className defaults, onCloseRef, cleanup
 */
describe("BaseModal mutation kills", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { cb(0); return 1; });
  });

  it("default className is empty string (not mutated)", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()}>
        <p>C</p>
      </BaseModal>,
    );
    const modal = container.querySelector("[role='dialog']");
    // Should be "base-modal base-modal--medium" (no trailing space from empty className)
    expect(modal?.className).toBe("base-modal base-modal--medium");
  });

  it("default headerClassName is empty string", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="T">
        <p>C</p>
      </BaseModal>,
    );
    const header = container.querySelector(".base-modal__header");
    expect(header?.className).toBe("base-modal__header");
  });

  it("default contentClassName is empty string", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()}>
        <p>C</p>
      </BaseModal>,
    );
    const content = container.querySelector(".base-modal__content");
    expect(content?.className).toBe("base-modal__content");
  });

  it("onCloseRef is updated when onClose changes", () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();
    const { rerender } = render(
      <BaseModal isOpen={true} onClose={onClose1}>
        <p>C</p>
      </BaseModal>,
    );
    // Update onClose
    rerender(
      <BaseModal isOpen={true} onClose={onClose2}>
        <p>C</p>
      </BaseModal>,
    );
    // Escape should call the updated onClose2
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose2).toHaveBeenCalled();
    expect(onClose1).not.toHaveBeenCalled();
  });

  it("Tab key does nothing when key is not Tab", () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose} title="T">
        <button>First</button>
        <button>Last</button>
      </BaseModal>,
    );
    // Non-Tab key should not trigger focus trap
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("focus trap wraps from last to first on Tab", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="T">
        <button>First</button>
        <button>Last</button>
      </BaseModal>,
    );
    const lastBtn = screen.getByText("Last");
    lastBtn.focus();
    expect(document.activeElement).toBe(lastBtn);
    // Tab from last element should wrap to first
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    // The close button is the first focusable element in the modal
    const closeBtn = screen.getByRole("button", { name: /sulge/i });
    expect(document.activeElement).toBe(closeBtn);
  });

  it("focus trap wraps from first to last on Shift+Tab", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="T">
        <button>First</button>
        <button>Last</button>
      </BaseModal>,
    );
    // Close button is actually the first focusable element
    const closeBtn = screen.getByRole("button", { name: /sulge/i });
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    const lastBtn = screen.getByText("Last");
    expect(document.activeElement).toBe(lastBtn);
  });

  it("focus trap handles zero focusable elements", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title={null} showCloseButton={false}>
        <p>No focusable elements</p>
      </BaseModal>,
    );
    // Tab should not crash
    fireEvent.keyDown(document, { key: "Tab" });
  });

  it("stores and restores previous focus on open/close", () => {
    const externalBtn = document.createElement("button");
    externalBtn.textContent = "External";
    document.body.appendChild(externalBtn);
    externalBtn.focus();
    expect(document.activeElement).toBe(externalBtn);

    const { unmount } = render(
      <BaseModal isOpen={true} onClose={vi.fn()}>
        <p>C</p>
      </BaseModal>,
    );
    unmount();
    expect(document.activeElement).toBe(externalBtn);
    document.body.removeChild(externalBtn);
  });

  it("removes keydown listeners on cleanup", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(
      <BaseModal isOpen={true} onClose={vi.fn()}>
        <p>C</p>
      </BaseModal>,
    );
    unmount();
    const keydownCalls = removeSpy.mock.calls.filter(c => c[0] === "keydown");
    expect(keydownCalls.length).toBeGreaterThanOrEqual(2);
  });

  it("handleBackdropClick checks e.target === e.currentTarget", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BaseModal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BaseModal>,
    );
    const backdrop = container.querySelector(".base-modal__backdrop")!;
    // Click directly on backdrop should close
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render header when title is null and showCloseButton is false", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} title={null} showCloseButton={false}>
        <p>C</p>
      </BaseModal>,
    );
    expect(container.querySelector(".base-modal__header")).toBeNull();
  });

  it("renders header when only showCloseButton is true (title null)", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} title={null} showCloseButton={true}>
        <p>C</p>
      </BaseModal>,
    );
    expect(container.querySelector(".base-modal__header")).toBeTruthy();
  });

  it("Shift+Tab on middle does NOT wrap to last (kills L101 || mutant)", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="T">
        <button>First</button>
        <button>Middle</button>
        <button>Last</button>
      </BaseModal>,
    );
    const middleBtn = screen.getByText("Middle");
    middleBtn.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    const lastBtn = screen.getByText("Last");
    expect(document.activeElement).not.toBe(lastBtn);
  });

  it("Tab on middle does NOT wrap to first (kills L104 || mutant)", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="T">
        <button>First</button>
        <button>Middle</button>
        <button>Last</button>
      </BaseModal>,
    );
    const middleBtn = screen.getByText("Middle");
    middleBtn.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    const closeBtn = screen.getByRole("button", { name: /sulge/i });
    expect(document.activeElement).not.toBe(closeBtn);
  });

  it("preventBackdropClose prevents close on backdrop click", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BaseModal isOpen={true} onClose={onClose} preventBackdropClose={true}>
        <p>C</p>
      </BaseModal>,
    );
    fireEvent.click(container.querySelector(".base-modal__backdrop")!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("initial focus moves to first focusable element via rAF", () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="T">
        <button>MyBtn</button>
      </BaseModal>,
    );
    const closeBtn = screen.getByRole("button", { name: /sulge/i });
    expect(document.activeElement).toBe(closeBtn);
  });

  it("header renders when title is provided (kills L152 false)", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Hello">
        <p>C</p>
      </BaseModal>,
    );
    expect(container.querySelector(".base-modal__header")).toBeTruthy();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
