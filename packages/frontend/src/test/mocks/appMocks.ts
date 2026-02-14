// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";

type MockFn = ReturnType<typeof vi.fn>;

export const mockAuthContext = (): {
  user: null;
  isAuthenticated: false;
  isLoading: false;
  error: null;
  showLoginModal: false;
  setShowLoginModal: ReturnType<typeof vi.fn>;
  login: ReturnType<typeof vi.fn>;
  loginWithTara: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  refreshSession: ReturnType<typeof vi.fn>;
  handleCodeCallback: ReturnType<typeof vi.fn>;
  handleTaraTokens: ReturnType<typeof vi.fn>;
} => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  showLoginModal: false,
  setShowLoginModal: vi.fn(),
  login: vi.fn(),
  loginWithTara: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  handleCodeCallback: vi.fn(),
  handleTaraTokens: vi.fn(),
});

export const mockNotificationContext = (): { showNotification: ReturnType<typeof vi.fn> } => ({ showNotification: vi.fn() });

export const mockOnboardingContext = (): {
  state: { completed: true; selectedRole: string; currentStep: number; skipped: false };
  isWizardActive: false;
  resetOnboarding: ReturnType<typeof vi.fn>;
  isLoading: false;
  nextStep: ReturnType<typeof vi.fn>;
  prevStep: ReturnType<typeof vi.fn>;
  skipWizard: ReturnType<typeof vi.fn>;
  selectRole: ReturnType<typeof vi.fn>;
  completeWizard: ReturnType<typeof vi.fn>;
  currentSteps: never[];
} => ({
  state: {
    completed: true,
    selectedRole: "teacher",
    currentStep: 0,
    skipped: false,
  },
  isWizardActive: false,
  resetOnboarding: vi.fn(),
  isLoading: false,
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  skipWizard: vi.fn(),
  selectRole: vi.fn(),
  completeWizard: vi.fn(),
  currentSteps: [],
});

export const mockSynthesis = (): {
  sentences: { id: string; text: string; tags: never[]; isPlaying: false; isLoading: false; currentInput: string }[];
  setSentences: MockFn; isPlayingAll: false; isLoadingPlayAll: false; editingTag: null; openTagMenu: null;
  setOpenTagMenu: MockFn; setDemoSentences: MockFn; handleTextChange: MockFn; handleClearSentence: MockFn;
  handleAddSentence: MockFn; handleRemoveSentence: MockFn; handleInputBlur: MockFn; handleKeyDown: MockFn;
  handlePlay: MockFn; handlePlayAll: MockFn; handleDownload: MockFn; handleCopyText: MockFn;
  handleDeleteTag: MockFn; handleEditTag: MockFn; handleEditTagChange: MockFn; handleEditTagCommit: MockFn;
  handleEditTagKeyDown: MockFn; handleUseVariant: MockFn; handleSentencePhoneticApply: MockFn; synthesizeAndPlay: MockFn;
} => ({
  sentences: [
    {
      id: "1",
      text: "",
      tags: [],
      isPlaying: false,
      isLoading: false,
      currentInput: "",
    },
  ],
  setSentences: vi.fn(),
  isPlayingAll: false,
  isLoadingPlayAll: false,
  editingTag: null,
  openTagMenu: null,
  setOpenTagMenu: vi.fn(),
  setDemoSentences: vi.fn(),
  handleTextChange: vi.fn(),
  handleClearSentence: vi.fn(),
  handleAddSentence: vi.fn(),
  handleRemoveSentence: vi.fn(),
  handleInputBlur: vi.fn(),
  handleKeyDown: vi.fn(),
  handlePlay: vi.fn(),
  handlePlayAll: vi.fn(),
  handleDownload: vi.fn(),
  handleCopyText: vi.fn(),
  handleDeleteTag: vi.fn(),
  handleEditTag: vi.fn(),
  handleEditTagChange: vi.fn(),
  handleEditTagCommit: vi.fn(),
  handleEditTagKeyDown: vi.fn(),
  handleUseVariant: vi.fn(),
  handleSentencePhoneticApply: vi.fn(),
  synthesizeAndPlay: vi.fn(),
});

