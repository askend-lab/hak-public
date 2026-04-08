// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSharedTaskAudio } from "./useSharedTaskAudio";
import { TaskEntry } from "@/types/task";

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
}));

vi.mock("@/types/synthesis", () => ({
  getVoiceModel: (): string => "mari",
}));

const createEntry = (
  overrides: Partial<TaskEntry> & {
    id: string;
    text: string;
    stressedText: string;
  },
): TaskEntry => ({
  taskId: "task-1",
  audioUrl: null,
  audioBlob: null,
  order: 0,
  createdAt: new Date(),
  ...overrides,
});

describe("useSharedTaskAudio", () => {
  afterEach(async () => {
    // Flush pending MockAudio setTimeout callbacks before environment teardown
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();

    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => {
        setTimeout(() => this.onloadeddata?.(), 5);
        setTimeout(() => this.onended?.(), 10);
        return Promise.resolve();
      });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useSharedTaskAudio());

    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("handlePlayEntry plays entry with audioUrl", async () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    const entries: TaskEntry[] = [
      createEntry({
        id: "1",
        text: "test",
        stressedText: "test",
        audioUrl: "http://audio.url",
      }),
    ];

    act(() => {
      result.current.handlePlayEntry("1", entries);
    });

    expect(result.current.currentPlayingId).toBe("1");
  });

  it("handlePlayEntry plays entry with audioBlob", async () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const entries: TaskEntry[] = [
      createEntry({
        id: "1",
        text: "test",
        stressedText: "test",
        audioBlob: blob,
      }),
    ];

    act(() => {
      result.current.handlePlayEntry("1", entries);
    });

    expect(result.current.currentPlayingId).toBe("1");
  });

  it("handlePlayEntry synthesizes when no audio available", async () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    const entries: TaskEntry[] = [
      createEntry({ id: "1", text: "test", stressedText: "te`st" }),
    ];

    act(() => {
      result.current.handlePlayEntry("1", entries);
    });

    expect(result.current.currentLoadingId).toBe("1");
  });

  it("handlePlayEntry does nothing for non-existent entry", () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    const entries: TaskEntry[] = [];

    act(() => {
      result.current.handlePlayEntry("999", entries);
    });

    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
  });

  it("handlePlayAll does nothing for empty entries", async () => {
    const { result } = renderHook(() => useSharedTaskAudio());

    await act(async () => {
      await result.current.handlePlayAll([]);
    });

    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("handlePlayAll starts playing entries sequentially", async () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    const entries: TaskEntry[] = [
      createEntry({
        id: "1",
        text: "test1",
        stressedText: "test1",
        audioUrl: "http://audio1.url",
      }),
    ];

    act(() => {
      void result.current.handlePlayAll(entries);
    });

    expect(result.current.isLoadingPlayAll).toBe(true);
  });

  it("handlePlayAll can be stopped while playing", async () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    const entries: TaskEntry[] = [
      createEntry({
        id: "1",
        text: "test1",
        stressedText: "test1",
        audioUrl: "http://audio1.url",
      }),
    ];

    act(() => {
      void result.current.handlePlayAll(entries);
    });

    await waitFor(() => {
      expect(
        result.current.isLoadingPlayAll || result.current.isPlayingAll,
      ).toBe(true);
    });

    await act(async () => {
      await result.current.handlePlayAll(entries);
    });

    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  });

  });

  });

  });

  });

});
