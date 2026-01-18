 
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserRole, OnboardingState, StoredOnboardingState } from '@/types/onboarding';
import { ROLE_CONFIGS, STORAGE_KEY } from '@/config/onboardingConfig';

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
  skipped: false
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState: StoredOnboardingState = JSON.parse(stored);
        if (parsedState.completed) {
          setState({
            completed: true,
            selectedRole: parsedState.selectedRole,
            currentStep: 0,
            skipped: false
          });
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save completed state to localStorage
  const saveToStorage = useCallback((completed: boolean, role: UserRole | null) => {
    try {
      const storageState: StoredOnboardingState = {
        completed,
        selectedRole: role,
        completedAt: completed ? new Date().toISOString() : null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageState));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, []);

  const selectRole = useCallback((role: UserRole) => {
    setState(prev => ({
      ...prev,
      selectedRole: role,
      currentStep: 0,
      completed: false  // Reset so wizard can run again (for returning users clicking help)
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.selectedRole) return prev;
      
      const totalSteps = ROLE_CONFIGS[prev.selectedRole].steps.length;
      if (prev.currentStep >= totalSteps - 1) {
        // Complete the wizard
        saveToStorage(true, prev.selectedRole);
        return {
          ...prev,
          completed: true,
          currentStep: 0
        };
      }
      
      return {
        ...prev,
        currentStep: prev.currentStep + 1
      };
    });
  }, [saveToStorage]);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  }, []);

  const skipWizard = useCallback(() => {
    setState(prev => {
      saveToStorage(true, prev.selectedRole);
      return {
        ...prev,
        completed: true,
        skipped: true
      };
    });
  }, [saveToStorage]);

  const completeWizard = useCallback(() => {
    setState(prev => {
      saveToStorage(true, prev.selectedRole);
      return {
        ...prev,
        completed: true
      };
    });
  }, [saveToStorage]);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  // Calculate if wizard should be active (role selected but not completed)
  const isWizardActive = !state.completed && state.selectedRole !== null;

  // Get current steps based on selected role
  const currentSteps = state.selectedRole 
    ? ROLE_CONFIGS[state.selectedRole].steps 
    : [];

  return (
    <OnboardingContext.Provider 
      value={{
        state,
        selectRole,
        nextStep,
        prevStep,
        skipWizard,
        completeWizard,
        resetOnboarding,
        isWizardActive,
        currentSteps,
        isLoading
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
