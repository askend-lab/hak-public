// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SynthesisView from "./SynthesisView";
import { SentenceState } from "@/types/synthesis";

interface MockHeaderProps {
  sentenceCount: number;
  onPlayAllClick: () => void;
}
interface MockItemProps {
  id: string;
  text: string;
  tags: string[];
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
}

vi.mock("./SynthesisPageHeader", () => ({
  default: ({ sentenceCount, onPlayAllClick }: MockHeaderProps) => (
    <div data-testid="header" data-count={sentenceCount}>
      <button onClick={onPlayAllClick}>Play All</button>
    </div>
  ),
}));

vi.mock("./SentenceSynthesisItem", () => ({
  default: (props: MockItemProps) => (
    <div
      data-testid={`item-${props.id}`}
      data-text={props.text}
      data-is-playing={String(props.isPlaying)}
      data-is-loading={String(props.isLoading)}
      data-is-dragging={String(props.isDragging)}
      data-is-drag-over={String(props.isDragOver)}
      data-current-input={props.currentInput}
      data-selected-tag-index={props.selectedTagIndex ?? "null"}
      data-pronunciation-panel-open={String(props.isPronunciationPanelOpen)}
      data-loading-tag-index={props.loadingTagIndex ?? "null"}
      data-sentence-index={props.sentenceIndex}
    >
      {props.menuContent}
    </div>
  ),
}));

