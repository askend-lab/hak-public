// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import AppHeader from "./components/AppHeader";
import SynthesisView from "./components/SynthesisView";
import TasksView from "./components/TasksView";
import SpecsPage from "./components/SpecsPage";
import Dashboard from "./components/Dashboard";
import AppModals from "./components/AppModals";
import SynthesisModals from "./components/SynthesisModals";
import { RoleSelectionContent } from "./components/onboarding";
import { useAuth } from "./services/auth";
import { COPIED_ENTRIES_KEY } from "./hooks/synthesis/useSentenceState";
import { useNotification } from "./contexts/NotificationContext";
import { useOnboarding } from "./contexts/OnboardingContext";
import { SynthesisPageProvider } from "./contexts/SynthesisPageContext";
import {
  useSynthesis,
  useTaskHandlers,
  useCurrentView,
} from "./hooks";

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

  const [pendingTasksViewAccess, setPendingTasksViewAccess] = useState(false);

  const synthesis = useSynthesis();
  const taskHandlers = useTaskHandlers(
    synthesis.sentences,
    () => navigate("/tasks"),
    () => {},
  );
  const hasCheckedInitialRedirect = useRef(false);
  // Capture copiedEntries presence synchronously during render (before effects clear it)
  const hadCopiedEntries = useRef(
    sessionStorage.getItem(COPIED_ENTRIES_KEY) !== null,
  );

  // Handle post-login redirect
  useEffect(() => {
    if (isAuthenticated && pendingTasksViewAccess) {
      navigate("/tasks");
      setPendingTasksViewAccess(false);
    }
  }, [isAuthenticated, pendingTasksViewAccess, navigate]);

  useEffect(() => {
    if (isWizardActive && onboardingState.selectedRole)
      synthesis.setDemoSentences();
  }, [
    isWizardActive,
    onboardingState.selectedRole,
    synthesis.setDemoSentences,
  ]);

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

  if (isOnboardingLoading) {
    return (
      <div
        className="page-layout"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div className="loader-spinner" style={{ width: 48, height: 48 }}></div>
      </div>
    );
  }

  const showRoleSelection = currentView === "role-selection";

  return (
    <div className="page-layout">
      <AppHeader
        isAuthenticated={isAuthenticated}
        user={user}
        onTasksClick={handleTasksClick}
        onHelpClick={() => navigate("/role-selection")}
        onLoginClick={() => setShowLoginModal(true)}
      />

      <main
        className={`page-layout__main ${showRoleSelection ? "role-selection-main" : ""}`}
      >
        {showRoleSelection ? (
          <RoleSelectionContent />
        ) : (
          <>
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
          </>
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
    </div>
  );
}
