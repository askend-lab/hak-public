// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import OnboardingWizard from "./OnboardingWizard";

vi.mock("@/features/onboarding/contexts/OnboardingContext", () => ({
  useOnboarding: vi.fn(() => ({
    state: {
      selectedRole: "learner",
      currentStep: 0,
      completed: false,
    },
    currentSteps: [
      {
        id: "welcome",
        title: "Welcome",
        description: "Welcome to the app",
        targetSelector: '[data-onboarding-target="welcome"]',
      },
    ],
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    skipWizard: vi.fn(),
  })),
}));

vi.mock("./WizardTooltip", () => ({
  default: ({ step }: { step: { title: string } }) => (
    <div data-testid="wizard-tooltip">{step.title}</div>
  ),
}));

describe("OnboardingWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders wizard tooltip when steps exist", () => {
    const { getByTestId } = render(<OnboardingWizard />);
    expect(getByTestId("wizard-tooltip")).toBeInTheDocument();
  });

  it("displays step title", () => {
    const { getByText } = render(<OnboardingWizard />);
    expect(getByText("Welcome")).toBeInTheDocument();
  });

  it("returns null when wizard is completed", async () => {
    const { useOnboarding } = await import("@/features/onboarding/contexts/OnboardingContext");
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 0, completed: true },
      currentSteps: [
        { id: "x", title: "X", description: "X", targetSelector: "x" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });
    const { container } = render(<OnboardingWizard />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when no steps", async () => {
    const { useOnboarding } = await import("@/features/onboarding/contexts/OnboardingContext");
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 0, completed: false },
      currentSteps: [],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });
    const { container } = render(<OnboardingWizard />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when currentStep is out of bounds", async () => {
    const { useOnboarding } = await import("@/features/onboarding/contexts/OnboardingContext");
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { selectedRole: "learner", currentStep: 99, completed: false },
      currentSteps: [
        { id: "x", title: "X", description: "X", targetSelector: "x" },
      ],
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      skipWizard: vi.fn(),
    });
    const { container } = render(<OnboardingWizard />);
    expect(container.firstChild).toBeNull();
  });
});
