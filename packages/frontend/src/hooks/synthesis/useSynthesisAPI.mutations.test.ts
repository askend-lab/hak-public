// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisAPI } from "./useSynthesisAPI";

vi.mock("@/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
}));
vi.mock("@/types/synthesis", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/types/synthesis")>();
  return { ...actual, getVoiceModel: (): string => "mari" };
});

describe("useSynthesisAPI mutation kills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  // --- synthesizeText L54-57: stressedTags extraction ---
  it("stressedTags trims, splits on whitespace, and filters empty", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stressedText: "  héllo   wórld  " }),
    });
    const { result } = renderHook(() => useSynthesisAPI());
    const res = await act(async () => result.current.synthesizeText("hello world"));
    expect(res.stressedTags).toStrictEqual(["héllo", "wórld"]);
    expect(res.stressedTags?.every((t: string) => t.length > 0)).toBe(true);
  });

  it("stressedTags splits tab-separated words correctly", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stressedText: "á\t\tb́" }),
    });
    const { result } = renderHook(() => useSynthesisAPI());
    const res = await act(async () => result.current.synthesizeText("a b"));
    expect(res.stressedTags).toStrictEqual(["á", "b́"]);
  });

  it("stressedTags filter removes zero-length strings", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stressedText: "  á  " }),
    });
    const { result } = renderHook(() => useSynthesisAPI());
    const res = await act(async () => result.current.synthesizeText("a"));
    expect(res.stressedTags).toHaveLength(1);
    expect(res.stressedTags?.[0]).toBe("á");
  });

  it("stressedTags undefined when phoneticText provided", async () => {
    const { result } = renderHook(() => useSynthesisAPI());
    const res = await act(async () => result.current.synthesizeText("hello", "héllo"));
    expect(res.stressedTags).toBeUndefined();
  });

  it("stressedTags undefined when analyzeText returns no stressedText", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stressedText: null }),
    });
    const { result } = renderHook(() => useSynthesisAPI());
    const res = await act(async () => result.current.synthesizeText("hello"));
    expect(res.stressedTags).toBeUndefined();
  });
});
