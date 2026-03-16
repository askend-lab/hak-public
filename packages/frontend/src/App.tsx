// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import CookieConsent from "./components/CookieConsent";
import Footer from "./components/Footer";
import AppHeader from "./components/AppHeader";
import AppModals from "./components/AppModals";
import { useAuth } from "./features/auth/services";
import { saveReturnUrl } from "./features/auth/services/storage";
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

const LandingPage = lazy(() => import("./pages/LandingPage"));

function UnauthenticatedLayout({ mainRef, showLoginModal, setShowLoginModal, taskHandlers }: {
  mainRef: React.RefObject<HTMLElement | null>; showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void; taskHandlers: ReturnType<typeof useTaskHandlers>;
}) {
  const openLogin = () => { saveReturnUrl(); setShowLoginModal(true); };
  return (
    <div className="page-layout">
      <a href="#main-content" className="skip-link">Liigu põhisisu juurde</a>
      <AppHeader isAuthenticated={false} user={null} onTasksClick={openLogin} onHelpClick={openLogin} onLoginClick={openLogin} />
      <main ref={mainRef} id="main-content" tabIndex={-1} className="page-layout__main">
        <Suspense fallback={<PageLoadingState />}>
          <LandingPage onLogin={openLogin} />
        </Suspense>
      </main>
      <footer className="page-layout__footer page-footer--full"><Footer /></footer>
      <AppModals showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} isWizardActive={false} taskHandlers={taskHandlers} />
      <CookieConsent />
    </div>
  );
}

function useFocusOnNavigate(pathname: string): React.RefObject<HTMLElement | null> {
  const mainRef = useRef<HTMLElement>(null);
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname]);
  return mainRef;
}

function useAppSetup() {
  const auth = useAuth();
  const { showNotification } = useNotification();
  const onboarding = useOnboarding();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useDocumentTitle();
  const synthesis = useSynthesis();
  const navigateToTasks = useCallback((): void => { void navigate("/tasks"); }, [navigate]);
  const taskHandlers = useTaskHandlers(synthesis.sentences, navigateToTasks);
  const { handleTasksClick } = useAppRedirects();
  const mainRef = useFocusOnNavigate(pathname);

  useEffect(() => {
    if (onboarding.isWizardActive && onboarding.state.selectedRole) { synthesis.setDemoSentences(); }
  }, [onboarding.isWizardActive, onboarding.state.selectedRole, synthesis.setDemoSentences]);

  return { auth, showNotification, onboarding, navigate, pathname, synthesis, taskHandlers, handleTasksClick, mainRef };
}

export default function AppLayout() {
  const { auth, showNotification, onboarding, navigate, pathname, synthesis, taskHandlers, handleTasksClick, mainRef } = useAppSetup();
  const { user, isAuthenticated, showLoginModal, setShowLoginModal } = auth;

  const outletContext = useMemo<AppLayoutContext>(
    () => ({ synthesis, taskHandlers, showNotification, isAuthenticated, setShowLoginModal }),
    [synthesis, taskHandlers, showNotification, isAuthenticated, setShowLoginModal],
  );

  if (onboarding.isLoading) {
    return (
      <div className="page-layout page-layout--centered">
        <PageLoadingState />
      </div>
    );
  }

  const isPublicPage = pathname === "/accessibility" || pathname === "/privacy";

  if (!isAuthenticated && !isPublicPage) {
    return <UnauthenticatedLayout mainRef={mainRef} showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} taskHandlers={taskHandlers} />;
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
        isWizardActive={onboarding.isWizardActive}
        taskHandlers={taskHandlers}
      />
      <CookieConsent />
    </div>
  );
}