export const mockTaskHandlers = () => ({
  modals: {
    showAddToTaskDropdown: false,
    setShowAddToTaskDropdown: vi.fn(),
    taskRefreshTrigger: 0,
    showAddTaskModal: false,
    setShowAddTaskModal: vi.fn(),
    showTaskEditModal: false,
    setShowTaskEditModal: vi.fn(),
    taskToEdit: null,
    setTaskToEdit: vi.fn(),
    showShareTaskModal: false,
    setShowShareTaskModal: vi.fn(),
    taskToShare: null,
    setTaskToShare: vi.fn(),
    showDeleteConfirmation: false,
    setShowDeleteConfirmation: vi.fn(),
    taskToDelete: null,
    setTaskToDelete: vi.fn(),
    setTaskRefreshTrigger: vi.fn(),
    pendingSentenceId: null,
    setPendingSentenceId: vi.fn(),
    isTaskCreationFromTasksView: false,
    setIsTaskCreationFromTasksView: vi.fn(),
  },
  crud: {
    handleCreateNewTaskFromMenu: vi.fn(),
    handleCreateTask: vi.fn(),
    handleAddTask: vi.fn(),
    handleEditTask: vi.fn(),
    handleTaskUpdated: vi.fn().mockResolvedValue(undefined),
    handleDeleteTask: vi.fn(),
    handleConfirmDelete: vi.fn(),
    handleCancelDelete: vi.fn(),
  },
  entries: {
    handleAddAllSentencesToTask: vi.fn(),
    handleSelectTaskFromDropdown: vi.fn(),
    handleCreateNewFromDropdown: vi.fn(),
    handleAddSentenceToExistingTask: vi.fn(),
  },
  sharing: {
    handleShareTask: vi.fn(),
    handleRevokeShare: vi.fn(),
  },
});

export const mockDragAndDrop = (): {
  draggedId: null; dragOverId: null;
  handleDragStart: MockFn; handleDragEnd: MockFn; handleDragOver: MockFn; handleDragLeave: MockFn; handleDrop: MockFn;
} => ({
  draggedId: null,
  dragOverId: null,
  handleDragStart: vi.fn(),
  handleDragEnd: vi.fn(),
  handleDragOver: vi.fn(),
  handleDragLeave: vi.fn(),
  handleDrop: vi.fn(),
});

export const mockVariantsPanel = (): {
  isVariantsPanelOpen: false; variantsWord: string; selectedSentenceId: null; selectedTagIndex: null;
  variantsCustomPhonetic: string; setVariantsCustomPhonetic: MockFn; handleOpenVariantsFromMenu: MockFn;
  handleCloseVariants: MockFn; showSentencePhoneticPanel: false; sentencePhoneticId: null;
  handleExplorePhonetic: MockFn; handleCloseSentencePhonetic: MockFn;
} => ({
  isVariantsPanelOpen: false,
  variantsWord: "",
  selectedSentenceId: null,
  selectedTagIndex: null,
  variantsCustomPhonetic: "",
  setVariantsCustomPhonetic: vi.fn(),
  handleOpenVariantsFromMenu: vi.fn(),
  handleCloseVariants: vi.fn(),
  showSentencePhoneticPanel: false,
  sentencePhoneticId: null,
  handleExplorePhonetic: vi.fn(),
  handleCloseSentencePhonetic: vi.fn(),
});

export const mockSentenceMenu = (): {
  openMenuId: null; menuAnchorEl: Record<string, never>; menuSearchQuery: string; setMenuSearchQuery: MockFn;
  menuTasks: never[]; isLoadingMenuTasks: false; handleMenuOpen: MockFn; handleMenuClose: MockFn;
} => ({
  openMenuId: null,
  menuAnchorEl: {},
  menuSearchQuery: "",
  setMenuSearchQuery: vi.fn(),
  menuTasks: [],
  isLoadingMenuTasks: false,
  handleMenuOpen: vi.fn(),
  handleMenuClose: vi.fn(),
});
