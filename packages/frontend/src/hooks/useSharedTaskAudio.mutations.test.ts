// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSharedTaskAudio } from "./useSharedTaskAudio";
import { TaskEntry } from "@/types/task";

vi.mock("@/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("blob:synth"),
}));
vi.mock("@/types/synthesis", () => ({ getVoiceModel: vi.fn(() => "voice") }));

const makeEntry = (id: string, overrides: Partial<TaskEntry> = {}): TaskEntry => ({
  id, taskId: "t1", text: `text-${id}`, stressedText: `stressed-${id}`,
  audioUrl: null, audioBlob: null, order: 0, createdAt: new Date(), ...overrides,
});

describe("useSharedTaskAudio mutation kills", () => {
  beforeEach(() => vi.clearAllMocks());

  it("initializes with null/false values", () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("handlePlayEntry returns early for unknown entry", () => {
    const entries = [makeEntry("e1")];
    const { result } = renderHook(() => useSharedTaskAudio());
    act(() => result.current.handlePlayEntry("missing", entries));
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("handlePlayEntry with audioUrl sets currentPlayingId", async () => {
    const entries = [makeEntry("e1", { audioUrl: "http://a.mp3" })];
    const { result } = renderHook(() => useSharedTaskAudio());
    await act(async () => result.current.handlePlayEntry("e1", entries));
    expect(result.current.currentPlayingId).toBe("e1");
  });

  it("handlePlayEntry with audioBlob sets currentPlayingId", async () => {
    const blob = new Blob(["audio"], { type: "audio/mp3" });
    Object.defineProperty(blob, "size", { value: 100 });
    const entries = [makeEntry("e1", { audioBlob: blob })];
    const { result } = renderHook(() => useSharedTaskAudio());
    await act(async () => result.current.handlePlayEntry("e1", entries));
    expect(result.current.currentPlayingId).toBe("e1");
  });

  it("handlePlayEntry with no audio calls synthesize", async () => {
    const entries = [makeEntry("e1")];
    const { result } = renderHook(() => useSharedTaskAudio());
    await act(async () => result.current.handlePlayEntry("e1", entries));
    expect(result.current.currentLoadingId).toBe("e1");
  });

  it("handlePlayEntry does not play whitespace-only audioUrl", async () => {
    const entries = [makeEntry("e1", { audioUrl: "   " })];
    const { result } = renderHook(() => useSharedTaskAudio());
    await act(async () => result.current.handlePlayEntry("e1", entries));
    expect(result.current.currentLoadingId).toBe("e1");
  });

  it("handlePlayEntry does not play zero-size audioBlob", async () => {
    const blob = new Blob([], { type: "audio/mp3" });
    Object.defineProperty(blob, "size", { value: 0 });
    const entries = [makeEntry("e1", { audioBlob: blob })];
    const { result } = renderHook(() => useSharedTaskAudio());
    await act(async () => result.current.handlePlayEntry("e1", entries));
    expect(result.current.currentLoadingId).toBe("e1");
  });

  it("handlePlayAll does nothing with empty entries", async () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    await act(async () => { await result.current.handlePlayAll([]); });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("synthesizeAndPlay handles failure gracefully", async () => {
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
    (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("fail"));
    const entries = [makeEntry("e1")];
    const { result } = renderHook(() => useSharedTaskAudio());
    await act(async () => result.current.handlePlayEntry("e1", entries));
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
  });

  it("handlePlayEntry prefers audioBlob over audioUrl", async () => {
    const blob = new Blob(["audio"], { type: "audio/mp3" });
    Object.defineProperty(blob, "size", { value: 100 });
    const entries = [makeEntry("e1", { audioBlob: blob, audioUrl: "http://a.mp3" })];
    const { result } = renderHook(() => useSharedTaskAudio());
    await act(async () => result.current.handlePlayEntry("e1", entries));
    expect(result.current.currentPlayingId).toBe("e1");
  });
});
