// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect, useRef, useMemo, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import CookieConsent from "./components/CookieConsent";
import Footer from "./components/Footer";
import AppHeader from "./components/AppHeader";
import AppModals from "./components/AppModals";
import { useAuth } from "./features/auth/services";
import { useNotification } from "./contexts/NotificationContext";
import { useOnboarding } from "./features/onboarding/contexts/OnboardingContext";
import { PageLoadingState } from "./components/ui/PageLoadingState";
import {
  useSynthesis,
  useDocumentTitle,
  useAppRedirects,
} from "./hooks";
import { useTaskHandlers } from "./features/tasks/hooks/useTaskHandlers";
import type { AppLayoutContext } from "./routes/types";

export default function AppLayout() {
  const { user, isAuthenticated, showLoginModal, setShowLoginModal } =
    useAuth();
  const { showNotification } = useNotification();
  const {
    state: onboardingState,
    isWizardActive,
    isLoading: isOnboardingLoading,
  } = useOnboarding();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useDocumentTitle();

  const synthesis = useSynthesis();
  const navigateToTasks = useCallback((): void => { void navigate("/tasks"); }, [navigate]);
  const taskHandlers = useTaskHandlers(
    synthesis.sentences,
    navigateToTasks,
  );
  const { handleTasksClick } = useAppRedirects();

  const mainRef = useRef<HTMLElement>(null);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname]);

  useEffect(() => {
    if (isWizardActive && onboardingState.selectedRole)
      synthesis.setDemoSentences();
  }, [
    isWizardActive,
    onboardingState.selectedRole,
    synthesis.setDemoSentences,
  ]);

  const outletContext = useMemo<AppLayoutContext>(() => ({
    synthesis,
    taskHandlers,
    showNotification,
    isAuthenticated,
    setShowLoginModal,
  }), [synthesis, taskHandlers, showNotification, isAuthenticated, setShowLoginModal]);

  if (isOnboardingLoading) {
    return (
      <div className="page-layout page-layout--centered">
        <PageLoadingState />
      </div>
    );
  }

  const isRoleSelection = pathname === "/role-selection";

  return (
    <div className="page-layout">
      <a href="#main-content" className="skip-link">
        Liigu põhisisu juurde
      </a>
      <AppHeader
        isAuthenticated={isAuthenticated}
        user={user}
        onTasksClick={handleTasksClick}
        onHelpClick={() => { void navigate("/role-selection"); }}
        onLoginClick={() => setShowLoginModal(true)}
      />

      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        className={`page-layout__main ${isRoleSelection ? "role-selection-main" : ""}`}
      >
        <Outlet context={outletContext} />
      </main>

      <footer className="page-layout__footer page-footer--full">
        <Footer />
      </footer>
      <AppModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        isWizardActive={isWizardActive}
        taskHandlers={taskHandlers}
      />
      <CookieConsent />
    </div>
  );
}
