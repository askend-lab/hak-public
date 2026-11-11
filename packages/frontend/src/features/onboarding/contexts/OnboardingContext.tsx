// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  UserRole,
  OnboardingState,
  StoredOnboardingState,
} from "@/types/onboarding";
import { ROLE_CONFIGS, STORAGE_KEY } from "@/config/onboardingConfig";
import { logger } from "@hak/shared";

interface OnboardingContextType {
  state: OnboardingState;
  selectRole: (role: UserRole) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipWizard: () => void;
  completeWizard: () => void;
  resetOnboarding: () => void;
  isWizardActive: boolean;
  currentSteps: typeof ROLE_CONFIGS.learner.steps;
  isLoading: boolean;
}

const defaultState: OnboardingState = {
  completed: false,
  selectedRole: null,
  currentStep: 0,
  skipped: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

function saveToStorage(completed: boolean, role: UserRole | null) {
  try {
    const s: StoredOnboardingState = { completed, selectedRole: role, completedAt: completed ? new Date().toISOString() : null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (error) { logger.error("Failed to save onboarding state:", error); }
}

function useOnboardingActions(setState: React.Dispatch<React.SetStateAction<OnboardingState>>) {
  const selectRole = useCallback((role: UserRole) => {
    setState((prev) => ({ ...prev, selectedRole: role, currentStep: 0, completed: false }));
  }, [setState]);
  const nextStep = useCallback(() => {
    setState((prev) => {
      if (!prev.selectedRole) {return prev;}
      const total = ROLE_CONFIGS[prev.selectedRole].steps.length;
      if (prev.currentStep >= total - 1) { saveToStorage(true, prev.selectedRole); return { ...prev, completed: true, currentStep: 0 }; }
      return { ...prev, currentStep: prev.currentStep + 1 };
    });
  }, [setState]);
  const prevStep = useCallback(() => { setState((prev) => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) })); }, [setState]);
  const skipWizard = useCallback(() => { setState((prev) => { saveToStorage(true, prev.selectedRole); return { ...prev, completed: true, skipped: true }; }); }, [setState]);
  const completeWizard = useCallback(() => { setState((prev) => { saveToStorage(true, prev.selectedRole); return { ...prev, completed: true }; }); }, [setState]);
  const resetOnboarding = useCallback(() => { localStorage.removeItem(STORAGE_KEY); setState(defaultState); }, [setState]);
  return { selectRole, nextStep, prevStep, skipWizard, completeWizard, resetOnboarding };
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const p: StoredOnboardingState = JSON.parse(stored);
        if (p.completed) { setState({ completed: true, selectedRole: p.selectedRole, currentStep: 0, skipped: false }); }
      }
    } catch (error) { logger.error("Failed to load onboarding state:", error); localStorage.removeItem(STORAGE_KEY); }
    finally { setIsLoading(false); }
  }, []);
  const actions = useOnboardingActions(setState);
  const isWizardActive = !state.completed && state.selectedRole !== null;
  const currentSteps = state.selectedRole ? ROLE_CONFIGS[state.selectedRole].steps : [];
  return (
    <OnboardingContext.Provider value={{ state, ...actions, isWizardActive, currentSteps, isLoading }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
