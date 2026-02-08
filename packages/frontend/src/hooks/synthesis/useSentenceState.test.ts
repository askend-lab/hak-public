// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSentenceState } from "./useSentenceState";

describe("useSentenceState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
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
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
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

  it("loads copied entries from sessionStorage", () => {
    sessionStorage.setItem(
      "copiedEntries",
      JSON.stringify([
        { id: "c1", text: "copied text", stressedText: "co`pied text" },
      ]),
    );
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.text).toBe("copied text");
    expect(sessionStorage.getItem("copiedEntries")).toBeNull();
  });

  it("handles corrupted sessionStorage gracefully", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    sessionStorage.setItem("copiedEntries", "bad-json");
    renderHook(() => useSentenceState());
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("persists to localStorage on change", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => {
      result.current.setDemoSentences();
    });
    const stored = localStorage.getItem("eki_synthesis_state");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed[0].text).toBe("Noormees läks kooli");
    // isPlaying should not be stored
    expect(parsed[0].isPlaying).toBeUndefined();
  });
});
