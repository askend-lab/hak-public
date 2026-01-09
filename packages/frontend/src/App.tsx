import { useState, useEffect } from 'react';
import Footer from './components/Footer';
import PronunciationVariants from './components/PronunciationVariants';
import TaskManager from './components/TaskManager';
import TaskDetailView from './components/TaskDetailView';
import TaskCreationModal from './components/TaskCreationModal';
import TaskEditModal from './components/TaskEditModal';
import AddEntryModal from './components/AddEntryModal';
import ShareTaskModal from './components/ShareTaskModal';
import LoginModal from './components/LoginModal';
import UserProfile from './components/UserProfile';
import ConfirmationModal from './components/ConfirmationModal';
import AddToTaskDropdown from './components/AddToTaskDropdown';
import SentencePhoneticPanel from './components/SentencePhoneticPanel';
import SentenceSynthesisItem from './components/SentenceSynthesisItem';
import { RoleSelectionContent, OnboardingWizard } from './components/onboarding';
import { DataService } from './services/dataService';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import { useOnboarding } from './contexts/OnboardingContext';
import { useSynthesis, useTaskHandlers, useDragAndDrop, useVariantsPanel, useSentenceMenu } from './hooks';

export default function Home() {
  const { user, isAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
  const { showNotification } = useNotification();
  const { state: onboardingState, isWizardActive, resetOnboarding, isLoading: isOnboardingLoading } = useOnboarding();

  const [currentView, setCurrentView] = useState<'synthesis' | 'tasks'>('synthesis');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [pendingTasksViewAccess, setPendingTasksViewAccess] = useState(false);

  const synthesis = useSynthesis();
  const taskHandlers = useTaskHandlers(synthesis.sentences, setCurrentView, setSelectedTaskId);
  const dragDrop = useDragAndDrop(synthesis.setSentences);
  const variants = useVariantsPanel(synthesis.sentences, synthesis.setSentences);
  const menu = useSentenceMenu();

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
      <header className="page-layout__header">
        <div className="page-layout__header-content">
          <div className="eki-logo"><img src="/icons/logo.svg" alt="EKI Logo" /></div>
          <nav className="header-nav">
            <a href="#" className={`header-nav-link ${currentView === 'synthesis' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentView('synthesis'); setSelectedTaskId(null); }}>Kõnesüntees</a>
            <a href="#" className={`header-nav-link ${currentView === 'tasks' ? 'active' : ''}`} data-nav="tasks" onClick={(e) => { e.preventDefault(); if (!isAuthenticated) { setPendingTasksViewAccess(true); setShowLoginModal(true); return; } setCurrentView('tasks'); }}>Ülesanded</a>
          </nav>
          <div className="header-functions">
            <button className="header-help-button" onClick={resetOnboarding} aria-label="Abi ja juhend" title="Näita juhendeid">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </button>
            {isAuthenticated && user ? <UserProfile user={user} /> : <button className="header-login-button" onClick={() => setShowLoginModal(true)}>Logi sisse</button>}
            <button className="header-menu-button" aria-label="Menu"><img src="/icons/Group.svg" alt="Menu" /></button>
          </div>
        </div>
      </header>

      <main className={`page-layout__main ${showRoleSelection ? 'role-selection-main' : ''}`}>
        {showRoleSelection ? <RoleSelectionContent /> : (
          <>
            {currentView === 'synthesis' ? (
              <>
                <div className="page-header page-header--full">
                  <div className="page-header__content">
                    <h1 className="page-header__title">Teksti kõnesüntees</h1>
                    <p className="page-header__description">Sisesta tekst või sõna, et kuulata selle hääldust ja uurida variante</p>
                  </div>
                  <div className="page-header__actions">
                    {synthesis.sentences.filter(s => s.text.trim()).length > 0 && (
                      <div className="add-to-task-container">
                        <button className="button button--secondary" onClick={taskHandlers.handleAddAllSentencesToTask} data-onboarding-target="save-to-task-button">Lisa ülesandesse ({synthesis.sentences.filter(s => s.text.trim()).length})</button>
                        <AddToTaskDropdown isOpen={taskHandlers.showAddToTaskDropdown} onClose={() => taskHandlers.setShowAddToTaskDropdown(false)} onSelectTask={taskHandlers.handleSelectTaskFromDropdown} onCreateNew={taskHandlers.handleCreateNewFromDropdown} />
                      </div>
                    )}
                    {synthesis.sentences.filter(s => s.text.trim()).length > 1 && (
                      <button className={`button button--primary ${synthesis.isLoadingPlayAll ? 'loading' : ''}`} onClick={synthesis.handlePlayAll}>
                        {synthesis.isLoadingPlayAll ? <div className="loader-spinner"></div> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d={synthesis.isPlayingAll ? "M7 6h3v12H7zm7 0h3v12h-3z" : "M8.31 6.5c.01-.002.07-.005.25.07.18.07.41.18.75.36l8.65 4.37c.38.19.63.32.81.43.16.1.2.15.2.15a.5.5 0 010 .25s-.04.05-.2.15c-.18.11-.43.24-.81.43L9.31 17.08c-.34.17-.57.29-.75.36-.18.07-.24.07-.25.07a.32.32 0 01-.25-.14c-.01-.01-.03-.04-.04-.2-.02-.18-.02-.42-.02-.79V7.63c0-.37 0-.61.02-.79.01-.16.03-.19.04-.2a.32.32 0 01.25-.14z"} fill="currentColor"/></svg>}
                        {synthesis.isLoadingPlayAll ? 'Laadimine' : synthesis.isPlayingAll ? 'Peata' : 'Mängi kõik'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="page-content">
                  <div className="sentences-section">
                    {synthesis.sentences.map((sentence, sentenceIndex) => (
                      <SentenceSynthesisItem
                        key={sentence.id} id={sentence.id} text={sentence.text} tags={sentence.tags} mode="input" draggable={true}
                        isDragging={dragDrop.draggedId === sentence.id} isDragOver={dragDrop.dragOverId === sentence.id}
                        isPlaying={sentence.isPlaying} isLoading={sentence.isLoading}
                        onPlay={synthesis.handlePlay} onDragStart={dragDrop.handleDragStart} onDragEnd={dragDrop.handleDragEnd}
                        onDragOver={dragDrop.handleDragOver} onDragLeave={dragDrop.handleDragLeave} onDrop={dragDrop.handleDrop}
                        onTagMenuOpen={(sentenceId, tagIndex) => { const isOpen = synthesis.openTagMenu?.sentenceId === sentenceId && synthesis.openTagMenu?.tagIndex === tagIndex; synthesis.setOpenTagMenu(isOpen ? null : { sentenceId, tagIndex }); }}
                        openTagMenu={synthesis.openTagMenu} onTagMenuClose={() => synthesis.setOpenTagMenu(null)}
                        tagMenuItems={[{ label: 'Uuri variandid', onClick: variants.handleOpenVariantsFromMenu }, { label: 'Muuda', onClick: synthesis.handleEditTag }, { label: 'Kustuta', onClick: synthesis.handleDeleteTag, danger: true }]}
                        selectedTagIndex={((variants.isVariantsPanelOpen || variants.showSentencePhoneticPanel) && (variants.selectedSentenceId === sentence.id || variants.sentencePhoneticId === sentence.id)) ? variants.selectedTagIndex : null}
                        isPronunciationPanelOpen={variants.isVariantsPanelOpen || variants.showSentencePhoneticPanel}
                        editingTag={synthesis.editingTag} onEditTagChange={synthesis.handleEditTagChange} onEditTagKeyDown={synthesis.handleEditTagKeyDown} onEditTagCommit={synthesis.handleEditTagCommit}
                        currentInput={sentence.currentInput} onInputChange={synthesis.handleTextChange} onInputKeyDown={(e) => synthesis.handleKeyDown(e, sentence.id)} onInputBlur={synthesis.handleInputBlur}
                        onClear={synthesis.handleClearSentence} sentenceIndex={sentenceIndex} onMenuOpenLegacy={menu.handleMenuOpen}
                        menuContent={menu.openMenuId === sentence.id && menu.menuAnchorEl[sentence.id] ? (
                          <>
                            <div className="synthesis__menu-backdrop" onClick={menu.handleMenuClose} />
                            <div className="synthesis__dropdown-menu synthesis__dropdown-menu--with-search">
                              {isAuthenticated ? (
                                <>
                                  <div className="synthesis__menu-search"><input type="text" className="synthesis__menu-search-input" placeholder="Otsi" value={menu.menuSearchQuery} onChange={(e) => menu.setMenuSearchQuery(e.target.value)} onClick={(e) => e.stopPropagation()} /><img className="synthesis__menu-search-icon" src="/icons/ic_search.svg" alt="Otsi" /></div>
                                  <div className="synthesis__menu-task-list">
                                    {menu.isLoadingMenuTasks ? <div className="synthesis__menu-item synthesis__menu-item--loading"><div className="synthesis__menu-item-content">Laen...</div></div> : menu.menuTasks.filter(t => t.name.toLowerCase().includes(menu.menuSearchQuery.toLowerCase())).map(task => (
                                      <button key={task.id} className="synthesis__menu-item" onClick={() => { taskHandlers.handleAddSentenceToExistingTask(sentence.id, task.id, task.name); menu.handleMenuClose(); }} disabled={!sentence.text.trim()}><div className="synthesis__menu-item-content">{task.name}</div></button>
                                    ))}
                                  </div>
                                  <div className="synthesis__menu-create-section"><button className="synthesis__menu-item synthesis__menu-item--create" onClick={() => { taskHandlers.handleCreateNewTaskFromMenu(sentence.id); menu.handleMenuClose(); }} disabled={!sentence.text.trim()}><span className="synthesis__menu-item-create-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span><div className="synthesis__menu-item-content">Loo uus ülesanne</div></button></div>
                                  <div className="synthesis__menu-divider" />
                                </>
                              ) : <button className="synthesis__menu-item" onClick={() => { menu.handleMenuClose(); setShowLoginModal(true); }} disabled={!sentence.text.trim()}><div className="synthesis__menu-item-content">Lisa ülesandesse</div></button>}
                              <button className="synthesis__menu-item" onClick={() => { variants.handleExplorePhonetic(sentence.id); menu.handleMenuClose(); }} disabled={!sentence.text.trim()}><div className="synthesis__menu-item-content">Uuri foneetilist kuju</div></button>
                              <button className="synthesis__menu-item" onClick={() => { synthesis.handleDownload(sentence.id); menu.handleMenuClose(); }} disabled={!sentence.text.trim()}><div className="synthesis__menu-item-content">Lae alla .wav fail</div></button>
                              <button className="synthesis__menu-item synthesis__menu-item--danger" onClick={() => { synthesis.handleRemoveSentence(sentence.id); menu.handleMenuClose(); }}><div className="synthesis__menu-item-content">Eemalda</div></button>
                            </div>
                          </>
                        ) : undefined}
                      />
                    ))}
                    <div className="add-sentence-button-wrapper"><button className="button button--secondary" onClick={synthesis.handleAddSentence} data-onboarding-target="add-sentence-button">Lisa lause</button></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {selectedTaskId ? (
                  <div className="page-content"><TaskDetailView taskId={selectedTaskId} onBack={handleBackToTaskList} onEditTask={taskHandlers.handleEditTask} onDeleteTask={taskHandlers.handleDeleteTask} onAddEntryFromInput={() => {}} onAddEntry={() => {}} /></div>
                ) : (
                  <>
                    <div className="page-header page-header--with-actions"><h1 className="page-header__title">Ülesanded</h1><div className="page-header__actions"><button onClick={taskHandlers.handleCreateTask} className="button button--primary">Lisa</button></div></div>
                    <div className="page-content"><TaskManager onCreateTask={taskHandlers.handleCreateTask} onEditTask={taskHandlers.handleEditTask} onViewTask={handleViewTask} onDeleteTask={taskHandlers.handleDeleteTask} onShareTask={taskHandlers.handleShareTask} refreshTrigger={taskHandlers.taskRefreshTrigger} /></div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      <footer className="page-layout__footer page-footer--full"><Footer /></footer>

      <PronunciationVariants word={variants.variantsWord} isOpen={variants.isVariantsPanelOpen} onClose={variants.handleCloseVariants} onUseVariant={handleUseVariant} customPhoneticForm={variants.variantsCustomPhonetic} />
      {variants.sentencePhoneticId && <SentencePhoneticPanel sentenceText={synthesis.sentences.find(s => s.id === variants.sentencePhoneticId)?.text || ''} phoneticText={synthesis.sentences.find(s => s.id === variants.sentencePhoneticId)?.phoneticText || null} isOpen={variants.showSentencePhoneticPanel} onClose={variants.handleCloseSentencePhonetic} onApply={(newPhoneticText) => synthesis.handleSentencePhoneticApply(variants.sentencePhoneticId!, newPhoneticText)} />}

      <AddEntryModal isOpen={taskHandlers.showAddTaskModal} onClose={() => taskHandlers.setShowAddTaskModal(false)} onAdd={taskHandlers.handleAddTask} />
      <TaskCreationModal isOpen={taskHandlers.showTaskCreationModal} onClose={() => taskHandlers.setShowTaskCreationModal(false)} onCreateTask={taskHandlers.handleTaskCreated} onAddToExistingTask={async (taskId, entries, taskName) => { if (!user) return; try { await DataService.getInstance().addTextEntriesToTask(user.id, taskId, entries); taskHandlers.setShowTaskCreationModal(false); showNotification('success', 'Lisatud ülesandesse', `${entries.length} lauset lisatud ülesandesse ${taskName}!`); } catch { showNotification('error', 'Lausungite lisamine ebaõnnestus'); } }} playlistEntries={synthesis.sentences.filter(s => s.text.trim()).map(s => ({ id: s.id, text: s.text, stressedText: s.phoneticText || s.text, audioUrl: s.audioUrl || null, audioBlob: null }))} />
      {taskHandlers.taskToEdit && <TaskEditModal isOpen={taskHandlers.showTaskEditModal} task={taskHandlers.taskToEdit} onClose={() => { taskHandlers.setShowTaskEditModal(false); taskHandlers.setTaskToEdit(null); }} onSave={taskHandlers.handleTaskUpdated} />}
      {taskHandlers.taskToShare && <ShareTaskModal isOpen={taskHandlers.showShareTaskModal} shareToken={taskHandlers.taskToShare.shareToken} taskName={taskHandlers.taskToShare.name} onClose={() => { taskHandlers.setShowShareTaskModal(false); taskHandlers.setTaskToShare(null); }} />}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} message="Sisene, et luua ja hallata ülesandeid" />
      <ConfirmationModal isOpen={taskHandlers.showDeleteConfirmation} title="Kustuta ülesanne" message={`Kas oled kindel, et soovid ülesande "${taskHandlers.taskToDelete?.name}" kustutada?`} confirmText="Kustuta" cancelText="Tühista" onConfirm={taskHandlers.handleConfirmDelete} onCancel={taskHandlers.handleCancelDelete} variant="danger" />
      {isWizardActive && <OnboardingWizard />}
    </div>
  );
}
