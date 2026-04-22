// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WizardTooltip from "./WizardTooltip";

describe("WizardTooltip", () => {
  const defaultProps = {
    step: {
      id: "step-1",
      title: "Step Title",
      description: "Step description text",
      targetSelector: '[data-onboarding-target="test"]',
      position: "bottom" as const,
    },
    currentIndex: 0,
    totalSteps: 3,
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onSkip: vi.fn(),
    isFirst: true,
    isLast: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a target element in the DOM for positioning tests
    const target = document.createElement('div');
    target.setAttribute('data-onboarding-target', 'test');
    Object.defineProperty(target, 'getBoundingClientRect', {
      value: () => ({ top: 100, bottom: 140, left: 200, right: 300, width: 100, height: 40 }),
    });
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 1; });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    const el = document.querySelector('[data-onboarding-target="test"]');
    if (el) {document.body.removeChild(el);}
    vi.restoreAllMocks();
  });

  it("renders step title", () => {
    render(<WizardTooltip {...defaultProps} />);
    expect(screen.getByText("Step Title")).toBeInTheDocument();
  });

  it("renders step description", () => {
    render(<WizardTooltip {...defaultProps} />);
    expect(screen.getByText("Step description text")).toBeInTheDocument();
  });

  it("renders step counter", () => {
    render(<WizardTooltip {...defaultProps} />);
    expect(screen.getByText(/1.*3/)).toBeInTheDocument();
  });

  it("calls onNext when next button clicked", async () => {
    const user = userEvent.setup();
    render(<WizardTooltip {...defaultProps} />);

    const nextButton = screen.getByRole("button", { name: /edasi|järgmine/i });
    await user.click(nextButton);

    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it("calls onSkip when skip button clicked", async () => {
    const user = userEvent.setup();
    render(<WizardTooltip {...defaultProps} />);

    const skipButton = screen.getByRole("button", {
      name: /jäta vahele|sulge/i,
    });
    await user.click(skipButton);

    expect(defaultProps.onSkip).toHaveBeenCalled();
  });

  it("renders on non-first step", () => {
    render(
      <WizardTooltip {...defaultProps} isFirst={false} currentIndex={1} />,
    );
    expect(screen.getByText("Step Title")).toBeInTheDocument();
  });

  it("renders on last step", () => {
    render(<WizardTooltip {...defaultProps} isLast={true} currentIndex={2} />);
    expect(screen.getByText("Step Title")).toBeInTheDocument();
  });

  it("tooltip has role=dialog and aria attributes", () => {
    render(<WizardTooltip {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBe("wizard-title");
    expect(dialog.getAttribute("aria-describedby")).toBe("wizard-description");
  });

  it("title has correct id and class", () => {
    render(<WizardTooltip {...defaultProps} />);
    const title = document.getElementById("wizard-title");
    expect(title?.className).toContain("wizard__title");
    expect(title?.textContent).toBe("Step Title");
  });

  it("description has correct id and class", () => {
    render(<WizardTooltip {...defaultProps} />);
    const desc = document.getElementById("wizard-description");
    expect(desc?.className).toContain("wizard__description");
    expect(desc?.textContent).toBe("Step description text");
  });

  it("prev button is disabled on first step", () => {
    render(<WizardTooltip {...defaultProps} isFirst={true} />);
    const prevBtn = screen.getByRole("button", { name: /eelmine/i });
    expect(prevBtn).toBeDisabled();
  });

  it("prev button is enabled on non-first step", () => {
    render(<WizardTooltip {...defaultProps} isFirst={false} currentIndex={1} />);
    const prevBtn = screen.getByRole("button", { name: /eelmine/i });
    expect(prevBtn).not.toBeDisabled();
  });

  it("calls onPrev when prev button clicked", async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    render(<WizardTooltip {...defaultProps} isFirst={false} currentIndex={1} onPrev={onPrev} />);
    await user.click(screen.getByRole("button", { name: /eelmine/i }));
    expect(onPrev).toHaveBeenCalled();
  });

  it("last step next button calls onSkip", async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    const onNext = vi.fn();
    render(<WizardTooltip {...defaultProps} isLast={true} onSkip={onSkip} onNext={onNext} />);
    await user.click(screen.getByRole("button", { name: /lõpeta/i }));
    expect(onSkip).toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("non-last step next button has 'Järgmine samm' label", () => {
    render(<WizardTooltip {...defaultProps} isLast={false} />);
    expect(screen.getByRole("button", { name: "Järgmine samm" })).toBeInTheDocument();
  });

  it("last step next button has 'Lõpeta juhend' label", () => {
    render(<WizardTooltip {...defaultProps} isLast={true} />);
    expect(screen.getByRole("button", { name: "Lõpeta juhend" })).toBeInTheDocument();
  });

  it("close button has 'Sulge juhend' aria-label and wizard__close class", () => {
    render(<WizardTooltip {...defaultProps} />);
    const closeBtn = screen.getByRole("button", { name: "Sulge juhend" });
    expect(closeBtn.className).toContain("wizard__close");
  });

  it("overlay has wizard__overlay class and calls onSkip", async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    const { container } = render(<WizardTooltip {...defaultProps} onSkip={onSkip} />);
    const overlay = container.querySelector(".wizard__overlay");
    expect(overlay).toBeTruthy();
    await user.click(overlay!);
    expect(onSkip).toHaveBeenCalled();
  });

  it("progress shows correct format", () => {
    render(<WizardTooltip {...defaultProps} currentIndex={1} totalSteps={5} />);
    expect(screen.getByText(/2.*\/.*5/)).toBeInTheDocument();
  });

  it("nav button has wizard__nav-button--primary class", () => {
    const { container } = render(<WizardTooltip {...defaultProps} />);
    expect(container.querySelector(".wizard__nav-button--primary")).toBeTruthy();
  });

});
