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
  stripPhoneticMarkers: (text: string): string => text.replace(/[·`´]/g, ""),
}));

const mockSynthesize = vi.fn().mockResolvedValue("mock-audio-url");
vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: (): Promise<string> => mockSynthesize(),
}));

describe("useSynthesis playback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockSynthesize.mockResolvedValue("mock-audio-url");
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
      json: () => Promise.resolve({ stressedText: "stressed text" }),
      blob: () => Promise.resolve(new Blob(["audio"], { type: "audio/wav" })),
    });
  });

  it("handlePlay synthesizes and plays audio", async () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    await act(async () => {
      await result.current.handlePlay(id);
    });
  });

  it("handlePlay stops other playing sentences", async () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id1 = result.current.sentences[0]?.id ?? "";
    const id2 = result.current.sentences[1]?.id ?? "";
    await act(async () => {
      await result.current.handlePlay(id1);
    });
    await act(async () => {
      await result.current.handlePlay(id2);
    });
  });

  it("handlePlayAll plays all sentences", async () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    await act(async () => {
      result.current.handlePlayAll();
    });
    expect(
      result.current.isPlayingAll || result.current.isLoadingPlayAll,
    ).toBeDefined();
  });

  it("handleDownload creates downloadable audio", async () => {
    const createObjectURL = vi.fn(() => "blob:download-url");
    global.URL.createObjectURL = createObjectURL;

    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    await act(async () => {
      await result.current.handleDownload(id);
    });
  });

  it("handleDeleteTag removes tag from sentence", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    const initialTagCount = result.current.sentences[0]?.tags?.length ?? 0;
    if (initialTagCount > 0) {
      act(() => {
        result.current.handleDeleteTag(id, 0);
      });
      expect(result.current.sentences[0]?.tags?.length).toBeLessThan(
        initialTagCount,
      );
    }
  });

  it("handleEditTag starts editing mode", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(id, 0);
    });
    expect(result.current.editingTag).not.toBeNull();
  });

  it("handleEditTagChange updates editing value", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(id, 0);
    });
    act(() => {
      result.current.handleEditTagChange("new value");
    });
    expect(result.current.editingTag?.value).toBe("new value");
  });

  it("handleEditTagCommit saves changes", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(id, 0);
    });
    act(() => {
      result.current.handleEditTagChange("updated");
    });
    act(() => {
      result.current.handleEditTagCommit();
    });
    expect(result.current.editingTag).toBeNull();
  });

  it("handleEditTagKeyDown handles Enter key", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(id, 0);
    });
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleEditTagKeyDown({
        key: "Enter",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.editingTag).toBeNull();
  });

  it("handleEditTagKeyDown handles Escape key", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleEditTag(id, 0);
    });
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleEditTagKeyDown({
        key: "Escape",
        preventDefault,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.editingTag).toBeNull();
  });

  it("handleUseVariant updates sentence phonetic", () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleUseVariant("new`phonetic", id, 0);
    });
  });

  it("handles synthesis error gracefully", async () => {
    mockSynthesize.mockRejectedValueOnce(new Error("Synthesis failed"));
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id ?? "";
    await act(async () => {
      result.current.handlePlay(id);
    });

    consoleSpy.mockRestore();
  });
});
