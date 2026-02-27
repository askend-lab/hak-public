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
