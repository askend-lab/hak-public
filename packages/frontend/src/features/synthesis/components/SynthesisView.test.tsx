// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SynthesisView from "./SynthesisView";
import { SentenceState } from "@/types/synthesis";
import type { SynthesisPageContextValue } from "@/features/synthesis/contexts/SynthesisPageContext";

interface MockHeaderProps { onPlayAllClick: () => void }
interface MockItemProps {
  id: string;
  onPlay: (id: string) => void;
  onClear: (id: string) => void;
  menuContent: React.ReactNode;
  onMenuOpenLegacy: (e: React.MouseEvent, id: string) => void;
  onInputKeyDown?: (e: { key: string }) => void;
  onInputBlur?: () => void;
  tagMenuItems?: { label: string; onClick: (id: string, idx: number, word: string) => void }[];
}
interface MockMenuProps { sentenceId: string; onClose: () => void }

let mockContextValue: SynthesisPageContextValue;

vi.mock("@/features/synthesis/contexts/SynthesisPageContext", () => ({
  useSynthesisPage: () => mockContextValue,
  useSynthesisCore: () => mockContextValue,
  useSynthesisInteraction: () => mockContextValue,
}));

vi.mock("@/features/synthesis/components/SynthesisPageHeader", () => ({
  default: ({ onPlayAllClick }: MockHeaderProps) => (
    <div data-testid="header">
      <button onClick={onPlayAllClick}>Play All</button>
    </div>
  ),
}));

vi.mock("@/features/synthesis/components/SentenceSynthesisItem", () => ({
  default: ({
    id,
    onPlay,
    onClear,
    menuContent,
    onMenuOpenLegacy,
    onInputKeyDown,
    onInputBlur,
    tagMenuItems,
  }: MockItemProps) => (
    <div data-testid={`item-${id}`}>
      <button onClick={() => onPlay(id)}>Play {id}</button>
      <button onClick={() => onClear(id)}>Clear {id}</button>
      <button onClick={(e: React.MouseEvent) => onMenuOpenLegacy(e, id)}>
        Menu {id}
      </button>
      {onInputKeyDown && (
        <button onClick={() => onInputKeyDown({ key: "Enter" })}>
          KeyDown {id}
        </button>
      )}
      {onInputBlur && <button onClick={() => onInputBlur()}>Blur {id}</button>}
      {tagMenuItems?.map((item: { label: string; onClick: (id: string, idx: number, word: string) => void }) => (
        <button key={item.label} onClick={() => item.onClick(id, 0, "word")}>
          TagMenu-{item.label}
        </button>
      ))}
      {menuContent}
    </div>
  ),
}));

vi.mock("@/features/synthesis/components/SentenceMenu", () => ({
  default: ({ sentenceId, onClose }: MockMenuProps) => (
    <div data-testid={`menu-${sentenceId}`}>
      <button onClick={onClose}>Close Menu</button>
    </div>
  ),
}));

const makeSentence = (id: string, text: string): SentenceState => ({
  id,
  text,
  tags: text.split(" "),
  isPlaying: false,
  isLoading: false,
  currentInput: "",
  phoneticText: null,
  audioUrl: null,
  stressedTags: null,
});

function createMockContext(
  overrides?: Partial<SynthesisPageContextValue>,
): SynthesisPageContextValue {
  return {
    synthesis: {
      sentences: [makeSentence("s1", "hello world"), makeSentence("s2", "foo bar")],
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
    } as unknown as SynthesisPageContextValue["menu"],
    isAuthenticated: true,
    onLogin: vi.fn(),
    handleUseVariant: vi.fn(),
    handleTagMenuOpen: vi.fn(),
    handleTagMenuClose: vi.fn(),
    ...overrides,
  };
}

describe("SynthesisView", () => {
  beforeEach(() => {
    mockContextValue = createMockContext();
  });

  it("renders header and sentence items", () => {
    render(<SynthesisView />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("item-s1")).toBeInTheDocument();
    expect(screen.getByTestId("item-s2")).toBeInTheDocument();
  });

  it("renders add sentence button", () => {
    render(<SynthesisView />);
    expect(screen.getByText("Lisa lause")).toBeInTheDocument();
  });

  it("calls handleAddSentence when add button clicked", () => {
    render(<SynthesisView />);
    fireEvent.click(screen.getByText("Lisa lause"));
    expect(mockContextValue.synthesis.handleAddSentence).toHaveBeenCalled();
  });

  it("calls handlePlay when play button clicked", () => {
    render(<SynthesisView />);
    fireEvent.click(screen.getByText("Play s1"));
    expect(mockContextValue.synthesis.handlePlay).toHaveBeenCalledWith("s1");
  });

  it("calls handleClearSentence when clear clicked", () => {
    render(<SynthesisView />);
    fireEvent.click(screen.getByText("Clear s1"));
    expect(mockContextValue.synthesis.handleClearSentence).toHaveBeenCalledWith("s1");
  });

  it("renders menu content when openMenuId matches and anchorEl exists", () => {
    const el = document.createElement("div");
    mockContextValue = createMockContext({
      menu: {
        ...createMockContext().menu,
        openMenuId: "s1",
        menuAnchorEl: { s1: el },
      } as SynthesisPageContextValue["menu"],
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("menu-s1")).toBeInTheDocument();
  });

  it("does not render menu when openMenuId does not match", () => {
    mockContextValue = createMockContext({
      menu: {
        ...createMockContext().menu,
        openMenuId: "s3",
      } as SynthesisPageContextValue["menu"],
    });
    render(<SynthesisView />);
    expect(screen.queryByTestId("menu-s1")).not.toBeInTheDocument();
  });

  it("renders tag menu items", () => {
    render(<SynthesisView />);
    expect(screen.getByTestId("item-s1")).toBeInTheDocument();
  });

  it("calls handlePlayAll from header", () => {
    render(<SynthesisView />);
    fireEvent.click(screen.getByText("Play All"));
    expect(mockContextValue.synthesis.handlePlayAll).toHaveBeenCalled();
  });

  it("calls handleKeyDown wrapper with sentence id", () => {
    render(<SynthesisView />);
    fireEvent.click(screen.getByText("KeyDown s1"));
    expect(mockContextValue.synthesis.handleKeyDown).toHaveBeenCalledWith({ key: "Enter" }, "s1");
  });

  it("calls handleInputBlur wrapper with sentence id", () => {
    render(<SynthesisView />);
    fireEvent.click(screen.getByText("Blur s1"));
    expect(mockContextValue.synthesis.handleInputBlur).toHaveBeenCalledWith("s1");
  });

  it("tag menu items invoke correct callbacks", () => {
    render(<SynthesisView />);
    fireEvent.click(screen.getAllByText("TagMenu-Vali sõna häälduskuju")[0]!);
    expect(mockContextValue.variants.handleOpenVariantsFromMenu).toHaveBeenCalledWith("s1", 0, "word");
    fireEvent.click(screen.getAllByText("TagMenu-Muuda sõna kirjakuju")[0]!);
    expect(mockContextValue.synthesis.handleEditTag).toHaveBeenCalledWith("s1", 0);
    fireEvent.click(screen.getAllByText("TagMenu-Kustuta sõna")[0]!);
    expect(mockContextValue.synthesis.handleDeleteTag).toHaveBeenCalledWith("s1", 0);
  });
});
