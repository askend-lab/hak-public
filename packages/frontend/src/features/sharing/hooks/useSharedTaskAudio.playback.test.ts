// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  it("handlePlayEntry handles audio error gracefully", async () => {
    class MockAudioWithError {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => {
        setTimeout(() => this.onerror?.(), 5);
        return Promise.resolve();
      });
    }
    global.Audio = MockAudioWithError as unknown as typeof Audio;

    const { result } = renderHook(() => useSharedTaskAudio());
    const entries: TaskEntry[] = [
      createEntry({
        id: "1",
        text: "test",
        stressedText: "test",
        audioUrl: "http://audio.url",
      }),
    ];

    // Should not throw
    act(() => {
      result.current.handlePlayEntry("1", entries);
    });

    // Wait for error handler to be called
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(result.current.currentPlayingId).toBeNull();
  });

  });

  });

  });

  });

  });

});
