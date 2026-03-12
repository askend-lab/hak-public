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
  stripPhoneticMarkers: (text: string): string => text,
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
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

  it("starts with one empty sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it("starts with no audio playing", () => {
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("starts with no tag editing or menu", () => {
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.editingTag).toBeNull();
    expect(result.current.openTagMenu).toBeNull();
  });

  it("updates currentInput for sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleTextChange(sentenceId, "hello");
    });
    expect(result.current.sentences[0]?.currentInput).toBe("hello");
  });

  it("clears sentence content", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleTextChange(sentenceId, "test");
    });
    act(() => {
      result.current.handleClearSentence(sentenceId);
    });
    expect(result.current.sentences[0]?.tags).toEqual([]);
    expect(result.current.sentences[0]?.currentInput).toBe("");
  });

  it("adds new empty sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handleAddSentence();
    });
    expect(result.current.sentences).toHaveLength(2);
  });

  it("removes sentence when multiple exist", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handleAddSentence();
    });
    const firstId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleRemoveSentence(firstId);
    });
    expect(result.current.sentences).toHaveLength(1);
  });

  it("resets to initial sentence when removing last one", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleRemoveSentence(sentenceId);
    });
    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]?.id).toBe("1");
  });

  it("sets demo sentences", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    expect(result.current.sentences).toHaveLength(2);
    expect(result.current.sentences[0]?.tags).toContain("Noormees");
  });

  it("opens and closes tag menu", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.setOpenTagMenu({ sentenceId, tagIndex: 0 });
    });
    expect(result.current.openTagMenu).toEqual({ sentenceId, tagIndex: 0 });
    act(() => {
      result.current.setOpenTagMenu(null);
    });
    expect(result.current.openTagMenu).toBeNull();
  });

  it("starts tag editing with handleEditTag", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });
    expect(result.current.editingTag).toEqual({
      sentenceId,
      tagIndex: 0,
      value: "Noormees",
    });
  });

  it("updates and commits tag edit", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });
    act(() => {
      result.current.handleEditTagChange("NewValue");
    });
    expect(result.current.editingTag?.value).toBe("NewValue");
    act(() => {
      result.current.handleEditTagCommit();
    });
    expect(result.current.editingTag).toBeNull();
    expect(result.current.sentences[0]?.tags[0]).toBe("NewValue");
  });

  it("deletes tag from sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id ?? "";
    const initialCount = result.current.sentences[0]?.tags.length ?? 0;
    act(() => {
      result.current.handleDeleteTag(sentenceId, 0);
    });
    expect(result.current.sentences[0]?.tags.length).toBe(initialCount - 1);
  });

  it("loads entries from localStorage on mount", () => {
    localStorage.setItem(
      "eki_playlist_entries",
      JSON.stringify([
        { id: "s1", text: "Hello World", stressedText: "Hello World" },
      ]),
    );
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.sentences[0]?.text).toBe("Hello World");
    expect(localStorage.getItem("eki_playlist_entries")).toBeNull();
  });

});
