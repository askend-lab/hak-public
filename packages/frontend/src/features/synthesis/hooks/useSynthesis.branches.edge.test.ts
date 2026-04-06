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

  it("loads entries with audioUrl from localStorage", () => {
    localStorage.setItem(
      "eki_playlist_entries",
      JSON.stringify([
        {
          id: "s1",
          text: "Hello",
          stressedText: "Hello",
          audioUrl: "blob:audio",
        },
      ]),
    );
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.sentences[0]?.audioUrl).toBe("blob:audio");
  });

  it("generates id when not provided in stored entry", () => {
    localStorage.setItem(
      "eki_playlist_entries",
      JSON.stringify([{ text: "No ID", stressedText: "No ID" }]),
    );
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.sentences[0]?.id).toContain("entry_");
  });

  it("synthesizes when Enter pressed with existing tags and no input", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown(
        { key: "Enter", preventDefault } as unknown as React.KeyboardEvent,
        sentenceId,
      );
    });
    expect(preventDefault).toHaveBeenCalled();
  });

  it("handleDeleteTag leaves other sentences unchanged", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const initialTags = [...(result.current.sentences[0]?.tags ?? [])];
    act(() => {
      result.current.handleDeleteTag("non-existent-id", 0);
    });
    expect(result.current.sentences[0]?.tags).toEqual(initialTags);
  });

});
