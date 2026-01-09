/**
 * Onboarding Types
 * Type definitions for the role-based onboarding wizard
 */

export type UserRole = 'learner' | 'teacher' | 'specialist';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;  // CSS selector for the UI element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface RoleConfig {
  id: UserRole;
  titleEt: string;           // "Õppija", "Õpetaja", "Kõnesünteesi spetsialist"
  descriptionEt: string;     // Role description
  ctaText: string;           // Button text
  mascotVariant: 'wave' | 'point' | 'think';  // Different poses for mascot
  steps: WizardStep[];
}

export interface OnboardingState {
  completed: boolean;
  selectedRole: UserRole | null;
  currentStep: number;
  skipped: boolean;
}

export interface StoredOnboardingState {
  completed: boolean;
  selectedRole: UserRole | null;
  completedAt: string | null;
}
