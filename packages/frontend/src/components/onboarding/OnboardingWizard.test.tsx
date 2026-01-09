import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import OnboardingWizard from './OnboardingWizard';

vi.mock('@/contexts/OnboardingContext', () => ({
  useOnboarding: vi.fn(() => ({
    state: {
      selectedRole: 'learner',
      currentStep: 0,
      completed: false,
    },
    currentSteps: [
      {
        id: 'welcome',
        title: 'Welcome',
        description: 'Welcome to the app',
        targetSelector: '[data-onboarding-target="welcome"]',
      },
    ],
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    skipWizard: vi.fn(),
  })),
}));

vi.mock('./WizardTooltip', () => ({
  default: ({ step }: { step: { title: string } }) => (
    <div data-testid="wizard-tooltip">{step.title}</div>
  ),
}));

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders wizard tooltip when steps exist', () => {
    const { getByTestId } = render(<OnboardingWizard />);
    expect(getByTestId('wizard-tooltip')).toBeInTheDocument();
  });

  it('displays step title', () => {
    const { getByText } = render(<OnboardingWizard />);
    expect(getByText('Welcome')).toBeInTheDocument();
  });
});
