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
    if (el) document.body.removeChild(el);
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

  it("footer has wizard__footer class", () => {
    const { container } = render(<WizardTooltip {...defaultProps} />);
    expect(container.querySelector(".wizard__footer")).toBeTruthy();
    expect(container.querySelector(".wizard__progress")).toBeTruthy();
    expect(container.querySelector(".wizard__nav")).toBeTruthy();
  });

  it("tooltip class includes arrow position", () => {
    const { container } = render(<WizardTooltip {...defaultProps} />);
    const tooltip = container.querySelector(".wizard__tooltip");
    expect(tooltip?.className).toContain("wizard__tooltip--arrow-");
  });

  it("positions tooltip below target for position=bottom", () => {
    const { container } = render(<WizardTooltip {...defaultProps} />);
    const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
    // bottom(140) + padding(16) + arrowSize(12) = 168
    expect(parseFloat(tooltip.style.top)).toBe(168);
    // left(200) + width(100)/2 - tooltipWidth(0)/2 = 250
    expect(parseFloat(tooltip.style.left)).toBe(250);
  });

  it("positions tooltip above target for position=top", () => {
    const props = { ...defaultProps, step: { ...defaultProps.step, position: 'top' as const } };
    const { container } = render(<WizardTooltip {...props} />);
    const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
    // top(100) - tooltipHeight(0) - padding(16) - arrowSize(12) = 72
    expect(parseFloat(tooltip.style.top)).toBe(72);
    // left(200) + width(100)/2 - tooltipWidth(0)/2 = 250
    expect(parseFloat(tooltip.style.left)).toBe(250);
  });

  it("positions tooltip left of target for position=left", () => {
    const props = { ...defaultProps, step: { ...defaultProps.step, position: 'left' as const } };
    const { container } = render(<WizardTooltip {...props} />);
    const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
    // top(100) + height(40)/2 - tooltipHeight(0)/2 = 120
    expect(parseFloat(tooltip.style.top)).toBe(120);
    // left(200) - tooltipWidth(0) - padding(16) - arrowSize(12) = 172
    expect(parseFloat(tooltip.style.left)).toBe(172);
  });

  it("positions tooltip right of target for position=right", () => {
    const props = { ...defaultProps, step: { ...defaultProps.step, position: 'right' as const } };
    const { container } = render(<WizardTooltip {...props} />);
    const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
    // top(100) + height(40)/2 - tooltipHeight(0)/2 = 120
    expect(parseFloat(tooltip.style.top)).toBe(120);
    // right(300) + padding(16) + arrowSize(12) = 328
    expect(parseFloat(tooltip.style.left)).toBe(328);
  });

  it("arrow position is 'top' when step position is 'bottom'", () => {
    const { container } = render(<WizardTooltip {...defaultProps} />);
    const tooltip = container.querySelector(".wizard__tooltip");
    expect(tooltip?.className).toContain("wizard__tooltip--arrow-top");
  });

  it("arrow position is 'bottom' when step position is 'top'", () => {
    const props = { ...defaultProps, step: { ...defaultProps.step, position: 'top' as const } };
    const { container } = render(<WizardTooltip {...props} />);
    const tooltip = container.querySelector(".wizard__tooltip");
    expect(tooltip?.className).toContain("wizard__tooltip--arrow-bottom");
  });

  it("arrow position is 'right' when step position is 'left'", () => {
    const props = { ...defaultProps, step: { ...defaultProps.step, position: 'left' as const } };
    const { container } = render(<WizardTooltip {...props} />);
    const tooltip = container.querySelector(".wizard__tooltip");
    expect(tooltip?.className).toContain("wizard__tooltip--arrow-right");
  });

  it("arrow position is 'left' when step position is 'right'", () => {
    const props = { ...defaultProps, step: { ...defaultProps.step, position: 'right' as const } };
    const { container } = render(<WizardTooltip {...props} />);
    const tooltip = container.querySelector(".wizard__tooltip");
    expect(tooltip?.className).toContain("wizard__tooltip--arrow-left");
  });

  it("tooltip opacity is 1 after positioning", () => {
    const { container } = render(<WizardTooltip {...defaultProps} />);
    const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
    expect(tooltip.style.opacity).toBe("1");
  });

  it("adds wizard__highlight class to target element", () => {
    render(<WizardTooltip {...defaultProps} />);
    const target = document.querySelector('[data-onboarding-target="test"]');
    expect(target?.classList.contains('wizard__highlight')).toBe(true);
  });

  it("scrolls target into view", () => {
    render(<WizardTooltip {...defaultProps} />);
    const target = document.querySelector('[data-onboarding-target="test"]');
    expect((target as HTMLElement).scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it("has --arrow-offset CSS variable", () => {
    const { container } = render(<WizardTooltip {...defaultProps} />);
    const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
    const style = tooltip.getAttribute('style') || '';
    expect(style).toContain('--arrow-offset');
  });
});
