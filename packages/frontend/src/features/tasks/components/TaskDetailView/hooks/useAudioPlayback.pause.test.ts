// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayback } from "./useAudioPlayback";

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("blob:audio-url"),
}));

const mockEntry = (
  id: string,
  text = "test",
  audioUrl: string | null = null,
  audioBlob: Blob | null = null,
): {
  id: string;
  text: string;
  stressedText: string;
  audioUrl: string | null;
  audioBlob: Blob | null;
  taskId: string;
  order: number;
  createdAt: Date;
} => ({
  id,
  text,
  stressedText: text,
  audioUrl,
  audioBlob,
  taskId: "t1",
  order: 0,
  createdAt: new Date(),
});

describe("useAudioPlayback handlePlayAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing with empty entries", async () => {
    const { result } = renderHook(() => useAudioPlayback([]));
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("starts loading when called with entries", async () => {
    const { waitFor } = await import("@testing-library/react");
    const entries = [mockEntry("1", "test")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => {
      void result.current.handlePlayAll();
    });
    await waitFor(() => {
      expect(result.current.isLoadingPlayAll).toBe(true);
    });
  });

});
