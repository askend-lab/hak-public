// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVariantsPanel } from "./useVariantsPanel";
import { SentenceState } from "@/types/synthesis";
import { NotificationType } from "@/components/Notification";

vi.mock("@/features/synthesis/utils/analyzeApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/synthesis/utils/analyzeApi")>();
  return {
    ...actual,
    analyzeText: vi.fn().mockResolvedValue("Héllo wórld"),
  };
});

const makeSentences = (): SentenceState[] => [
  { id: "1", text: "Hello world", tags: ["Hello", "world"],
    isPlaying: false, isLoading: false, currentInput: "" },
  { id: "2", text: "Test sentence", tags: ["Test", "sentence"],
    isPlaying: false, isLoading: false, currentInput: "",
    stressedTags: ["Tést", "séntence"] },
];

describe("useVariantsPanel mutation kills", () => {
  let setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>> & ReturnType<typeof vi.fn>;
  let showNotification: ((type: NotificationType, message: string, description?: string) => void) & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    setSentences = vi.fn() as typeof setSentences;
    showNotification = vi.fn() as typeof showNotification;
  });

  afterEach(() => vi.restoreAllMocks());

  // --- handleTagClick without stressedTags L54-89 ---
  it("handleTagClick fetches and splits stressedText for sentence without stressedTags", async () => {
    const { analyzeText } = await import("@/features/synthesis/utils/analyzeApi");
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleTagClick("1", 0, "Hello"); });

    expect(analyzeText).toHaveBeenCalledWith("Hello world");
    expect(setSentences).toHaveBeenCalled();
    const updater = setSentences.mock.calls[0]?.[0];
    if (typeof updater === "function") {
      const updated = updater(sentences);
      expect(updated[0].stressedTags).toStrictEqual(["Héllo", "wórld"]);
    }
    expect(result.current.isVariantsPanelOpen).toBe(true);
    expect(result.current.variantsWord).toBe("Hello");
    expect(result.current.selectedSentenceId).toBe("1");
    expect(result.current.selectedTagIndex).toBe(0);
  });

  it("handleTagClick sets customPhonetic from analyzed stressedWords", async () => {
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleTagClick("1", 1, "world"); });

    expect(result.current.variantsCustomPhonetic).toBe("wórld");
  });

  it("handleTagClick with mismatched word count sets stressedTags to undefined", async () => {
    const { analyzeText } = await import("@/features/synthesis/utils/analyzeApi");
    (analyzeText as ReturnType<typeof vi.fn>).mockResolvedValueOnce("Single");
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleTagClick("1", 0, "Hello"); });

    const updater = setSentences.mock.calls[0]?.[0];
    if (typeof updater === "function") {
      const updated = updater(sentences);
      expect(updated[0].stressedTags).toBeUndefined();
    }
    expect(result.current.variantsCustomPhonetic).toBeNull();
  });

  it("handleTagClick with null analyzeText result still opens panel", async () => {
    const { analyzeText } = await import("@/features/synthesis/utils/analyzeApi");
    (analyzeText as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleTagClick("1", 0, "Hello"); });

    expect(result.current.isVariantsPanelOpen).toBe(true);
    expect(result.current.variantsCustomPhonetic).toBeNull();
  });

  // --- handleTagClick with existing stressedTags L92-97 ---
  it("handleTagClick with stressedTags reads customPhonetic from stressedTags array", async () => {
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleTagClick("2", 1, "sentence"); });

    expect(result.current.variantsCustomPhonetic).toBe("séntence");
    expect(result.current.selectedSentenceId).toBe("2");
    expect(result.current.selectedTagIndex).toBe(1);
  });

  // --- handleCloseVariants L102-108 ---
  it("handleCloseVariants clears all panel state", async () => {
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleTagClick("2", 0, "Test"); });
    expect(result.current.isVariantsPanelOpen).toBe(true);

    act(() => { result.current.handleCloseVariants(); });

    expect(result.current.isVariantsPanelOpen).toBe(false);
    expect(result.current.variantsWord).toBeNull();
    expect(result.current.variantsCustomPhonetic).toBeNull();
    expect(result.current.selectedSentenceId).toBeNull();
    expect(result.current.selectedTagIndex).toBeNull();
  });

  // --- handleOpenVariantsFromMenu L110-168 ---
  it("handleOpenVariantsFromMenu sends POST with word in body", async () => {
    vi.useFakeTimers();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ variants: [{ text: "v" }] }),
    });
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences, showNotification));

    await act(async () => {
      const p = result.current.handleOpenVariantsFromMenu("2", 0, "Test");
      await vi.advanceTimersByTimeAsync(500);
      await p;
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/variants", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: "Test" }),
    }));
    vi.useRealTimers();
  });

  it("handleOpenVariantsFromMenu clears loadingTag in finally", async () => {
    vi.useFakeTimers();
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("fail"));
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences, showNotification));

    await act(async () => {
      const p = result.current.handleOpenVariantsFromMenu("2", 0, "Test");
      await vi.advanceTimersByTimeAsync(500);
      await p;
    });

    expect(result.current.loadingVariantsTag).toBeNull();
    vi.useRealTimers();
  });

  it("handleOpenVariantsFromMenu shows abort notification on timeout", async () => {
    vi.useFakeTimers();
    const abortErr = new Error("Aborted");
    abortErr.name = "AbortError";
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(abortErr);
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences, showNotification));

    await act(async () => {
      const p = result.current.handleOpenVariantsFromMenu("2", 0, "Test");
      await vi.advanceTimersByTimeAsync(10000);
      await p;
    });

    expect(showNotification).toHaveBeenCalledWith("error", "Päring aegus", expect.any(String));
    vi.useRealTimers();
  });

  it("handleOpenVariantsFromMenu throws on non-ok response", async () => {
    vi.useFakeTimers();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences, showNotification));

    await act(async () => {
      const p = result.current.handleOpenVariantsFromMenu("2", 0, "Test");
      await vi.advanceTimersByTimeAsync(500);
      await p;
    });

    expect(showNotification).toHaveBeenCalledWith("error", "Variantide laadimine ebaõnnestus", expect.any(String));
    vi.useRealTimers();
  });

  // --- handleExplorePhonetic L170-189 ---
  it("handleExplorePhonetic fetches phoneticText when not available", async () => {
    const { analyzeText } = await import("@/features/synthesis/utils/analyzeApi");
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleExplorePhonetic("1"); });

    expect(analyzeText).toHaveBeenCalledWith("Hello world");
    expect(setSentences).toHaveBeenCalled();
    expect(result.current.showSentencePhoneticPanel).toBe(true);
    expect(result.current.sentencePhoneticId).toBe("1");
  });

  it("handleExplorePhonetic skips fetch when phoneticText exists", async () => {
    const { analyzeText } = await import("@/features/synthesis/utils/analyzeApi");
    const sentences = makeSentences();
    sentences[0] = { ...makeSentences()[0], phoneticText: "existing" } as SentenceState;
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleExplorePhonetic("1"); });

    expect(analyzeText).not.toHaveBeenCalled();
    expect(result.current.showSentencePhoneticPanel).toBe(true);
  });

  it("handleExplorePhonetic returns early for nonexistent sentence", async () => {
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleExplorePhonetic("missing"); });

    expect(result.current.showSentencePhoneticPanel).toBe(false);
  });

  it("handleExplorePhonetic returns early for whitespace-only text", async () => {
    const sentences: SentenceState[] = [
      { id: "1", text: "   ", tags: [], isPlaying: false, isLoading: false, currentInput: "" },
    ];
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleExplorePhonetic("1"); });

    expect(result.current.showSentencePhoneticPanel).toBe(false);
  });

  it("handleExplorePhonetic handles null analyzeText result", async () => {
    const { analyzeText } = await import("@/features/synthesis/utils/analyzeApi");
    (analyzeText as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleExplorePhonetic("1"); });

    expect(setSentences).not.toHaveBeenCalled();
    expect(result.current.showSentencePhoneticPanel).toBe(true);
  });

  // --- handleCloseSentencePhonetic L192-195 ---
  it("handleCloseSentencePhonetic clears panel state", async () => {
    const sentences = makeSentences();
    const { result } = renderHook(() => useVariantsPanel(sentences, setSentences));

    await act(async () => { await result.current.handleExplorePhonetic("1"); });
    expect(result.current.showSentencePhoneticPanel).toBe(true);

    act(() => { result.current.handleCloseSentencePhonetic(); });

    expect(result.current.showSentencePhoneticPanel).toBe(false);
    expect(result.current.sentencePhoneticId).toBeNull();
  });
});
