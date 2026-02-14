// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { renderHook, act } from "@testing-library/react";
import { useSentenceState } from "./useSentenceState";

let mockConsumeResult: unknown[] | null = null;
vi.mock("@/contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({
    copiedEntries: null,
    setCopiedEntries: vi.fn(),
    consumeCopiedEntries: vi.fn(() => {
      const result = mockConsumeResult;
      mockConsumeResult = null;
      return result;
    }),
    hasCopiedEntries: false,
  }),
}));

describe("useSentenceState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockConsumeResult = null;
  });

  it("initializes with default sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]?.text).toBe("");
  });

  it("loads from localStorage", () => {
    localStorage.setItem(
      "eki_synthesis_state",
      JSON.stringify([
        { id: "s1", text: "Hello", tags: ["Hello"], currentInput: "" },
      ]),
    );
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.text).toBe("Hello");
    expect(result.current.sentences[0]?.isPlaying).toBe(false);
  });

  it("handles corrupted localStorage gracefully", () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    localStorage.setItem("eki_synthesis_state", "not-json");
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences).toHaveLength(1);
    spy.mockRestore();
  });

  it("setDemoSentences sets demo data", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.setDemoSentences();
    });
    expect(result.current.sentences[0]?.text).toBe("Noormees läks kooli");
  });

  it("handleTextChange updates currentInput", () => {
    const { result } = renderHook(() => useSentenceState());
    const id = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.handleTextChange(id, "hello");
    });
    expect(result.current.sentences[0]?.currentInput).toBe("hello");
  });

  it("handleClearSentence resets sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.setDemoSentences();
    });
    const id = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.handleClearSentence(id);
    });
    expect(result.current.sentences[0]?.text).toBe("");
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it("handleAddSentence adds new sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.handleAddSentence();
    });
    expect(result.current.sentences).toHaveLength(2);
  });

  it("handleRemoveSentence removes sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.handleAddSentence();
    });
    const id = result.current.sentences[1]?.id || "";
    act(() => {
      result.current.handleRemoveSentence(id);
    });
    expect(result.current.sentences).toHaveLength(1);
  });

  it("handleRemoveSentence resets to initial when last sentence removed", () => {
    const { result } = renderHook(() => useSentenceState());
    const id = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.handleRemoveSentence(id);
    });
    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]?.id).toBe("1");
  });

  it("handleRemoveSentence revokes URL when requested", () => {
    global.URL.revokeObjectURL = vi.fn();
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.updateSentence(result.current.sentences[0]?.id || "", {
        audioUrl: "blob:test",
      });
    });
    const id = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.handleRemoveSentence(id, true);
    });
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });

  it("updateSentence updates specific sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    const id = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.updateSentence(id, { isPlaying: true });
    });
    expect(result.current.sentences[0]?.isPlaying).toBe(true);
  });

  it("updateAllSentences updates all sentences", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.handleAddSentence();
    });
    act(() => {
      result.current.updateAllSentences({ isPlaying: false, isLoading: false });
    });
    expect(result.current.sentences.every((s) => !s.isPlaying)).toBe(true);
  });

  it("getSentence returns sentence by id", () => {
    const { result } = renderHook(() => useSentenceState());
    const id = result.current.sentences[0]?.id || "";
    expect(result.current.getSentence(id)?.id).toBe(id);
    expect(result.current.getSentence("nonexistent")).toBeUndefined();
  });

  it("migrates legacy eki_playlist_entries", () => {
    localStorage.setItem(
      "eki_playlist_entries",
      JSON.stringify([
        {
          id: "p1",
          text: "hello world",
          stressedText: "he`llo world",
          audioUrl: "http://audio.mp3",
        },
      ]),
    );
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.text).toBe("hello world");
    expect(localStorage.getItem("eki_playlist_entries")).toBeNull();
  });

  it("loads copied entries from context", () => {
    mockConsumeResult = [
      { id: "c1", text: "copied text", stressedText: "co`pied text" },
    ];
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.text).toBe("copied text");
  });

  it("persists to localStorage on change", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.setDemoSentences();
    });
    const stored = localStorage.getItem("eki_synthesis_state");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored ?? "[]");
    expect(parsed[0].text).toBe("Noormees läks kooli");
    expect(parsed[0].isPlaying).toBeUndefined();
    expect(parsed[0].isLoading).toBeUndefined();
  });

  it("handleClearSentence resets all fields including phonetic and audio", () => {
    const { result } = renderHook(() => useSentenceState());
    const id = result.current.sentences[0]?.id || "";
    act(() => {
      result.current.updateSentence(id, {
        text: "test",
        tags: ["test"],
        currentInput: "input",
        stressedTags: ["tést"],
        phoneticText: "tést",
        audioUrl: "blob:url",
      });
    });
    act(() => {
      result.current.handleClearSentence(id);
    });
    const s = result.current.sentences[0];
    expect(s?.text).toBe("");
    expect(s?.tags).toEqual([]);
    expect(s?.currentInput).toBe("");
    expect(s?.stressedTags).toBeNull();
    expect(s?.phoneticText).toBeNull();
    expect(s?.audioUrl).toBeNull();
  });

  it("demo sentences have exact structure", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.setDemoSentences();
    });
    expect(result.current.sentences).toHaveLength(2);
    const d1 = result.current.sentences[0];
    expect(d1?.id).toBe("demo-1");
    expect(d1?.tags).toStrictEqual(["Noormees", "läks", "kooli"]);
    expect(d1?.isPlaying).toBe(false);
    expect(d1?.isLoading).toBe(false);
    expect(d1?.phoneticText).toBeNull();
    expect(d1?.audioUrl).toBeNull();
    expect(d1?.stressedTags).toBeNull();
    const d2 = result.current.sentences[1];
    expect(d2?.id).toBe("demo-2");
    expect(d2?.tags).toStrictEqual([]);
  });

  it("new sentence has correct defaults", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.handleAddSentence();
    });
    const s = result.current.sentences[1];
    expect(s?.text).toBe("");
    expect(s?.tags).toStrictEqual([]);
    expect(s?.isPlaying).toBe(false);
    expect(s?.isLoading).toBe(false);
    expect(s?.currentInput).toBe("");
    expect(s?.phoneticText).toBeNull();
    expect(s?.audioUrl).toBeNull();
    expect(s?.stressedTags).toBeNull();
  });

  it("legacy migration splits text into tags correctly", () => {
    localStorage.setItem(
      "eki_playlist_entries",
      JSON.stringify([{ id: "p1", text: "hello  world  test" }]),
    );
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.tags).toStrictEqual(["hello", "world", "test"]);
  });

  it("legacy migration sets stressedTags when word counts match", () => {
    localStorage.setItem(
      "eki_playlist_entries",
      JSON.stringify([{ id: "p1", text: "hello world", stressedText: "héllo wórld" }]),
    );
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.stressedTags).toStrictEqual(["héllo", "wórld"]);
    expect(result.current.sentences[0]?.phoneticText).toBe("héllo wórld");
  });

  it("restoreFromStorage fills defaults for missing fields", () => {
    localStorage.setItem(
      "eki_synthesis_state",
      JSON.stringify([{ id: "s1", text: "hi", tags: ["hi"] }]),
    );
    const { result } = renderHook(() => useSentenceState());
    const s = result.current.sentences[0];
    expect(s?.isPlaying).toBe(false);
    expect(s?.isLoading).toBe(false);
    expect(s?.currentInput).toBe("");
    expect(s?.phoneticText).toBeNull();
    expect(s?.audioUrl).toBeNull();
    expect(s?.stressedTags).toBeNull();
  });

  it("does not revoke URL when revokeUrl is false", () => {
    global.URL.revokeObjectURL = vi.fn();
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.updateSentence(result.current.sentences[0]?.id || "", { audioUrl: "blob:x" });
    });
    act(() => {
      result.current.handleRemoveSentence(result.current.sentences[0]?.id || "", false);
    });
    expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("falls back to default when localStorage has empty array", () => {
    localStorage.setItem("eki_synthesis_state", "[]");
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]?.id).toBe("1");
  });

  it("updateSentence does not affect other sentences", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.handleAddSentence(); });
    const id0 = result.current.sentences[0]?.id || "";
    act(() => { result.current.updateSentence(id0, { isPlaying: true }); });
    expect(result.current.sentences[0]?.isPlaying).toBe(true);
    expect(result.current.sentences[1]?.isPlaying).toBe(false);
  });
});
