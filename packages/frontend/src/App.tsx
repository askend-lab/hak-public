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
import AccessibilityPage from "./pages/AccessibilityPage";
import PrivacyPage from "./pages/PrivacyPage";
import AppModals from "./components/AppModals";
import { RoleSelectionContent } from "./components/onboarding";
import { useAuth } from "./services/auth";
import { useNotification } from "./contexts/NotificationContext";
import { useOnboarding } from "./contexts/OnboardingContext";
import { PageLoadingState } from "./components/ui/PageLoadingState";
import {
  useSynthesis,
  useTaskHandlers,
  useDragAndDrop,
  useVariantsPanel,
  useSentenceMenu,
  useCurrentView,
  useDocumentTitle,
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
  useDocumentTitle();

  const [pendingTasksViewAccess, setPendingTasksViewAccess] = useState(false);

  const synthesis = useSynthesis();
  const taskHandlers = useTaskHandlers(
    synthesis.sentences,
    () => navigate("/tasks"),
    () => {},
  );
  const dragDrop = useDragAndDrop(synthesis.setSentences);
  const variants = useVariantsPanel(
    synthesis.sentences,
    synthesis.setSentences,
    showNotification,
  );
  const menu = useSentenceMenu();
  const hasCheckedInitialRedirect = useRef(false);
  // Capture copiedEntries presence synchronously during render (before effects clear it)
  const hadCopiedEntries = useRef(
    sessionStorage.getItem("copiedEntries") !== null,
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

  const handleUseVariant = (variantText: string) => {
    synthesis.handleUseVariant(
      variantText,
      variants.selectedSentenceId,
      variants.selectedTagIndex,
    );
    variants.setVariantsCustomPhonetic(variantText);
  };

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
          <>
            {currentView === "synthesis" && (
              <SynthesisView
                sentences={synthesis.sentences}
                isPlayingAll={synthesis.isPlayingAll}
                isLoadingPlayAll={synthesis.isLoadingPlayAll}
                openTagMenu={synthesis.openTagMenu}
                editingTag={synthesis.editingTag}
                draggedId={dragDrop.draggedId}
                dragOverId={dragDrop.dragOverId}
                isAuthenticated={isAuthenticated}
                menuOpenId={menu.openMenuId}
                menuAnchorEl={menu.menuAnchorEl}
                menuSearchQuery={menu.menuSearchQuery}
                isLoadingMenuTasks={menu.isLoadingMenuTasks}
                menuTasks={menu.menuTasks}
                showAddToTaskDropdown={taskHandlers.showAddToTaskDropdown}
                variantsSelectedSentenceId={variants.selectedSentenceId}
                variantsSelectedTagIndex={variants.selectedTagIndex}
                sentencePhoneticId={variants.sentencePhoneticId}
                isVariantsPanelOpen={variants.isVariantsPanelOpen}
                showSentencePhoneticPanel={variants.showSentencePhoneticPanel}
                loadingVariantsTag={variants.loadingVariantsTag}
                onAddAllClick={taskHandlers.handleAddAllSentencesToTask}
                onPlayAllClick={synthesis.handlePlayAll}
                onDropdownClose={() =>
                  taskHandlers.setShowAddToTaskDropdown(false)
                }
                onSelectTask={taskHandlers.handleSelectTaskFromDropdown}
                onCreateNew={taskHandlers.handleCreateNewFromDropdown}
                onPlay={synthesis.handlePlay}
                onDragStart={dragDrop.handleDragStart}
                onDragEnd={dragDrop.handleDragEnd}
                onDragOver={dragDrop.handleDragOver}
                onDragLeave={dragDrop.handleDragLeave}
                onDrop={dragDrop.handleDrop}
                onTagMenuOpen={(id, idx) => {
                  const isOpen =
                    synthesis.openTagMenu?.sentenceId === id &&
                    synthesis.openTagMenu?.tagIndex === idx;
                  synthesis.setOpenTagMenu(
                    isOpen ? null : { sentenceId: id, tagIndex: idx },
                  );
                }}
                onTagMenuClose={() => synthesis.setOpenTagMenu(null)}
                onOpenVariantsFromMenu={variants.handleOpenVariantsFromMenu}
                onEditTag={synthesis.handleEditTag}
                onDeleteTag={synthesis.handleDeleteTag}
                onEditTagChange={synthesis.handleEditTagChange}
                onEditTagKeyDown={synthesis.handleEditTagKeyDown}
                onEditTagCommit={synthesis.handleEditTagCommit}
                onInputChange={synthesis.handleTextChange}
                onInputKeyDown={synthesis.handleKeyDown}
                onInputBlur={synthesis.handleInputBlur}
                onClearSentence={synthesis.handleClearSentence}
                onMenuOpen={(
                  event: React.MouseEvent<Element, MouseEvent>,
                  id: string,
                ) => menu.handleMenuOpen(event, id)}
                onMenuClose={menu.handleMenuClose}
                onMenuSearchChange={menu.setMenuSearchQuery}
                onAddToTask={taskHandlers.handleAddSentenceToExistingTask}
                onCreateNewTask={taskHandlers.handleCreateNewTaskFromMenu}
                onExplorePhonetic={variants.handleExplorePhonetic}
                onDownload={synthesis.handleDownload}
                onCopyText={synthesis.handleCopyText}
                onRemoveSentence={synthesis.handleRemoveSentence}
                onLogin={() => setShowLoginModal(true)}
                onAddSentence={synthesis.handleAddSentence}
              />
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
          </>
        )}
      </main>

      <footer className="page-layout__footer page-footer--full">
        <Footer />
      </footer>
      <AppModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showNotification={showNotification}
        isWizardActive={isWizardActive}
        variants={variants}
        synthesis={synthesis}
        taskHandlers={taskHandlers}
        onUseVariant={handleUseVariant}
      />
    </div>
  );
}
