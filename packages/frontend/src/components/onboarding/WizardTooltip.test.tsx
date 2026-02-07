import { describe, it, expect, vi, beforeEach } from "vitest";
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
});
