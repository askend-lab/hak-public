// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useOnboarding } from "@/features/onboarding/contexts/OnboardingContext";
import WizardTooltip from "./WizardTooltip";

/**
 * OnboardingWizard - Controller component for the wizard overlay
 *
 * Renders the current wizard step tooltip based on the selected role.
 * Manages navigation between steps and completion.
 */
export default function OnboardingWizard() {
  const { state, currentSteps, nextStep, prevStep, skipWizard } =
    useOnboarding();

  // Don't render if no steps or wizard is not active
  if (currentSteps.length === 0 || state.completed) {
    return null;
  }

  const currentStep = currentSteps[state.currentStep];

  if (!currentStep) {
    return null;
  }

  return (
    <WizardTooltip
      step={currentStep}
      currentIndex={state.currentStep}
      totalSteps={currentSteps.length}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipWizard}
      isFirst={state.currentStep === 0}
      isLast={state.currentStep === currentSteps.length - 1}
    />
  );
}
