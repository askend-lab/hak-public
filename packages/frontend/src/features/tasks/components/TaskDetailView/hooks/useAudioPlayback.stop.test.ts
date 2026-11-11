// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
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

describe("getVoiceModel logic", () => {
  it("uses efm_s for single word", async () => {
    const entries = [mockEntry("1", "word")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    const { synthesizeWithPolling } = await import("@/features/synthesis/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalledWith("word", "efm_s");
  });

  it("uses efm_l for multiple words", async () => {
    const entries = [mockEntry("1", "hello world")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    const { synthesizeWithPolling } = await import("@/features/synthesis/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalledWith("hello world", "efm_l");
  });

});
