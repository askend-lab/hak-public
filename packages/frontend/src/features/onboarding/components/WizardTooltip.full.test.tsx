// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("rendering", () => {
    it("renders overlay", () => {
      const { container } = render(<WizardTooltip {...defaultProps} />);
      expect(container.querySelector(".wizard__overlay")).toBeInTheDocument();
    });

    it("renders tooltip", () => {
      const { container } = render(<WizardTooltip {...defaultProps} />);
      expect(container.querySelector(".wizard__tooltip")).toBeInTheDocument();
    });

    it("renders step title", () => {
      render(<WizardTooltip {...defaultProps} />);
      expect(screen.getByText("Step Title")).toBeInTheDocument();
    });

    it("renders step description", () => {
      render(<WizardTooltip {...defaultProps} />);
      expect(screen.getByText("Step description text")).toBeInTheDocument();
    });

    it("renders progress indicator", () => {
      render(<WizardTooltip {...defaultProps} />);
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("renders close button", () => {
      render(<WizardTooltip {...defaultProps} />);
      expect(screen.getByLabelText("Sulge juhend")).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
      render(<WizardTooltip {...defaultProps} />);
      expect(screen.getByLabelText("Eelmine samm")).toBeInTheDocument();
      expect(screen.getByLabelText("Järgmine samm")).toBeInTheDocument();
    });

    it("renders with last step label", () => {
      render(<WizardTooltip {...defaultProps} isLast={true} />);
      expect(screen.getByLabelText("Lõpeta juhend")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("calls onNext when next button clicked", async () => {
      const user = userEvent.setup();
      render(<WizardTooltip {...defaultProps} />);

      await user.click(screen.getByLabelText("Järgmine samm"));
      expect(defaultProps.onNext).toHaveBeenCalled();
    });

    it("calls onPrev when prev button clicked", async () => {
      const user = userEvent.setup();
      render(<WizardTooltip {...defaultProps} isFirst={false} />);

      await user.click(screen.getByLabelText("Eelmine samm"));
      expect(defaultProps.onPrev).toHaveBeenCalled();
    });

    it("disables prev button on first step", () => {
      render(<WizardTooltip {...defaultProps} isFirst={true} />);
      expect(screen.getByLabelText("Eelmine samm")).toBeDisabled();
    });

    it("enables prev button on subsequent steps", () => {
      render(<WizardTooltip {...defaultProps} isFirst={false} />);
      expect(screen.getByLabelText("Eelmine samm")).not.toBeDisabled();
    });

    it("calls onSkip on last step when next clicked", async () => {
      const user = userEvent.setup();
      render(<WizardTooltip {...defaultProps} isLast={true} />);

      await user.click(screen.getByLabelText("Lõpeta juhend"));
      expect(defaultProps.onSkip).toHaveBeenCalled();
    });
  });

  describe("skip functionality", () => {
    it("calls onSkip when close button clicked", async () => {
      const user = userEvent.setup();
      render(<WizardTooltip {...defaultProps} />);

      await user.click(screen.getByLabelText("Sulge juhend"));
      expect(defaultProps.onSkip).toHaveBeenCalled();
    });

    it("calls onSkip when overlay clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(<WizardTooltip {...defaultProps} />);

      await user.click(container.querySelector(".wizard__overlay")!);
      expect(defaultProps.onSkip).toHaveBeenCalled();
    });
  });

  });

  });

  });

  });

  });

});
