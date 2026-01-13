/* eslint-disable max-lines-per-function, complexity */
import { useState, useEffect } from 'react';
import Footer from './components/Footer';
import AppHeader from './components/AppHeader';
import SynthesisView from './components/SynthesisView';
import TasksView from './components/TasksView';
import SpecsPage from './components/SpecsPage';
import Dashboard from './components/Dashboard';
import AppModals from './components/AppModals';
import { RoleSelectionContent } from './components/onboarding';
import { useAuth } from './services/auth';
import { useNotification } from './contexts/NotificationContext';
import { useOnboarding } from './contexts/OnboardingContext';
import { useSynthesis, useTaskHandlers, useDragAndDrop, useVariantsPanel, useSentenceMenu } from './hooks';
import { warmAudioWorker } from './utils/warmAudioWorker';

export default function Home() {
  const { user, isAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
  const { showNotification } = useNotification();
  const { state: onboardingState, isWizardActive, resetOnboarding, isLoading: isOnboardingLoading } = useOnboarding();

  const [currentView, setCurrentView] = useState<'synthesis' | 'tasks' | 'specs' | 'dashboard'>('synthesis');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [pendingTasksViewAccess, setPendingTasksViewAccess] = useState(false);

  const synthesis = useSynthesis();
  const taskHandlers = useTaskHandlers(synthesis.sentences, setCurrentView, setSelectedTaskId);
  const dragDrop = useDragAndDrop(synthesis.setSentences);
  const variants = useVariantsPanel(synthesis.sentences, synthesis.setSentences);
  const menu = useSentenceMenu();

  // Pre-warm audio worker on page load
  useEffect(() => { warmAudioWorker(); }, []);

  // Handle post-login redirect and logout
  useEffect(() => {
    if (isAuthenticated && pendingTasksViewAccess) { setCurrentView('tasks'); setPendingTasksViewAccess(false); }
  }, [isAuthenticated, pendingTasksViewAccess]);

  useEffect(() => {
    if (!isAuthenticated && currentView === 'tasks') setCurrentView('synthesis');
  }, [isAuthenticated, currentView]);

  useEffect(() => {
    if (isWizardActive && onboardingState.selectedRole) synthesis.setDemoSentences();
  }, [isWizardActive, onboardingState.selectedRole, synthesis.setDemoSentences]);

  const handleUseVariant = (variantText: string) => {
    synthesis.handleUseVariant(variantText, variants.selectedSentenceId, variants.selectedTagIndex);
    variants.setVariantsCustomPhonetic(variantText);
  };

  const handleBackToTaskList = () => setSelectedTaskId(null);
  const handleViewTask = (taskId: string) => setSelectedTaskId(taskId);

  if (isOnboardingLoading) {
    return <div className="page-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="loader-spinner" style={{ width: 48, height: 48 }}></div></div>;
  }

  const showRoleSelection = !onboardingState.completed && !onboardingState.selectedRole;

  return (
    <div className="page-layout">
      <AppHeader
        currentView={currentView} isAuthenticated={isAuthenticated} user={user}
        onSynthesisClick={() => { setCurrentView('synthesis'); setSelectedTaskId(null); }}
        onTasksClick={() => { if (!isAuthenticated) { setPendingTasksViewAccess(true); setShowLoginModal(true); return; } setCurrentView('tasks'); }}
        onSpecsClick={() => setCurrentView('specs')}
        onDashboardClick={() => { setCurrentView('dashboard'); }}
        onHelpClick={resetOnboarding} onLoginClick={() => setShowLoginModal(true)}
      />

      <main className={`page-layout__main ${showRoleSelection ? 'role-selection-main' : ''}`}>
        {showRoleSelection ? <RoleSelectionContent /> : (
          <>
            {currentView === 'synthesis' && (
              <SynthesisView
                sentences={synthesis.sentences} isPlayingAll={synthesis.isPlayingAll} isLoadingPlayAll={synthesis.isLoadingPlayAll}
                openTagMenu={synthesis.openTagMenu} editingTag={synthesis.editingTag}
                draggedId={dragDrop.draggedId} dragOverId={dragDrop.dragOverId}
                isAuthenticated={isAuthenticated} menuOpenId={menu.openMenuId} menuAnchorEl={menu.menuAnchorEl}
                menuSearchQuery={menu.menuSearchQuery} isLoadingMenuTasks={menu.isLoadingMenuTasks} menuTasks={menu.menuTasks}
                showAddToTaskDropdown={taskHandlers.showAddToTaskDropdown}
                variantsSelectedSentenceId={variants.selectedSentenceId} variantsSelectedTagIndex={variants.selectedTagIndex}
                sentencePhoneticId={variants.sentencePhoneticId} isVariantsPanelOpen={variants.isVariantsPanelOpen}
                showSentencePhoneticPanel={variants.showSentencePhoneticPanel}
                onAddAllClick={taskHandlers.handleAddAllSentencesToTask} onPlayAllClick={synthesis.handlePlayAll}
                onDropdownClose={() => taskHandlers.setShowAddToTaskDropdown(false)}
                onSelectTask={taskHandlers.handleSelectTaskFromDropdown} onCreateNew={taskHandlers.handleCreateNewFromDropdown}
                onPlay={synthesis.handlePlay} onDragStart={dragDrop.handleDragStart} onDragEnd={dragDrop.handleDragEnd}
                onDragOver={dragDrop.handleDragOver} onDragLeave={dragDrop.handleDragLeave} onDrop={dragDrop.handleDrop}
                onTagMenuOpen={(id, idx) => { const isOpen = synthesis.openTagMenu?.sentenceId === id && synthesis.openTagMenu?.tagIndex === idx; synthesis.setOpenTagMenu(isOpen ? null : { sentenceId: id, tagIndex: idx }); }}
                onTagMenuClose={() => synthesis.setOpenTagMenu(null)}
                onOpenVariantsFromMenu={variants.handleOpenVariantsFromMenu} onEditTag={synthesis.handleEditTag} onDeleteTag={synthesis.handleDeleteTag}
                onEditTagChange={synthesis.handleEditTagChange} onEditTagKeyDown={synthesis.handleEditTagKeyDown} onEditTagCommit={synthesis.handleEditTagCommit}
                onInputChange={synthesis.handleTextChange} onInputKeyDown={synthesis.handleKeyDown} onInputBlur={synthesis.handleInputBlur}
                onClearSentence={synthesis.handleClearSentence} onMenuOpen={(event: React.MouseEvent<Element, MouseEvent>, id: string) => menu.handleMenuOpen(event, id)} onMenuClose={menu.handleMenuClose}
                onMenuSearchChange={menu.setMenuSearchQuery} onAddToTask={taskHandlers.handleAddSentenceToExistingTask}
                onCreateNewTask={taskHandlers.handleCreateNewTaskFromMenu} onExplorePhonetic={variants.handleExplorePhonetic}
                onDownload={synthesis.handleDownload} onRemoveSentence={synthesis.handleRemoveSentence}
                onLogin={() => setShowLoginModal(true)} onAddSentence={synthesis.handleAddSentence}
              />
            )}
            {currentView === 'tasks' && (
              <TasksView selectedTaskId={selectedTaskId} taskRefreshTrigger={taskHandlers.taskRefreshTrigger}
                onBack={handleBackToTaskList} onViewTask={handleViewTask} onCreateTask={taskHandlers.handleCreateTask}
                onEditTask={taskHandlers.handleEditTask} onDeleteTask={taskHandlers.handleDeleteTask} onShareTask={taskHandlers.handleShareTask}
              />
            )}
            {currentView === 'specs' && (
              <SpecsPage onBack={() => setCurrentView('synthesis')} />
            )}
            {currentView === 'dashboard' && (
              <Dashboard />
            )}
          </>
        )}
      </main>

      <footer className="page-layout__footer page-footer--full"><Footer /></footer>
      <AppModals user={user} sentences={synthesis.sentences} showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} showNotification={showNotification} isWizardActive={isWizardActive} variants={variants} synthesis={synthesis} taskHandlers={taskHandlers} onUseVariant={handleUseVariant} />
    </div>
  );
}
