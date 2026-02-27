// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesis } from "./useSynthesis";

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("blob:mock"),
}));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: (): { showNotification: ReturnType<typeof vi.fn> } => ({
    showNotification: vi.fn(),
  }),
}));
vi.mock("@/contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({ copiedEntries: null, setCopiedEntries: vi.fn(), consumeCopiedEntries: vi.fn().mockReturnValue(null), hasCopiedEntries: false }),
}));

describe("useSynthesis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();

    // Mock Audio
    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => {
        setTimeout(() => this.onended?.(), 10);
        return Promise.resolve();
      });
    }
    global.Audio = MockAudio as unknown as typeof Audio;

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle edit tag commit", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });

    act(() => {
      result.current.handleEditTagChange("NewWord");
    });

    act(() => {
      result.current.handleEditTagCommit();
    });

    expect(result.current.editingTag).toBeNull();
    expect(result.current.sentences[0]?.tags[0]).toBe("NewWord");
  });

  it("should update tag and synthesize with new value when Enter pressed after edit", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";
    const originalTag = result.current.sentences[0]?.tags[0];

    // Enter edit mode
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });

    // Change the value
    act(() => {
      result.current.handleEditTagChange("ModifiedWord");
    });

    // Press Enter
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleEditTagKeyDown({
        key: "Enter",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });

    // Verify tag was updated (not reverted to original)
    expect(result.current.editingTag).toBeNull();
    expect(result.current.sentences[0]?.tags[0]).toBe("ModifiedWord");
    expect(result.current.sentences[0]?.tags[0]).not.toBe(originalTag);
    expect(result.current.sentences[0]?.text).toContain("ModifiedWord");
  });

  it("should handle use variant", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleUseVariant("Nóormees", sentenceId, 0);
    });

    expect(result.current.sentences[0]?.stressedTags?.[0]).toBe("Nóormees");
  });

  it("should handle sentence phonetic apply", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleSentencePhoneticApply(
        sentenceId,
        "Nóormees läks kóoli",
      );
    });

    expect(result.current.sentences[0]?.phoneticText).toBe(
      "Nóormees läks kóoli",
    );
  });

  it("should load from localStorage on mount", () => {
    const storedEntries = [
      { id: "stored-1", text: "Stored text", stressedText: "Stóred text" },
    ];
    localStorage.setItem("eki_playlist_entries", JSON.stringify(storedEntries));

    const { result } = renderHook(() => useSynthesis());

    expect(result.current.sentences[0]?.text).toBe("Stored text");
    expect(localStorage.getItem("eki_playlist_entries")).toBeNull();
  });

  it("should handle keydown space with tags", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleTextChange(sentenceId, "new");
    });

    const mockEvent = {
      key: " ",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent, sentenceId);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags).toContain("new");
  });

  it("should handle keydown backspace to remove last tag", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";
    const lastTag = result.current.sentences[0]?.tags[2];

    const mockEvent = {
      key: "Backspace",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent, sentenceId);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.sentences[0]?.currentInput).toBe(lastTag);
  });

});
