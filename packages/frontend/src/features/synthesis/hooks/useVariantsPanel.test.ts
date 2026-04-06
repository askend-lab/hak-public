// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVariantsPanel } from "./useVariantsPanel";
import { SentenceState } from "@/types/synthesis";
import { useSentenceStore } from "./synthesis/useSentenceState";

vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: { getAccessToken: vi.fn(() => "test-token") },
}));

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
    localStorage.clear();
    useSentenceStore.getState()._reset();
  });

  it("should initialize with closed panel", () => {
    useSentenceStore.getState().setSentences(createMockSentences());
    const { result } = renderHook(() =>
      useVariantsPanel(),
    );

    expect(result.current.isVariantsPanelOpen).toBe(false);
    expect(result.current.variantsWord).toBeNull();
    expect(result.current.selectedSentenceId).toBeNull();
    expect(result.current.selectedTagIndex).toBeNull();
    expect(result.current.loadingVariantsTag).toBeNull();
  });

  it("should open variants panel with existing stressedTags", async () => {
    useSentenceStore.getState().setSentences(createMockSentences());
    const { result } = renderHook(() =>
      useVariantsPanel(),
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
    useSentenceStore.getState().setSentences(createMockSentences());

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ stressedText: "Héllo wórld" }),
    });

    const { result } = renderHook(() =>
      useVariantsPanel(),
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
    useSentenceStore.getState().setSentences(createMockSentences());
    const { result } = renderHook(() =>
      useVariantsPanel(),
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
    useSentenceStore.getState().setSentences(createMockSentences());
    const showNotification = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          variants: [{ text: "séntence", description: "test" }],
        }),
    });

    const { result } = renderHook(() =>
      useVariantsPanel(undefined, undefined, showNotification),
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
    useSentenceStore.getState().setSentences(createMockSentences());
    const showNotification = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ variants: [] }),
    });

    const { result } = renderHook(() =>
      useVariantsPanel(undefined, undefined, showNotification),
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

});
