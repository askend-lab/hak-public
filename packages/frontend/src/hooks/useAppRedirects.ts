// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/services";
import { useOnboarding } from "@/features/onboarding/contexts/OnboardingContext";
import { COPIED_ENTRIES_KEY } from "@/features/synthesis/hooks/synthesis/useSentenceState";
import type { ViewType } from "./useCurrentView";

/**
 * Manages app-level redirects:
 * - Post-login redirect to tasks view
 * - First-time user redirect to role selection
 * - Auth guard for tasks view access
 */
export function useAppRedirects(currentView: ViewType) {
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const {
    state: onboardingState,
    isLoading: isOnboardingLoading,
  } = useOnboarding();
  const navigate = useNavigate();

  const [pendingTasksViewAccess, setPendingTasksViewAccess] = useState(false);
  const hasCheckedInitialRedirect = useRef(false);
  const hadCopiedEntries = useRef(false);

  // Capture copiedEntries presence before redirect check
  // (useSentenceState clears sessionStorage in its own effect)
  useEffect(() => {
    hadCopiedEntries.current =
      sessionStorage.getItem(COPIED_ENTRIES_KEY) !== null;
  }, []);

  // Handle post-login redirect
  useEffect(() => {
    if (isAuthenticated && pendingTasksViewAccess) {
      navigate("/tasks");
      setPendingTasksViewAccess(false);
    }
  }, [isAuthenticated, pendingTasksViewAccess, navigate]);

  // Redirect first-time users to role selection on initial app load only
  useEffect(() => {
    if (isOnboardingLoading) return;

    // Only check on initial app load, not on subsequent navigation
    if (!hasCheckedInitialRedirect.current) {
      hasCheckedInitialRedirect.current = true;
      // Skip role selection if user has copied entries from shared task
      // Use ref captured during render since useSentenceState clears sessionStorage in its effect
      if (
        !hadCopiedEntries.current &&
        !onboardingState.completed &&
        !onboardingState.selectedRole &&
        currentView === "synthesis"
      ) {
        navigate("/role-selection", { replace: true });
      }
    }
  }, [
    isOnboardingLoading,
    onboardingState.completed,
    onboardingState.selectedRole,
    currentView,
    navigate,
  ]);

  const handleTasksClick = () => {
    if (!isAuthenticated) {
      setPendingTasksViewAccess(true);
      setShowLoginModal(true);
    }
  };

  return { handleTasksClick };
}
