// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesis } from "./useSynthesis";
import { useSentenceStore } from "./synthesis/useSentenceState";

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
    useSentenceStore.getState()._reset();
    setupMocks();
  });

  it("handleEditTagKeyDown commits on space key", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });
    act(() => {
      result.current.handleEditTagChange("Modified");
    });
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleEditTagKeyDown({
        key: " ",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.editingTag).toBeNull();
  });

  it("handleUseVariant does nothing when selectedSentenceId is null", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const initialStressedTags = result.current.sentences[0]?.stressedTags;
    act(() => {
      result.current.handleUseVariant("variant", null, 0);
    });
    expect(result.current.sentences[0]?.stressedTags).toEqual(
      initialStressedTags,
    );
  });

  it("handleUseVariant does nothing when selectedTagIndex is null", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    const initialStressedTags = result.current.sentences[0]?.stressedTags;
    act(() => {
      result.current.handleUseVariant("variant", sentenceId, null);
    });
    expect(result.current.sentences[0]?.stressedTags).toEqual(
      initialStressedTags,
    );
  });

  it("handlePlay processes currentInput before playing", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleTextChange(sentenceId, "extraword");
    });
    act(() => {
      result.current.handlePlay(sentenceId);
    });
    expect(result.current.sentences[0]?.tags).toContain("extraword");
  });

  it("handlePlay returns early when sentence not found", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handlePlay("non-existent-id");
    });
  });

  it("handleDownload returns early when sentence not found", async () => {
    const { result } = renderHook(() => useSynthesis());
    await act(async () => {
      await result.current.handleDownload("non-existent-id");
    });
  });

  it("handleRemoveSentence revokes object URL when audio exists", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setSentences([
        {
          id: "test-1",
          text: "Test",
          tags: ["Test"],
          isPlaying: false,
          isLoading: false,
          currentInput: "",
          audioUrl: "blob:test-url",
        },
        {
          id: "test-2",
          text: "",
          tags: [],
          isPlaying: false,
          isLoading: false,
          currentInput: "",
        },
      ]);
    });
    act(() => {
      result.current.handleRemoveSentence("test-1");
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");
  });

  it("handleInputBlur returns early when sentence not found", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handleInputBlur("non-existent");
    });
  });

  it("handleInputBlur returns early when input is empty", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleInputBlur(sentenceId);
    });
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it("handleInputBlur returns early when tags are empty", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleTextChange(sentenceId, "some input");
    });
    act(() => {
      result.current.handleInputBlur(sentenceId);
    });
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it("handleInputBlur appends input to existing tags", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleTextChange(sentenceId, "blurword");
    });
    act(() => {
      result.current.handleInputBlur(sentenceId);
    });
    expect(result.current.sentences[0]?.tags).toContain("blurword");
  });

});
