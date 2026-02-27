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

  it("should initialize with correct defaults", () => {
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]?.text).toBe("");
    expect(result.current.sentences[0]?.tags).toEqual([]);
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("should add a new sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handleAddSentence();
    });
    expect(result.current.sentences).toHaveLength(2);
  });

  it("should update text input", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.handleTextChange(sentenceId, "Hello world");
    });
    expect(result.current.sentences[0]?.currentInput).toBe("Hello world");
  });

  it("should clear a sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.handleTextChange(sentenceId, "Hello");
    });
    act(() => {
      result.current.handleClearSentence(sentenceId);
    });
    expect(result.current.sentences[0]?.currentInput).toBe("");
    expect(result.current.sentences[0]?.text).toBe("");
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it("should remove a sentence when there are multiple", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.handleAddSentence();
    });
    const firstId = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.handleRemoveSentence(firstId);
    });
    expect(result.current.sentences).toHaveLength(1);
  });

  it("should reset to initial state when removing last sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleRemoveSentence(sentenceId);
    });

    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]?.id).toBe("1");
  });

  it("should set demo sentences", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    expect(result.current.sentences).toHaveLength(2);
    expect(result.current.sentences[0]?.text).toBe("Noormees läks kooli");
  });

  it("should handle input blur with existing tags", () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id || "";

    // First add some tags by setting text directly
    act(() => {
      result.current.sentences[0] &&
        (result.current.sentences[0].tags = ["Hello"]);
      result.current.sentences[0] &&
        (result.current.sentences[0].text = "Hello");
    });

    act(() => {
      result.current.handleTextChange(sentenceId, "world");
    });

    act(() => {
      result.current.handleInputBlur(sentenceId);
    });

    // Should combine tags
    expect(result.current.sentences[0]?.tags).toContain("Hello");
  });

  it("should handle delete tag", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleDeleteTag(sentenceId, 0);
    });

    expect(result.current.sentences[0]?.tags).not.toContain("Noormees");
  });

  it("should handle edit tag", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });

    expect(result.current.editingTag).not.toBeNull();
    expect(result.current.editingTag?.sentenceId).toBe(sentenceId);
    expect(result.current.editingTag?.tagIndex).toBe(0);
  });

  it("should handle edit tag change", () => {
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

    expect(result.current.editingTag?.value).toBe("NewWord");
  });

});
