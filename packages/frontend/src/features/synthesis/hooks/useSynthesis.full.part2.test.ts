// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
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
  stripPhoneticMarkers: (text: string): string => text,
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
}));

const setupMocks = (): void => {
  class MockAudio {
    src = "";
    onended: (() => void) | null = null;
    onerror: (() => void) | null = null;
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
    json: () => Promise.resolve({ stressedText: "mock" }),
    blob: () => Promise.resolve(new Blob()),
  });
};

describe("useSynthesis core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupMocks();
  });

  it("handles invalid localStorage data gracefully", () => {
    localStorage.setItem("eki_playlist_entries", "invalid json");
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.sentences).toHaveLength(1);
    consoleSpy.mockRestore();
  });

  it("processes Enter key to add tags", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleTextChange(sentenceId, "Hello World");
    });
    act(() => {
      result.current.handleKeyDown(
        {
          key: "Enter",
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent,
        sentenceId,
      );
    });
    expect(result.current.sentences[0]?.tags).toContain("Hello");
  });

  it("applies variant to specific tag", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleUseVariant("NewVariant", sentenceId, 0);
    });
    expect(result.current.sentences[0]?.stressedTags?.[0]).toBe("NewVariant");
  });

  it("applies phonetic text to sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleSentencePhoneticApply(sentenceId, "test phonetic");
    });
    expect(result.current.sentences[0]?.phoneticText).toBe("test phonetic");
  });

  it("handlePlay sets loading state", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handlePlay(sentenceId);
    });
    expect(
      result.current.sentences[0]?.isLoading ||
        result.current.sentences[0]?.isPlaying,
    ).toBeDefined();
  });

  it("handleDownload can be called without errors", async () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    await act(async () => {
      await result.current.handleDownload(sentenceId);
    });
  });

  it("handlePlayAll can be called on empty sentences", async () => {
    const { result } = renderHook(() => useSynthesis());
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("handleEditTagKeyDown commits on Enter and cancels on Escape", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });
    act(() => {
      result.current.handleEditTagKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.editingTag).toBeNull();
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });
    act(() => {
      result.current.handleEditTagKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.editingTag).toBeNull();
  });

});
