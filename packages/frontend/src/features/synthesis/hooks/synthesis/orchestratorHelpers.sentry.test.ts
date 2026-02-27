// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as Sentry from "@sentry/react";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisOrchestrator } from "./useSynthesisOrchestrator";
import type { Mock } from "vitest";

vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));
vi.mock("./useSentenceState");
vi.mock("./useAudioPlayer");
vi.mock("./useSynthesisAPI");

describe("orchestratorHelpers Sentry integration", () => {
  let mockSentenceState: {
    sentences: { id: string; text: string; tags: string[]; audioUrl?: string | null; phoneticText?: string | null }[];
    updateSentence: Mock; getSentence: Mock;
  };
  let mockAudioPlayer: { currentAudio: HTMLAudioElement | null; stopCurrentAudio: Mock; playAudio: Mock; playWithAbort: Mock };
  let mockSynthesisAPI: { synthesizeText: Mock; synthesizeWithCache: Mock };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSentenceState = {
      sentences: [{ id: "s1", text: "Hello", tags: ["Hello"], audioUrl: null, phoneticText: null }],
      updateSentence: vi.fn(),
      getSentence: vi.fn((id: string) => mockSentenceState.sentences.find((s) => s.id === id)),
    };
    mockAudioPlayer = { currentAudio: null, stopCurrentAudio: vi.fn(), playAudio: vi.fn().mockResolvedValue(true), playWithAbort: vi.fn().mockResolvedValue(true) };
    mockSynthesisAPI = {
      synthesizeText: vi.fn().mockResolvedValue({ audioUrl: "http://a.mp3", phoneticText: "H", stressedTags: ["H"] }),
      synthesizeWithCache: vi.fn().mockResolvedValue({ audioUrl: "http://a.mp3", phoneticText: "H" }),
    };
    const { useSentenceState } = await import("./useSentenceState");
    const { useAudioPlayer } = await import("./useAudioPlayer");
    const { useSynthesisAPI } = await import("./useSynthesisAPI");
    (useSentenceState as Mock).mockReturnValue(mockSentenceState);
    (useAudioPlayer as Mock).mockReturnValue(mockAudioPlayer);
    (useSynthesisAPI as Mock).mockReturnValue(mockSynthesisAPI);
  });

  afterEach(() => vi.restoreAllMocks());

  it("playSingleSentence reports to Sentry on synthesis error", async () => {
    vi.spyOn(await import("@hak/shared"), "logger", "get").mockReturnValue({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() } as never);
    const err = new Error("synth failed");
    mockSynthesisAPI.synthesizeWithCache.mockRejectedValue(err);
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1"); });
    expect(Sentry.captureException).toHaveBeenCalledWith(err, { tags: { synthesis: "resolve" } });
  });

  it("synthesizeAndPlay reports to Sentry on synthesis error", async () => {
    vi.spyOn(await import("@hak/shared"), "logger", "get").mockReturnValue({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() } as never);
    const err = new Error("synth failed");
    mockSynthesisAPI.synthesizeText.mockRejectedValue(err);
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(Sentry.captureException).toHaveBeenCalledWith(err, { tags: { synthesis: "fresh" } });
  });

  it("synthesizeWithText reports to Sentry on synthesis error", async () => {
    vi.spyOn(await import("@hak/shared"), "logger", "get").mockReturnValue({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() } as never);
    const err = new Error("synth failed");
    mockSynthesisAPI.synthesizeText.mockRejectedValue(err);
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "Hello", audioUrl: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "Goodbye"); });
    expect(Sentry.captureException).toHaveBeenCalledWith(err, { tags: { synthesis: "withText" } });
  });
});
