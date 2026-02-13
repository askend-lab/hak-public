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
