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

describe("useAudioPlayback handlePlayEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing for non-existent entry", () => {
    const { result } = renderHook(() => useAudioPlayback([mockEntry("1")]));
    act(() => {
      result.current.handlePlayEntry("999");
    });
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("synthesizes audio when no audioUrl or audioBlob", async () => {
    const entries = [mockEntry("1", "hello world")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    expect(result.current.currentLoadingId).toBe("1");
  });

});
