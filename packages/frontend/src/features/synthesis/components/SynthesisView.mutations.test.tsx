// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SynthesisView from "./SynthesisView";
import { SentenceState } from "@/types/synthesis";
import type { SynthesisPageContextValue } from "@/features/synthesis/contexts/SynthesisPageContext";

interface MockHeaderProps {
  sentenceCount: number;
  onPlayAllClick: () => void;
}
interface MockItemProps {
  id: string;
  text: string;
  tags: string[];
  mode: string;
  draggable: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  currentInput: string;
  selectedTagIndex: number | null;
  isPronunciationPanelOpen: boolean;
  loadingTagIndex: number | null;
  menuContent: React.ReactNode;
  sentenceIndex: number;
  tagMenuItems: { label: string; danger?: boolean }[];
}

let mockContextValue: SynthesisPageContextValue;

vi.mock("@/features/synthesis/contexts/SynthesisPageContext", () => ({
  useSynthesisPage: () => mockContextValue,
}));

vi.mock("@/features/synthesis/components/SynthesisPageHeader", () => ({
  default: ({ sentenceCount, onPlayAllClick }: MockHeaderProps) => (
    <div data-testid="header" data-count={sentenceCount}>
      <button onClick={onPlayAllClick}>Play All</button>
    </div>
  ),
}));

vi.mock("@/features/synthesis/components/SentenceSynthesisItem", () => ({
  default: (props: MockItemProps) => (
    <div
      data-testid={`item-${props.id}`}
      data-text={props.text}
      data-tags={JSON.stringify(props.tags)}
      data-mode={props.mode}
      data-draggable={String(props.draggable)}
      data-is-playing={String(props.isPlaying)}
      data-is-loading={String(props.isLoading)}
      data-is-dragging={String(props.isDragging)}
      data-is-drag-over={String(props.isDragOver)}
      data-current-input={props.currentInput}
      data-selected-tag-index={props.selectedTagIndex ?? "null"}
      data-pronunciation-panel-open={String(props.isPronunciationPanelOpen)}
      data-loading-tag-index={props.loadingTagIndex ?? "null"}
      data-sentence-index={props.sentenceIndex}
      data-has-danger-menu={String(props.tagMenuItems?.some(i => i.danger) ?? false)}
    >
      {props.menuContent}
    </div>
  ),
}));

vi.mock("@/features/synthesis/components/SentenceMenu", () => ({
  default: ({ sentenceId }: { sentenceId: string }) => (
    <div data-testid={`menu-${sentenceId}`} />
  ),
}));

const makeSentence = (id: string, text: string, overrides?: Partial<SentenceState>): SentenceState => ({
  id,
  text,
  tags: text ? text.split(" ") : [],
  isPlaying: false,
  isLoading: false,
  currentInput: "",
  phoneticText: null,
  audioUrl: null,
  stressedTags: null,
  ...overrides,
});

const defaultSentences = () => [makeSentence("s1", "hello world"), makeSentence("s2", "foo bar")];

