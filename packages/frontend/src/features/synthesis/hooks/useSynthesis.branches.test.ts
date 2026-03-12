// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesis } from "./useSynthesis";

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: (): { showNotification: ReturnType<typeof vi.fn> } => ({
    showNotification: vi.fn(),
  }),
}));
vi.mock("@/contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({ copiedEntries: null, setCopiedEntries: vi.fn(), consumeCopiedEntries: vi.fn().mockReturnValue(null), hasCopiedEntries: false }),
}));

vi.mock("@/features/synthesis/utils/phoneticMarkers", () => ({
  stripPhoneticMarkers: (text: string): string => text.replace(/[·`´]/g, ""),
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
}));

const setupMocks = (): void => {
  class MockAudio {
    src = "";
    onended: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onloadeddata: (() => void) | null = null;
    pause = vi.fn();
    play = vi.fn().mockImplementation(() => {
      setTimeout(() => this.onended?.(), 10);
      return Promise.resolve();
    });
  }
  global.Audio = MockAudio as unknown as typeof Audio;
  global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
  global.URL.revokeObjectURL = vi.fn();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ stressedText: "mock stressed" }),
    blob: () => Promise.resolve(new Blob()),
  });
};

describe("useSynthesis keyboard handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupMocks();
  });

  it("processes space key when input has content and tags exist", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleTextChange(sentenceId, "newword");
    });
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown(
        { key: " ", preventDefault } as unknown as React.KeyboardEvent,
        sentenceId,
      );
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags).toContain("newword");
  });

  it("does not process space when no input", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    const initialTags = [...(result.current.sentences[0]?.tags ?? [])];
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown(
        { key: " ", preventDefault } as unknown as React.KeyboardEvent,
        sentenceId,
      );
    });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags).toEqual(initialTags);
  });

  it("removes last tag on backspace when input is empty", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    const initialTagCount = result.current.sentences[0]?.tags.length ?? 0;
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown(
        { key: "Backspace", preventDefault } as unknown as React.KeyboardEvent,
        sentenceId,
      );
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags.length).toBe(initialTagCount - 1);
    expect(result.current.sentences[0]?.currentInput).toBe("kooli");
  });

  it("does not remove tag when input has content", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleTextChange(sentenceId, "typing");
    });
    const initialTagCount = result.current.sentences[0]?.tags.length ?? 0;
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown(
        { key: "Backspace", preventDefault } as unknown as React.KeyboardEvent,
        sentenceId,
      );
    });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags.length).toBe(initialTagCount);
  });

  it("returns early when sentence not found", () => {
    const { result } = renderHook(() => useSynthesis());
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown(
        { key: "Enter", preventDefault } as unknown as React.KeyboardEvent,
        "non-existent-id",
      );
    });
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("removes tag when edit value is empty", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    const initialTagCount = result.current.sentences[0]?.tags.length ?? 0;
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });
    act(() => {
      result.current.handleEditTagChange("");
    });
    act(() => {
      result.current.handleEditTagCommit();
    });
    expect(result.current.sentences[0]?.tags.length).toBe(initialTagCount - 1);
  });

  it("splits multiple words when editing tag", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    const initialTagCount = result.current.sentences[0]?.tags.length ?? 0;
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });
    act(() => {
      result.current.handleEditTagChange("word1 word2 word3");
    });
    act(() => {
      result.current.handleEditTagCommit();
    });
    expect(result.current.sentences[0]?.tags.length).toBe(initialTagCount + 2);
  });

  it("handleEditTagCommit does nothing when no editingTag", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handleEditTagCommit();
    });
    expect(result.current.editingTag).toBeNull();
  });

  it("handleEditTagChange does nothing when no editingTag", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handleEditTagChange("test");
    });
    expect(result.current.editingTag).toBeNull();
  });

  it("handleEditTag returns early when sentence not found", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handleEditTag("non-existent", 0);
    });
    expect(result.current.editingTag).toBeNull();
  });

});
