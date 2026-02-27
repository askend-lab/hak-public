// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@hak/shared";
import { renderHook, act } from "@testing-library/react";
import { useSynthesis } from "./useSynthesis";
import { synthesizeWithPolling } from "@/features/synthesis/utils/synthesize";

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

  it("should open and close tag menu", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setOpenTagMenu({ sentenceId: "1", tagIndex: 0 });
    });

    expect(result.current.openTagMenu).toEqual({
      sentenceId: "1",
      tagIndex: 0,
    });

    act(() => {
      result.current.setOpenTagMenu(null);
    });

    expect(result.current.openTagMenu).toBeNull();
  });

  it("should handle play with input", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleTextChange(sentenceId, "additional");
    });

    // Play should process the input
    act(() => {
      result.current.handlePlay(sentenceId);
    });

    expect(result.current.sentences[0]?.currentInput).toBe("");
  });

  it("should handle edit tag with empty value", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });

    act(() => {
      result.current.handleEditTagChange("");
    });

    act(() => {
      result.current.handleEditTagCommit();
    });

    // Empty value should remove the tag
    expect(result.current.sentences[0]?.tags.length).toBeLessThan(3);
  });

  it("should handle edit tag with multiple words", () => {
    const { result } = renderHook(() => useSynthesis());

    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";

    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });

    act(() => {
      result.current.handleEditTagChange("New Words Here");
    });

    act(() => {
      result.current.handleEditTagCommit();
    });

    expect(result.current.sentences[0]?.tags).toContain("New");
    expect(result.current.sentences[0]?.tags).toContain("Words");
  });

  it("should handle download synthesis error", async () => {
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    vi.mocked(synthesizeWithPolling).mockRejectedValueOnce(
      new Error("synth fail"),
    );

    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id || "";

    await act(async () => {
      await result.current.handleDownload(sentenceId);
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should handle download fetch error", async () => {
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    vi.mocked(synthesizeWithPolling).mockResolvedValueOnce("mock-audio-url");
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("fetch fail"));

    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const sentenceId = result.current.sentences[0]?.id || "";

    await act(async () => {
      await result.current.handleDownload(sentenceId);
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should handle Enter key with empty value to delete tag", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });

    const sentenceId = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.handleEditTag(sentenceId, 0);
    });
    act(() => {
      result.current.handleEditTagChange("");
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

});
