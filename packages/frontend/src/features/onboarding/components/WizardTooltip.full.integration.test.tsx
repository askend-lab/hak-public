// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import WizardTooltip from "./WizardTooltip";
import type { WizardStep } from "@/types/onboarding";

describe("WizardTooltip", () => {
  const mockStep: WizardStep = {
    id: "step-1",
    targetSelector: ".target-element",
    title: "Step Title",
    description: "Step description text",
    position: "bottom",
  };

  const defaultProps = {
    step: mockStep,
    currentIndex: 0,
    totalSteps: 3,
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onSkip: vi.fn(),
    isFirst: true,
    isLast: false,
  };

  let targetElement: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create target element
    targetElement = document.createElement("div");
    targetElement.className = "target-element";
    targetElement.style.width = "100px";
    targetElement.style.height = "50px";
    targetElement.style.position = "absolute";
    targetElement.style.top = "100px";
    targetElement.style.left = "200px";
    document.body.appendChild(targetElement);

    // Mock getBoundingClientRect
    targetElement.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 200,
      bottom: 150,
      right: 300,
      width: 100,
      height: 50,
      x: 200,
      y: 100,
      toJSON: () => {},
    }));

    // Mock scrollIntoView
    targetElement.scrollIntoView = vi.fn();

    // Mock requestAnimationFrame
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    document.body.removeChild(targetElement);
    vi.restoreAllMocks();
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("positioning", () => {
    it("applies bottom position class", () => {
      const { container } = render(<WizardTooltip {...defaultProps} />);
      expect(
        container.querySelector(".wizard__tooltip--arrow-top"),
      ).toBeInTheDocument();
    });

    it("applies top position class", () => {
      const { container } = render(
        <WizardTooltip
          {...defaultProps}
          step={{ ...mockStep, position: "top" }}
        />,
      );
      expect(
        container.querySelector(".wizard__tooltip--arrow-bottom"),
      ).toBeInTheDocument();
    });

    it("applies left position class", () => {
      const { container } = render(
        <WizardTooltip
          {...defaultProps}
          step={{ ...mockStep, position: "left" }}
        />,
      );
      expect(
        container.querySelector(".wizard__tooltip--arrow-right"),
      ).toBeInTheDocument();
    });

    it("applies right position class", () => {
      const { container } = render(
        <WizardTooltip
          {...defaultProps}
          step={{ ...mockStep, position: "right" }}
        />,
      );
      expect(
        container.querySelector(".wizard__tooltip--arrow-left"),
      ).toBeInTheDocument();
    });
  });

  describe("target element highlighting", () => {
    it("adds highlight class to target element", () => {
      render(<WizardTooltip {...defaultProps} />);
      expect(targetElement.classList.contains("wizard__highlight")).toBe(true);
    });

    it("removes highlight class on unmount", () => {
      const { unmount } = render(<WizardTooltip {...defaultProps} />);
      unmount();
      expect(targetElement.classList.contains("wizard__highlight")).toBe(false);
    });

    it("scrolls target into view", () => {
      render(<WizardTooltip {...defaultProps} />);
      expect(targetElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });
  });

  });

  });

  });

  });

  });

});
