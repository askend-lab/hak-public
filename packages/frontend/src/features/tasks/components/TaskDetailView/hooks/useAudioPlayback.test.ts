// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAudioPlayback } from "./useAudioPlayback";

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("blob:audio-url"),
}));


describe("useAudioPlayback initialization", () => {
  it("initializes with null states", () => {
    const { result } = renderHook(() => useAudioPlayback([]));
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

});
