// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import type { SentenceState } from "@/types/synthesis";
import type { SynthesisPageContextValue } from "@/features/synthesis/contexts/SynthesisPageContext";

export const makeSentence = (id: string, text: string, overrides?: Partial<SentenceState>): SentenceState => ({
  id, text, tags: text ? text.split(" ") : [], isPlaying: false, isLoading: false,
  currentInput: "", phoneticText: null, audioUrl: null, stressedTags: null, ...overrides,
});

export const defaultSentences = (): SentenceState[] => [makeSentence("s1", "hello world"), makeSentence("s2", "foo bar")];

export function createMockContext(overrides?: Record<string, unknown>): SynthesisPageContextValue {
  const base = {
    synthesis: {
      sentences: defaultSentences(), isPlayingAll: false, isLoadingPlayAll: false, openTagMenu: null, editingTag: null,
      setSentences: vi.fn(), setOpenTagMenu: vi.fn(), handlePlay: vi.fn(), handlePlayAll: vi.fn(),
      handleTextChange: vi.fn(), handleKeyDown: vi.fn(), handleInputBlur: vi.fn(), handleClearSentence: vi.fn(),
      handleAddSentence: vi.fn(), handleRemoveSentence: vi.fn(), handleDownload: vi.fn(), handleCopyText: vi.fn(),
      handleUseVariant: vi.fn(), handleEditTag: vi.fn(), handleDeleteTag: vi.fn(), handleEditTagChange: vi.fn(),
      handleEditTagKeyDown: vi.fn(), handleEditTagCommit: vi.fn(), handleSentencePhoneticApply: vi.fn(), setDemoSentences: vi.fn(),
    },
    taskHandlers: {
      modals: {
        showAddToTaskDropdown: false, setShowAddToTaskDropdown: vi.fn(), showAddTaskModal: false, setShowAddTaskModal: vi.fn(),
        showTaskEditModal: false, setShowTaskEditModal: vi.fn(), taskToEdit: null, setTaskToEdit: vi.fn(),
        taskToShare: null, showShareTaskModal: false, setShowShareTaskModal: vi.fn(), setTaskToShare: vi.fn(),
        showDeleteConfirmation: false, taskToDelete: null, setTaskToDelete: vi.fn(),
        taskRefreshTrigger: 0, setTaskRefreshTrigger: vi.fn(), pendingSentenceId: null, setPendingSentenceId: vi.fn(),
        isTaskCreationFromTasksView: false, setIsTaskCreationFromTasksView: vi.fn(),
      },
      crud: { handleCreateNewTaskFromMenu: vi.fn(), handleCreateTask: vi.fn(), handleAddTask: vi.fn(),
        handleEditTask: vi.fn(), handleTaskUpdated: vi.fn(), handleDeleteTask: vi.fn(), handleConfirmDelete: vi.fn(), handleCancelDelete: vi.fn() },
      entries: { handleAddAllSentencesToTask: vi.fn(), handleSelectTaskFromDropdown: vi.fn(),
        handleCreateNewFromDropdown: vi.fn(), handleAddSentenceToExistingTask: vi.fn() },
      sharing: { handleShareTask: vi.fn(), handleRevokeShare: vi.fn() },
    },
    dragDrop: { draggedId: null, dragOverId: null, handleDragStart: vi.fn(), handleDragEnd: vi.fn(),
      handleDragOver: vi.fn(), handleDragLeave: vi.fn(), handleDrop: vi.fn() },
    variants: { selectedSentenceId: null, selectedTagIndex: null, sentencePhoneticId: null,
      isVariantsPanelOpen: false, showSentencePhoneticPanel: false, loadingVariantsTag: null,
      handleOpenVariantsFromMenu: vi.fn(), handleExplorePhonetic: vi.fn() },
    menu: { openMenuId: null, menuAnchorEl: {} as Record<string, HTMLElement | null>, menuSearchQuery: "",
      isLoadingMenuTasks: false, menuTasks: [], handleMenuOpen: vi.fn(), handleMenuClose: vi.fn(), setMenuSearchQuery: vi.fn() },
    isAuthenticated: true, onLogin: vi.fn(), handleUseVariant: vi.fn(), handleTagMenuOpen: vi.fn(), handleTagMenuClose: vi.fn(),
  };
  if (overrides) {
    if (overrides.sentences) { base.synthesis.sentences = overrides.sentences as SentenceState[]; }
    for (const key of ["variants", "dragDrop", "menu"] as const) {
      if (overrides[key]) { Object.assign(base[key], overrides[key]); }
    }
  }
  return base as unknown as SynthesisPageContextValue;
}