vi.mock("./SentenceMenu", () => ({
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

const baseProps = {
  sentences: [makeSentence("s1", "hello world"), makeSentence("s2", "foo bar")],
  isPlayingAll: false,
  isLoadingPlayAll: false,
  openTagMenu: null,
  editingTag: null,
  draggedId: null,
  dragOverId: null,
  isAuthenticated: true,
  menuOpenId: null,
  menuAnchorEl: {} as Record<string, HTMLElement | null>,
  menuSearchQuery: "",
  isLoadingMenuTasks: false,
  menuTasks: [],
  showAddToTaskDropdown: false,
  variantsSelectedSentenceId: null,
  variantsSelectedTagIndex: null,
  sentencePhoneticId: null,
  isVariantsPanelOpen: false,
  showSentencePhoneticPanel: false,
  loadingVariantsTag: null,
  onAddAllClick: vi.fn(),
  onPlayAllClick: vi.fn(),
  onDropdownClose: vi.fn(),
  onSelectTask: vi.fn(),
  onCreateNew: vi.fn(),
  onPlay: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDragOver: vi.fn(),
  onDragLeave: vi.fn(),
  onDrop: vi.fn(),
  onTagMenuOpen: vi.fn(),
  onTagMenuClose: vi.fn(),
  onOpenVariantsFromMenu: vi.fn(),
  onEditTag: vi.fn(),
  onDeleteTag: vi.fn(),
  onEditTagChange: vi.fn(),
  onEditTagKeyDown: vi.fn(),
  onEditTagCommit: vi.fn(),
  onInputChange: vi.fn(),
  onInputKeyDown: vi.fn(),
  onInputBlur: vi.fn(),
  onClearSentence: vi.fn(),
  onMenuOpen: vi.fn(),
  onMenuClose: vi.fn(),
  onMenuSearchChange: vi.fn(),
  onAddToTask: vi.fn(),
  onCreateNewTask: vi.fn(),
  onExplorePhonetic: vi.fn(),
  onDownload: vi.fn(),
  onCopyText: vi.fn(),
  onRemoveSentence: vi.fn(),
  onLogin: vi.fn(),
  onAddSentence: vi.fn(),
};

/**
 * Mutation-killing tests for SynthesisView
 * Targets: sentenceCount filter, isPlaying/isLoading defaults, currentInput ??,
 * isPronunciationPanelOpen logic, selectedTagIndex logic, loadingTagIndex logic,
 * isMenuOpen logic, SentenceItem conditional rendering
 */
describe("SynthesisView mutation kills", () => {
  it("sentenceCount filters by non-empty trimmed text", () => {
    const sentences = [
      makeSentence("s1", "hello"),
      makeSentence("s2", ""),
      makeSentence("s3", "   "),
    ];
    render(<SynthesisView {...baseProps} sentences={sentences} />);
    const header = screen.getByTestId("header");
    // Only "hello" has non-empty trimmed text
    expect(header.dataset.count).toBe("1");
  });

  it("isPlaying defaults to false via ?? operator", () => {
    const sentences = [makeSentence("s1", "hello", { isPlaying: undefined as unknown as boolean })];
    render(<SynthesisView {...baseProps} sentences={sentences} />);
    expect(screen.getByTestId("item-s1").dataset.isPlaying).toBe("false");
  });

  it("isLoading defaults to false via ?? operator", () => {
    const sentences = [makeSentence("s1", "hello", { isLoading: undefined as unknown as boolean })];
    render(<SynthesisView {...baseProps} sentences={sentences} />);
    expect(screen.getByTestId("item-s1").dataset.isLoading).toBe("false");
  });

  it("currentInput uses ?? operator to default to empty string", () => {
    const sentences = [makeSentence("s1", "hello", { currentInput: undefined as unknown as string })];
    render(<SynthesisView {...baseProps} sentences={sentences} />);
    expect(screen.getByTestId("item-s1").dataset.currentInput).toBe("");
  });

  it("isPronunciationPanelOpen is true when isVariantsPanelOpen is true", () => {
    render(<SynthesisView {...baseProps} isVariantsPanelOpen={true} />);
    expect(screen.getByTestId("item-s1").dataset.pronunciationPanelOpen).toBe("true");
  });

  it("isPronunciationPanelOpen is true when showSentencePhoneticPanel is true", () => {
    render(<SynthesisView {...baseProps} showSentencePhoneticPanel={true} />);
    expect(screen.getByTestId("item-s1").dataset.pronunciationPanelOpen).toBe("true");
  });

  it("isPronunciationPanelOpen is false when both are false", () => {
    render(<SynthesisView {...baseProps} />);
    expect(screen.getByTestId("item-s1").dataset.pronunciationPanelOpen).toBe("false");
  });

  it("selectedTagIndex is set when variantsSelectedSentenceId matches", () => {
    render(
      <SynthesisView
        {...baseProps}
        isVariantsPanelOpen={true}
        variantsSelectedSentenceId="s1"
        variantsSelectedTagIndex={2}
      />,
    );
    expect(screen.getByTestId("item-s1").dataset.selectedTagIndex).toBe("2");
  });

  it("selectedTagIndex is null when sentenceId doesn't match", () => {
    render(
      <SynthesisView
        {...baseProps}
        isVariantsPanelOpen={true}
        variantsSelectedSentenceId="s2"
        variantsSelectedTagIndex={2}
      />,
    );
    expect(screen.getByTestId("item-s1").dataset.selectedTagIndex).toBe("null");
  });

  it("selectedTagIndex via sentencePhoneticId match", () => {
    render(
      <SynthesisView
        {...baseProps}
        showSentencePhoneticPanel={true}
        sentencePhoneticId="s1"
        variantsSelectedTagIndex={3}
      />,
    );
    expect(screen.getByTestId("item-s1").dataset.selectedTagIndex).toBe("3");
  });

  it("loadingTagIndex is set when loadingVariantsTag sentenceId matches", () => {
    render(
      <SynthesisView
        {...baseProps}
        loadingVariantsTag={{ sentenceId: "s1", tagIndex: 5 }}
      />,
    );
    expect(screen.getByTestId("item-s1").dataset.loadingTagIndex).toBe("5");
  });

  it("loadingTagIndex is null when loadingVariantsTag sentenceId doesn't match", () => {
    render(
      <SynthesisView
        {...baseProps}
        loadingVariantsTag={{ sentenceId: "s2", tagIndex: 5 }}
      />,
    );
    expect(screen.getByTestId("item-s1").dataset.loadingTagIndex).toBe("null");
  });

  it("renders menu when menuOpenId matches and anchorEl exists", () => {
    const el = document.createElement("div");
    render(
      <SynthesisView
        {...baseProps}
        menuOpenId="s1"
        menuAnchorEl={{ s1: el }}
      />,
    );
    expect(screen.getByTestId("menu-s1")).toBeInTheDocument();
  });

  it("does not render menu when menuOpenId matches but no anchorEl", () => {
    render(
      <SynthesisView
        {...baseProps}
        menuOpenId="s1"
        menuAnchorEl={{}}
      />,
    );
    expect(screen.queryByTestId("menu-s1")).not.toBeInTheDocument();
  });

  it("isDragging is true when draggedId matches sentence id", () => {
    render(<SynthesisView {...baseProps} draggedId="s1" />);
    expect(screen.getByTestId("item-s1").dataset.isDragging).toBe("true");
    expect(screen.getByTestId("item-s2").dataset.isDragging).toBe("false");
  });

  it("isDragOver is true when dragOverId matches sentence id", () => {
    render(<SynthesisView {...baseProps} dragOverId="s2" />);
    expect(screen.getByTestId("item-s2").dataset.isDragOver).toBe("true");
    expect(screen.getByTestId("item-s1").dataset.isDragOver).toBe("false");
  });

  it("sentenceIndex is passed correctly", () => {
    render(<SynthesisView {...baseProps} />);
    expect(screen.getByTestId("item-s1").dataset.sentenceIndex).toBe("0");
    expect(screen.getByTestId("item-s2").dataset.sentenceIndex).toBe("1");
  });

  it("add sentence button has data-onboarding-target", () => {
    render(<SynthesisView {...baseProps} />);
    const btn = screen.getByText("Lisa lause");
    expect(btn.getAttribute("data-onboarding-target")).toBe("add-sentence-button");
  });
});
