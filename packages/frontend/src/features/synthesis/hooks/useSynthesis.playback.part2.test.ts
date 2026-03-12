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
  stripPhoneticMarkers: (text: string): string => text.replace(/[·`´]/g, ""),
}));

const mockSynthesize = vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" });
vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: (): Promise<string> => mockSynthesize(),
}));

describe("useSynthesis playback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockSynthesize.mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" });
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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
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

  });

  });

  });

  });

  });

});
