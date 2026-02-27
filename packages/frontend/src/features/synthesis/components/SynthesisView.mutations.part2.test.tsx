// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SynthesisView from "./SynthesisView";
import type { SynthesisPageContextValue } from "@/features/synthesis/contexts/SynthesisPageContext";
import { createMockContext, makeSentence } from "./SynthesisView.test-helpers";

interface MockHeaderProps { sentenceCount: number; onPlayAllClick: () => void }
interface MockItemProps {
  id: string; text: string; tags: string[]; mode: string; draggable: boolean;
  isPlaying: boolean; isLoading: boolean; isDragging: boolean; isDragOver: boolean;
  currentInput: string; selectedTagIndex: number | null; isPronunciationPanelOpen: boolean;
  loadingTagIndex: number | null; menuContent: React.ReactNode; sentenceIndex: number;
  tagMenuItems: { label: string; danger?: boolean }[];
}

let mockContextValue: SynthesisPageContextValue;

vi.mock("@/features/synthesis/contexts/SynthesisPageContext", () => ({
  useSynthesisPage: () => mockContextValue,
  useSynthesisCore: () => mockContextValue,
  useSynthesisInteraction: () => mockContextValue,
}));

vi.mock("@/features/synthesis/components/SynthesisPageHeader", () => ({
  default: ({ sentenceCount, onPlayAllClick }: MockHeaderProps) => (
    <div data-testid="header" data-count={sentenceCount}><button onClick={onPlayAllClick}>Play All</button></div>
  ),
}));

vi.mock("@/features/synthesis/components/SentenceSynthesisItem", () => ({
  default: (props: MockItemProps) => (
    <div data-testid={`item-${props.id}`} data-text={props.text} data-tags={JSON.stringify(props.tags)}
      data-mode={props.mode} data-draggable={String(props.draggable)}
      data-is-playing={String(props.isPlaying)} data-is-loading={String(props.isLoading)}
      data-is-dragging={String(props.isDragging)} data-is-drag-over={String(props.isDragOver)}
      data-current-input={props.currentInput} data-selected-tag-index={props.selectedTagIndex ?? "null"}
      data-pronunciation-panel-open={String(props.isPronunciationPanelOpen)}
      data-loading-tag-index={props.loadingTagIndex ?? "null"} data-sentence-index={props.sentenceIndex}
      data-has-danger-menu={String(props.tagMenuItems?.some(i => i.danger) ?? false)}>
      {props.menuContent}
    </div>
  ),
}));

vi.mock("@/features/synthesis/components/SentenceMenu", () => ({
  default: ({ sentenceId }: { sentenceId: string }) => <div data-testid={`menu-${sentenceId}`} />,
}));

describe("SynthesisView mutation kills - part 2", () => {
  beforeEach(() => { mockContextValue = createMockContext(); });

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
    expect(screen.getByText("Lisa lause").getAttribute("data-onboarding-target")).toBe("add-sentence-button");
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
