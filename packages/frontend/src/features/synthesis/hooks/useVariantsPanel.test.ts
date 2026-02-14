// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVariantsPanel } from "./useVariantsPanel";
import { SentenceState } from "@/types/synthesis";

describe("useVariantsPanel", () => {
  const createMockSentences = (): SentenceState[] => [
    {
      id: "1",
      text: "Hello world",
      tags: ["Hello", "world"],
      isPlaying: false,
      isLoading: false,
      currentInput: "",
    },
    {
      id: "2",
      text: "Test sentence",
      tags: ["Test", "sentence"],
      isPlaying: false,
      isLoading: false,
      currentInput: "",
      stressedTags: ["Tést", "séntence"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should initialize with closed panel", () => {
    const sentences = createMockSentences();
    const setSentences = vi.fn();
    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences),
    );

    expect(result.current.isVariantsPanelOpen).toBe(false);
    expect(result.current.variantsWord).toBeNull();
    expect(result.current.selectedSentenceId).toBeNull();
    expect(result.current.selectedTagIndex).toBeNull();
    expect(result.current.loadingVariantsTag).toBeNull();
  });

  it("should open variants panel with existing stressedTags", async () => {
    const sentences = createMockSentences();
    const setSentences = vi.fn();
    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences),
    );

    await act(async () => {
      await result.current.handleTagClick("2", 0, "Test");
    });

    expect(result.current.isVariantsPanelOpen).toBe(true);
    expect(result.current.variantsWord).toBe("Test");
    expect(result.current.selectedSentenceId).toBe("2");
    expect(result.current.selectedTagIndex).toBe(0);
    expect(result.current.variantsCustomPhonetic).toBe("Tést");
  });

  it("should fetch stressedTags when not available", async () => {
    const sentences = createMockSentences();
    const setSentences = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ stressedText: "Héllo wórld" }),
    });

    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences),
    );

    await act(async () => {
      await result.current.handleTagClick("1", 0, "Hello");
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/analyze",
      expect.any(Object),
    );
    expect(result.current.isVariantsPanelOpen).toBe(true);
  });

  it("should close variants panel", async () => {
    const sentences = createMockSentences();
    const setSentences = vi.fn();
    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences),
    );

    await act(async () => {
      await result.current.handleTagClick("2", 0, "Test");
    });

    expect(result.current.isVariantsPanelOpen).toBe(true);

    act(() => {
      result.current.handleCloseVariants();
    });

    expect(result.current.isVariantsPanelOpen).toBe(false);
    expect(result.current.variantsWord).toBeNull();
    expect(result.current.selectedSentenceId).toBeNull();
    expect(result.current.selectedTagIndex).toBeNull();
  });

  it("should open variants from menu when variants exist", async () => {
    vi.useFakeTimers();
    const sentences = createMockSentences();
    const setSentences = vi.fn();
    const showNotification = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          variants: [{ text: "séntence", description: "test" }],
        }),
    });

    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences, showNotification),
    );

    await act(async () => {
      const promise = result.current.handleOpenVariantsFromMenu(
        "2",
        1,
        "sentence",
      );
      // Fast-forward the 500ms minimum display timer
      await vi.advanceTimersByTimeAsync(500);
      await promise;
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/variants",
      expect.any(Object),
    );
    expect(result.current.isVariantsPanelOpen).toBe(true);
    expect(result.current.variantsWord).toBe("sentence");
    expect(result.current.selectedTagIndex).toBe(1);
    expect(showNotification).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("should show warning notification when no variants found", async () => {
    vi.useFakeTimers();
    const sentences = createMockSentences();
    const setSentences = vi.fn();
    const showNotification = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ variants: [] }),
    });

    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences, showNotification),
    );

    await act(async () => {
      const promise = result.current.handleOpenVariantsFromMenu(
        "2",
        1,
        "sentence",
      );
      await vi.advanceTimersByTimeAsync(500);
      await promise;
    });

    expect(result.current.isVariantsPanelOpen).toBe(false);
    expect(showNotification).toHaveBeenCalledWith({ type: "warning", message: "Variante ei leitud", description: "Sõna ei leidu eesti keeles või on valesti kirjutatud." });
    vi.useRealTimers();
  });

  it("should show error notification on API failure", async () => {
    vi.useFakeTimers();
    const sentences = createMockSentences();
    const setSentences = vi.fn();
    const showNotification = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error"),
    );

    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences, showNotification),
    );

    await act(async () => {
      const promise = result.current.handleOpenVariantsFromMenu(
        "2",
        1,
        "sentence",
      );
      await vi.advanceTimersByTimeAsync(500);
      await promise;
    });

    expect(result.current.isVariantsPanelOpen).toBe(false);
    expect(showNotification).toHaveBeenCalledWith({ type: "error", message: "Variantide laadimine ebaõnnestus", description: "Sõna ei leidu eesti keeles või on valesti kirjutatud." });
    vi.useRealTimers();
  });

  it("should set and clear loadingVariantsTag during fetch", async () => {
    vi.useFakeTimers();
    const sentences = createMockSentences();
    const setSentences = vi.fn();
    const showNotification = vi.fn();

    let resolvePromise: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      fetchPromise,
    );

    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences, showNotification),
    );

    // Start the fetch
    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleOpenVariantsFromMenu("2", 1, "sentence");
    });

    // Loading state should be set
    expect(result.current.loadingVariantsTag).toEqual({
      sentenceId: "2",
      tagIndex: 1,
    });

    // Resolve the fetch
    await act(async () => {
      if (resolvePromise) {
        resolvePromise({
          ok: true,
          json: () => Promise.resolve({ variants: [{ text: "test" }] }),
        });
      }
      await vi.advanceTimersByTimeAsync(500);
      if (promise) await promise;
    });

    // Loading state should be cleared
    expect(result.current.loadingVariantsTag).toBeNull();
    vi.useRealTimers();
  });

  it("should open sentence phonetic panel", async () => {
    const sentences = createMockSentences();
    const setSentences = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ stressedText: "Héllo wórld" }),
    });

    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences),
    );

    await act(async () => {
      await result.current.handleExplorePhonetic("1");
    });

    expect(result.current.showSentencePhoneticPanel).toBe(true);
    expect(result.current.sentencePhoneticId).toBe("1");
  });

  it("should close sentence phonetic panel", async () => {
    const sentences = createMockSentences();
    const setSentences = vi.fn();
    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences),
    );

    await act(async () => {
      await result.current.handleExplorePhonetic("2");
    });

    act(() => {
      result.current.handleCloseSentencePhonetic();
    });

    expect(result.current.showSentencePhoneticPanel).toBe(false);
    expect(result.current.sentencePhoneticId).toBeNull();
  });

  it("should not open phonetic panel for empty sentence", async () => {
    const sentences: SentenceState[] = [
      {
        id: "1",
        text: "",
        tags: [],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
      },
    ];
    const setSentences = vi.fn();
    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences),
    );

    await act(async () => {
      await result.current.handleExplorePhonetic("1");
    });

    expect(result.current.showSentencePhoneticPanel).toBe(false);
  });

  it("should handle fetch error gracefully", async () => {
    const sentences = createMockSentences();
    const setSentences = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error"),
    );

    const { result } = renderHook(() =>
      useVariantsPanel(sentences, setSentences),
    );

    await act(async () => {
      await result.current.handleTagClick("1", 0, "Hello");
    });

    expect(result.current.isVariantsPanelOpen).toBe(true);
  });
});
