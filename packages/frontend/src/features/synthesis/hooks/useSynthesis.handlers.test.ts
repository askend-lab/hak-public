// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@hak/shared";
import { renderHook, act } from "@testing-library/react";
import { useSynthesis } from "./useSynthesis";
import { useSentenceStore } from "./synthesis/useSentenceState";

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
    useSentenceStore.getState()._reset();

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

  it("should copy text to clipboard via handleCopyText", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";
    await act(async () => {
      await result.current.handleCopyText(sentenceId);
    });

    expect(writeText).toHaveBeenCalled();
  });

  it("should handle clipboard error in handleCopyText", async () => {
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard fail"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";
    await act(async () => {
      await result.current.handleCopyText(sentenceId);
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should synthesize on Enter key in edit tag", () => {
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

    const mockEvent = {
      key: "Enter",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;
    act(() => {
      result.current.handleEditTagKeyDown(mockEvent);
    });

    expect(result.current.editingTag).toBeNull();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it("should handle escape key in edit tag", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });

    const mockEvent = {
      key: "Escape",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleEditTagKeyDown(mockEvent);
    });

    expect(result.current.editingTag).toBeNull();
  });

});
