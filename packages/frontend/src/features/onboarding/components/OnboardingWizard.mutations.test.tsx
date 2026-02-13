// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import OnboardingWizard from "./OnboardingWizard";

vi.mock("@/features/onboarding/contexts/OnboardingContext", () => ({
  useOnboarding: vi.fn(() => ({
    state: { selectedRole: "learner", currentStep: 0, completed: false },
    currentSteps: [
      { id: "s1", title: "S1", description: "D1", targetSelector: ".t1" },
      { id: "s2", title: "S2", description: "D2", targetSelector: ".t2" },
      { id: "s3", title: "S3", description: "D3", targetSelector: ".t3" },
    ],
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    skipWizard: vi.fn(),
  })),
}));

vi.mock("./WizardTooltip", () => ({
  default: (props: {
    step: { title: string };
    currentIndex: number;
    totalSteps: number;
    isFirst: boolean;
    isLast: boolean;
  }) => (
    <div
      data-testid="wizard-tooltip"
      data-is-first={String(props.isFirst)}
      data-is-last={String(props.isLast)}
      data-current-index={props.currentIndex}
      data-total-steps={props.totalSteps}
    >
      {props.step.title}
    </div>
  ),
}));

import { useOnboarding } from "@/features/onboarding/contexts/OnboardingContext";

/**
 * Mutation-killing tests for OnboardingWizard
 * Focuses on isFirst/isLast prop computation and step selection
 */
describe("OnboardingWizard mutation tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes isFirst=true when currentStep is 0", () => {
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 0, completed: false },
      currentSteps: [
        { id: "s1", title: "S1", description: "D1", targetSelector: ".t1" },
        { id: "s2", title: "S2", description: "D2", targetSelector: ".t2" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });

    const { getByTestId } = render(<OnboardingWizard />);
    expect(getByTestId("wizard-tooltip").dataset.isFirst).toBe("true");
  });

  it("passes isFirst=false when currentStep > 0", () => {
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 1, completed: false },
      currentSteps: [
        { id: "s1", title: "S1", description: "D1", targetSelector: ".t1" },
        { id: "s2", title: "S2", description: "D2", targetSelector: ".t2" },
        { id: "s3", title: "S3", description: "D3", targetSelector: ".t3" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });

    const { getByTestId } = render(<OnboardingWizard />);
    expect(getByTestId("wizard-tooltip").dataset.isFirst).toBe("false");
  });

  it("passes isLast=true when on last step", () => {
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 2, completed: false },
      currentSteps: [
        { id: "s1", title: "S1", description: "D1", targetSelector: ".t1" },
        { id: "s2", title: "S2", description: "D2", targetSelector: ".t2" },
        { id: "s3", title: "S3", description: "D3", targetSelector: ".t3" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });

    const { getByTestId } = render(<OnboardingWizard />);
    expect(getByTestId("wizard-tooltip").dataset.isLast).toBe("true");
  });

  it("passes isLast=false when not on last step", () => {
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 0, completed: false },
      currentSteps: [
        { id: "s1", title: "S1", description: "D1", targetSelector: ".t1" },
        { id: "s2", title: "S2", description: "D2", targetSelector: ".t2" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });

    const { getByTestId } = render(<OnboardingWizard />);
    expect(getByTestId("wizard-tooltip").dataset.isLast).toBe("false");
  });

  it("passes correct totalSteps", () => {
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 0, completed: false },
      currentSteps: [
        { id: "s1", title: "S1", description: "D1", targetSelector: ".t1" },
        { id: "s2", title: "S2", description: "D2", targetSelector: ".t2" },
        { id: "s3", title: "S3", description: "D3", targetSelector: ".t3" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });

    const { getByTestId } = render(<OnboardingWizard />);
    expect(getByTestId("wizard-tooltip").dataset.totalSteps).toBe("3");
  });

  it("passes correct currentIndex", () => {
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 1, completed: false },
      currentSteps: [
        { id: "s1", title: "S1", description: "D1", targetSelector: ".t1" },
        { id: "s2", title: "S2", description: "D2", targetSelector: ".t2" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });

    const { getByTestId } = render(<OnboardingWizard />);
    expect(getByTestId("wizard-tooltip").dataset.currentIndex).toBe("1");
  });

  it("renders correct step title based on currentStep index", () => {
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 1, completed: false },
      currentSteps: [
        { id: "s1", title: "First", description: "D1", targetSelector: ".t1" },
        { id: "s2", title: "Second", description: "D2", targetSelector: ".t2" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });

    const { getByText } = render(<OnboardingWizard />);
    expect(getByText("Second")).toBeInTheDocument();
  });
});
