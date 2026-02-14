// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import CookieConsent from "./components/CookieConsent";
import Footer from "./components/Footer";
import AppHeader from "./components/AppHeader";
import AppModals from "./components/AppModals";
import SynthesisModals from "./features/synthesis/components/SynthesisModals";
import { RoleSelectionContent } from "./features/onboarding/components";
import { useAuth } from "./features/auth/services";
import { useNotification } from "./contexts/NotificationContext";
import { useOnboarding } from "./features/onboarding/contexts/OnboardingContext";
import { PageLoadingState } from "./components/ui/PageLoadingState";
import { SynthesisPageProvider } from "./features/synthesis/contexts/SynthesisPageContext";
import {
  useSynthesis,
  useTaskHandlers,
  useCurrentView,
  useDocumentTitle,
  useAppRedirects,
} from "./hooks";

const SynthesisView = lazy(() => import("./features/synthesis/components/SynthesisView"));
const TasksView = lazy(() => import("./features/tasks/components/TasksView"));
const SpecsPage = lazy(() => import("./components/SpecsPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const AccessibilityPage = lazy(() => import("./pages/AccessibilityPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

export default function Home() {
  const { user, isAuthenticated, showLoginModal, setShowLoginModal } =
    useAuth();
  const { showNotification } = useNotification();
  const {
    state: onboardingState,
    isWizardActive,
    isLoading: isOnboardingLoading,
  } = useOnboarding();
  const navigate = useNavigate();
  const { currentView, selectedTaskId } = useCurrentView();
  useDocumentTitle();

  const synthesis = useSynthesis();
  const taskHandlers = useTaskHandlers(
    synthesis.sentences,
    () => navigate("/tasks"),
  );
  const { handleTasksClick } = useAppRedirects(currentView);

  useEffect(() => {
    if (isWizardActive && onboardingState.selectedRole)
      synthesis.setDemoSentences();
  }, [
    isWizardActive,
    onboardingState.selectedRole,
    synthesis.setDemoSentences,
  ]);

  if (isOnboardingLoading) {
    return (
      <div className="page-layout page-layout--centered">
        <PageLoadingState />
      </div>
    );
  }

  const showRoleSelection = currentView === "role-selection";

  return (
    <div className="page-layout">
      <a href="#main-content" className="skip-link">
        Liigu põhisisu juurde
      </a>
      <AppHeader
        isAuthenticated={isAuthenticated}
        user={user}
        onTasksClick={handleTasksClick}
        onHelpClick={() => navigate("/role-selection")}
        onLoginClick={() => setShowLoginModal(true)}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className={`page-layout__main ${showRoleSelection ? "role-selection-main" : ""}`}
      >
        {showRoleSelection ? (
          <RoleSelectionContent />
        ) : (
          <Suspense fallback={<PageLoadingState />}>
            {currentView === "synthesis" && (
              <SynthesisPageProvider
                sentences={synthesis.sentences}
                setSentences={synthesis.setSentences}
                synthesis={synthesis}
                taskHandlers={taskHandlers}
                showNotification={showNotification}
                isAuthenticated={isAuthenticated}
                onLogin={() => setShowLoginModal(true)}
              >
                <SynthesisView />
                <SynthesisModals showNotification={showNotification} />
              </SynthesisPageProvider>
            )}
            {currentView === "tasks" && (
              <TasksView
                selectedTaskId={selectedTaskId}
                taskRefreshTrigger={taskHandlers.taskRefreshTrigger}
                onBack={() => navigate("/tasks")}
                onViewTask={(id) => navigate(`/tasks/${id}`)}
                onCreateTask={taskHandlers.handleCreateTask}
                onEditTask={taskHandlers.handleEditTask}
                onDeleteTask={taskHandlers.handleDeleteTask}
                onShareTask={taskHandlers.handleShareTask}
                onNavigateToSynthesis={() => navigate("/synthesis")}
              />
            )}
            {currentView === "specs" && (
              <SpecsPage onBack={() => navigate("/synthesis")} />
            )}
            {currentView === "dashboard" && <Dashboard />}
            {currentView === "accessibility" && <AccessibilityPage />}
            {currentView === "privacy" && <PrivacyPage />}
          </Suspense>
        )}
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
