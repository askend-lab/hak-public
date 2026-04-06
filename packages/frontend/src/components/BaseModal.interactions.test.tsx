// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BaseModal from "./BaseModal";

describe("BaseModal", () => {
  it("title element linked via aria-labelledby with correct class", () => {
    render(<BaseModal isOpen={true} onClose={vi.fn()} title="My Title"><p>Content</p></BaseModal>);
    const labelledBy = screen.getByRole("dialog").getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl?.className).toContain("base-modal__title");
    expect(titleEl?.textContent).toBe("My Title");
  });

  it("header visibility depends on title and showCloseButton", () => {
    const { container, rerender } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} title={null} showCloseButton={false}><p>C</p></BaseModal>,
    );
    expect(container.querySelector(".base-modal__header")).toBeNull();
    rerender(<BaseModal isOpen={true} onClose={vi.fn()} title={null} showCloseButton={true}><p>C</p></BaseModal>);
    expect(container.querySelector(".base-modal__header")).toBeTruthy();
    expect(container.querySelector(".base-modal__title")).toBeNull();
  });

  it("content div has base-modal__content class", () => {
    const { container } = render(
      <BaseModal isOpen={true} onClose={vi.fn()}><p>Content</p></BaseModal>,
    );
    expect(container.querySelector(".base-modal__content")).toBeTruthy();
  });

});
