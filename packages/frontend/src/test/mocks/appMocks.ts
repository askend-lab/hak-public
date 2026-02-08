// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { vi } from "vitest";

export const mockAuthContext = () => ({
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

export const mockNotificationContext = () => ({ showNotification: vi.fn() });

export const mockOnboardingContext = () => ({
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

export const mockSynthesis = () => ({
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
  showAddToTaskDropdown: false,
  setShowAddToTaskDropdown: vi.fn(),
  handleAddAllSentencesToTask: vi.fn(),
  handleSelectTaskFromDropdown: vi.fn(),
  handleCreateNewFromDropdown: vi.fn(),
  handleCreateTask: vi.fn(),
  handleEditTask: vi.fn(),
  handleDeleteTask: vi.fn(),
  handleShareTask: vi.fn(),
  handleAddSentenceToExistingTask: vi.fn(),
  handleCreateNewTaskFromMenu: vi.fn(),
  taskRefreshTrigger: 0,
  showAddTaskModal: false,
  setShowAddTaskModal: vi.fn(),
  handleAddTask: vi.fn(),
  showTaskEditModal: false,
  setShowTaskEditModal: vi.fn(),
  taskToEdit: null,
  setTaskToEdit: vi.fn(),
  handleTaskUpdated: vi.fn().mockResolvedValue(undefined),
  showShareTaskModal: false,
  setShowShareTaskModal: vi.fn(),
  taskToShare: null,
  setTaskToShare: vi.fn(),
  showDeleteConfirmation: false,
  taskToDelete: null,
  handleConfirmDelete: vi.fn(),
  handleCancelDelete: vi.fn(),
});

export const mockDragAndDrop = () => ({
  draggedId: null,
  dragOverId: null,
  handleDragStart: vi.fn(),
  handleDragEnd: vi.fn(),
  handleDragOver: vi.fn(),
  handleDragLeave: vi.fn(),
  handleDrop: vi.fn(),
});

export const mockVariantsPanel = () => ({
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

export const mockSentenceMenu = () => ({
  openMenuId: null,
  menuAnchorEl: {},
  menuSearchQuery: "",
  setMenuSearchQuery: vi.fn(),
  menuTasks: [],
  isLoadingMenuTasks: false,
  handleMenuOpen: vi.fn(),
  handleMenuClose: vi.fn(),
});
