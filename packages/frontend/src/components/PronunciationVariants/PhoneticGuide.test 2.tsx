// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PhoneticGuide from "./PhoneticGuide";

vi.mock("../ui/Icons", () => ({
  CloseIcon: () => <span data-testid="close-icon">✕</span>,
  BackIcon: () => <span data-testid="back-icon">←</span>,
}));

describe("PhoneticGuide", () => {
  const defaultProps = {
    onBack: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders guide title", () => {
    render(<PhoneticGuide {...defaultProps} />);
    expect(screen.getByText("Hääldusmärkide juhend")).toBeInTheDocument();
  });

  it("renders guide intro text", () => {
    render(<PhoneticGuide {...defaultProps} />);
    expect(screen.getByText(/Hääldusmärgid aitavad/)).toBeInTheDocument();
  });

  it("calls onBack when back button clicked", () => {
    const onBack = vi.fn();
    render(<PhoneticGuide {...defaultProps} onBack={onBack} />);
    fireEvent.click(screen.getByLabelText("Tagasi variantide juurde"));
    expect(onBack).toHaveBeenCalled();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<PhoneticGuide {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("back button has correct class", () => {
    const { container } = render(<PhoneticGuide {...defaultProps} />);
    expect(container.querySelector(".pronunciation-variants__back-button--icon-only")).toBeTruthy();
  });

  it("close button has correct class", () => {
    const { container } = render(<PhoneticGuide {...defaultProps} />);
    expect(container.querySelector(".pronunciation-variants__close")).toBeTruthy();
  });

  it("renders marker items", () => {
    const { container } = render(<PhoneticGuide {...defaultProps} />);
    const markerItems = container.querySelectorAll(".pronunciation-variants__marker-item");
    expect(markerItems.length).toBeGreaterThan(0);
  });

  it("marker items have symbol, name, rule, and examples", () => {
    const { container } = render(<PhoneticGuide {...defaultProps} />);
    expect(container.querySelector(".pronunciation-variants__marker-symbol")).toBeTruthy();
    expect(container.querySelector(".pronunciation-variants__marker-name")).toBeTruthy();
    expect(container.querySelector(".pronunciation-variants__marker-rule")).toBeTruthy();
    expect(container.querySelector(".pronunciation-variants__marker-examples")).toBeTruthy();
  });

  it("has correct root class", () => {
    const { container } = render(<PhoneticGuide {...defaultProps} />);
    expect(container.querySelector(".pronunciation-variants__guide-view")).toBeTruthy();
    expect(container.querySelector(".pronunciation-variants__guide-view-header")).toBeTruthy();
    expect(container.querySelector(".pronunciation-variants__guide-view-content")).toBeTruthy();
  });

  it("buttons have type=button", () => {
    render(<PhoneticGuide {...defaultProps} />);
    const backBtn = screen.getByLabelText("Tagasi variantide juurde");
    const closeBtn = screen.getByLabelText("Close");
    expect(backBtn.getAttribute("type")).toBe("button");
    expect(closeBtn.getAttribute("type")).toBe("button");
  });
});
