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

describe("SynthesisView mutation kills", () => {
  beforeEach(() => { mockContextValue = createMockContext(); });

  it("sentenceCount filters by non-empty trimmed text", () => {
    mockContextValue = createMockContext({
      sentences: [makeSentence("s1", "hello"), makeSentence("s2", ""), makeSentence("s3", "   ")],
    });
    render(<SynthesisView />);
    expect(screen.getByTestId("header").dataset.count).toBe("1");
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
});