function createMockContext(overrides?: {
  sentences?: SentenceState[];
  variants?: Partial<SynthesisPageContextValue["variants"]>;
  dragDrop?: Partial<SynthesisPageContextValue["dragDrop"]>;
  menu?: Partial<SynthesisPageContextValue["menu"]>;
}): SynthesisPageContextValue {
  const baseMock: SynthesisPageContextValue = {
    synthesis: {
      sentences: overrides?.sentences ?? defaultSentences(),
      isPlayingAll: false,
      isLoadingPlayAll: false,
      openTagMenu: null,
      editingTag: null,
      setSentences: vi.fn(),
      setOpenTagMenu: vi.fn(),
      handlePlay: vi.fn(),
      handlePlayAll: vi.fn(),
      handleTextChange: vi.fn(),
      handleKeyDown: vi.fn(),
      handleInputBlur: vi.fn(),
      handleClearSentence: vi.fn(),
      handleAddSentence: vi.fn(),
      handleRemoveSentence: vi.fn(),
      handleDownload: vi.fn(),
      handleCopyText: vi.fn(),
      handleUseVariant: vi.fn(),
      handleEditTag: vi.fn(),
      handleDeleteTag: vi.fn(),
      handleEditTagChange: vi.fn(),
      handleEditTagKeyDown: vi.fn(),
      handleEditTagCommit: vi.fn(),
      handleSentencePhoneticApply: vi.fn(),
      setDemoSentences: vi.fn(),
    } as unknown as SynthesisPageContextValue["synthesis"],
    taskHandlers: {
      modals: {
        showAddToTaskDropdown: false,
        setShowAddToTaskDropdown: vi.fn(),
        showAddTaskModal: false,
        setShowAddTaskModal: vi.fn(),
        showTaskEditModal: false,
        setShowTaskEditModal: vi.fn(),
        taskToEdit: null,
        setTaskToEdit: vi.fn(),
        taskToShare: null,
        showShareTaskModal: false,
        setShowShareTaskModal: vi.fn(),
        setTaskToShare: vi.fn(),
        showDeleteConfirmation: false,
        taskToDelete: null,
        setTaskToDelete: vi.fn(),
        taskRefreshTrigger: 0,
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
        handleTaskUpdated: vi.fn(),
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
    } as unknown as SynthesisPageContextValue["taskHandlers"],
    dragDrop: {
      draggedId: null,
      dragOverId: null,
      handleDragStart: vi.fn(),
      handleDragEnd: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragLeave: vi.fn(),
      handleDrop: vi.fn(),
      ...(overrides?.dragDrop ?? {}),
    } as unknown as SynthesisPageContextValue["dragDrop"],
    variants: {
      selectedSentenceId: null,
      selectedTagIndex: null,
      sentencePhoneticId: null,
      isVariantsPanelOpen: false,
      showSentencePhoneticPanel: false,
      loadingVariantsTag: null,
      handleOpenVariantsFromMenu: vi.fn(),
      handleExplorePhonetic: vi.fn(),
      ...(overrides?.variants ?? {}),
    } as unknown as SynthesisPageContextValue["variants"],
    menu: {
      openMenuId: null,
      menuAnchorEl: {} as Record<string, HTMLElement | null>,
      menuSearchQuery: "",
      isLoadingMenuTasks: false,
      menuTasks: [],
      handleMenuOpen: vi.fn(),
      handleMenuClose: vi.fn(),
      setMenuSearchQuery: vi.fn(),
      ...(overrides?.menu ?? {}),
    } as unknown as SynthesisPageContextValue["menu"],
    isAuthenticated: true,
    onLogin: vi.fn(),
    handleUseVariant: vi.fn(),
    handleTagMenuOpen: vi.fn(),
    handleTagMenuClose: vi.fn(),
  };
  return baseMock;
}

/**
 * Mutation-killing tests for SynthesisView
 * Targets: sentenceCount filter, isPlaying/isLoading defaults, currentInput ??,
 * isPronunciationPanelOpen logic, selectedTagIndex logic, loadingTagIndex logic,
 * isMenuOpen logic, SentenceItem conditional rendering
 */
describe("SynthesisView mutation kills", () => {
  beforeEach(() => {
    mockContextValue = createMockContext();
  });

  it("sentenceCount filters by non-empty trimmed text", () => {
    mockContextValue = createMockContext({
      sentences: [makeSentence("s1", "hello"), makeSentence("s2", ""), makeSentence("s3", "   ")],
    });
    render(<SynthesisView />);
    const header = screen.getByTestId("header");
    expect(header.dataset.count).toBe("1");
  });

  it("isPlaying defaults to false via ?? operator", () => {
    mockContextValue = createMockContext({
      sentences: [makeSentence("s1", "hello", { isPlaying: undefined as unknown as boolean })],
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.isPlaying).toBe("false");
  });

  it("isLoading defaults to false via ?? operator", () => {
    mockContextValue = createMockContext({
      sentences: [makeSentence("s1", "hello", { isLoading: undefined as unknown as boolean })],
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.isLoading).toBe("false");
  });

  it("currentInput uses ?? operator to default to empty string", () => {
    mockContextValue = createMockContext({
      sentences: [makeSentence("s1", "hello", { currentInput: undefined as unknown as string })],
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.currentInput).toBe("");
  });

  it("isPronunciationPanelOpen is true when isVariantsPanelOpen is true", () => {
    mockContextValue = createMockContext({ variants: { isVariantsPanelOpen: true } });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.pronunciationPanelOpen).toBe("true");
  });

  it("isPronunciationPanelOpen is true when showSentencePhoneticPanel is true", () => {
    mockContextValue = createMockContext({ variants: { showSentencePhoneticPanel: true } });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.pronunciationPanelOpen).toBe("true");
  });

  it("isPronunciationPanelOpen is false when both are false", () => {
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.pronunciationPanelOpen).toBe("false");
  });

  it("selectedTagIndex is set when variantsSelectedSentenceId matches", () => {
    mockContextValue = createMockContext({
      variants: { isVariantsPanelOpen: true, selectedSentenceId: "s1", selectedTagIndex: 2 },
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.selectedTagIndex).toBe("2");
  });

  it("selectedTagIndex is null when sentenceId doesn't match", () => {
    mockContextValue = createMockContext({
      variants: { isVariantsPanelOpen: true, selectedSentenceId: "s2", selectedTagIndex: 2 },
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.selectedTagIndex).toBe("null");
  });

  it("selectedTagIndex via sentencePhoneticId match", () => {
    mockContextValue = createMockContext({
      variants: { showSentencePhoneticPanel: true, sentencePhoneticId: "s1", selectedTagIndex: 3 },
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.selectedTagIndex).toBe("3");
  });

  it("loadingTagIndex is set when loadingVariantsTag sentenceId matches", () => {
    mockContextValue = createMockContext({
      variants: { loadingVariantsTag: { sentenceId: "s1", tagIndex: 5 } },
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.loadingTagIndex).toBe("5");
  });

  it("loadingTagIndex is null when loadingVariantsTag sentenceId doesn't match", () => {
    mockContextValue = createMockContext({
      variants: { loadingVariantsTag: { sentenceId: "s2", tagIndex: 5 } },
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.loadingTagIndex).toBe("null");
  });

  it("renders menu when menuOpenId matches and anchorEl exists", () => {
    const el = document.createElement("div");
    mockContextValue = createMockContext({
      menu: { openMenuId: "s1", menuAnchorEl: { s1: el } },
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("menu-s1")).toBeInTheDocument();
  });

  it("does not render menu when menuOpenId matches but no anchorEl", () => {
    mockContextValue = createMockContext({
      menu: { openMenuId: "s1", menuAnchorEl: {} },
    });
    render(<SynthesisView />);
    expect(screen.queryByTestId("menu-s1")).not.toBeInTheDocument();
  });

  it("isDragging is true when draggedId matches sentence id", () => {
    mockContextValue = createMockContext({ dragDrop: { draggedId: "s1" } });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.isDragging).toBe("true");
    expect(screen.getByTestId("item-s2").dataset.isDragging).toBe("false");
  });

  it("isDragOver is true when dragOverId matches sentence id", () => {
    mockContextValue = createMockContext({ dragDrop: { dragOverId: "s2" } });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s2").dataset.isDragOver).toBe("true");
    expect(screen.getByTestId("item-s1").dataset.isDragOver).toBe("false");
  });

  it("sentenceIndex is passed correctly", () => {
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.sentenceIndex).toBe("0");
    expect(screen.getByTestId("item-s2").dataset.sentenceIndex).toBe("1");
  });

  it("add sentence button has data-onboarding-target", () => {
    render(<SynthesisView />);
    const btn = screen.getByText("Lisa lause");
    expect(btn.getAttribute("data-onboarding-target")).toBe("add-sentence-button");
  });

  it("draggable is true for all items", () => {
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.draggable).toBe("true");
    expect(screen.getByTestId("item-s2").dataset.draggable).toBe("true");
  });

  it("mode is input for all items", () => {
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.mode).toBe("input");
  });

  it("tags falls back to empty array when undefined", () => {
    mockContextValue = createMockContext({
      sentences: [makeSentence("s3", "test", { tags: undefined as unknown as string[] })],
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s3").dataset.tags).toBe("[]");
  });

  it("tagMenuItems includes danger item", () => {
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1").dataset.hasDangerMenu).toBe("true");
  });
});
