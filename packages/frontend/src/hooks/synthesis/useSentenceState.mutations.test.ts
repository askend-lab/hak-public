// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSentenceState } from "./useSentenceState";

describe("useSentenceState mutation kills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // --- INITIAL_SENTENCE defaults L22-32 ---
  it("initial sentence has id '1'", () => {
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.id).toBe("1");
  });

  it("initial sentence has empty text, tags, and currentInput", () => {
    const { result } = renderHook(() => useSentenceState());
    const s = result.current.sentences[0];
    expect(s?.text).toBe("");
    expect(s?.tags).toStrictEqual([]);
    expect(s?.currentInput).toBe("");
    expect(s?.isPlaying).toBe(false);
    expect(s?.isLoading).toBe(false);
  });

  // --- restoreFromStorage L50-67 ---
  it("restoreFromStorage generates id when stored id is missing", () => {
    localStorage.setItem("eki_synthesis_state", JSON.stringify([
      { text: "hi", tags: ["hi"], currentInput: "" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.id).toBeTruthy();
    expect(result.current.sentences[0]?.id.length).toBeGreaterThan(0);
  });

  it("restoreFromStorage uses empty string for missing text", () => {
    localStorage.setItem("eki_synthesis_state", JSON.stringify([
      { id: "x", tags: ["a"], currentInput: "" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.text).toBe("");
  });

  it("restoreFromStorage uses empty array for missing tags", () => {
    localStorage.setItem("eki_synthesis_state", JSON.stringify([
      { id: "x", text: "hi", currentInput: "" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.tags).toStrictEqual([]);
  });

  it("restoreFromStorage uses empty string for missing currentInput", () => {
    localStorage.setItem("eki_synthesis_state", JSON.stringify([
      { id: "x", text: "hi", tags: ["hi"] },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.currentInput).toBe("");
  });

  // --- loadInitialState L70-83 ---
  it("uses STORAGE_KEY 'eki_synthesis_state'", () => {
    localStorage.setItem("eki_synthesis_state", JSON.stringify([
      { id: "s1", text: "from storage", tags: ["from", "storage"], currentInput: "" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.text).toBe("from storage");
  });

  it("ignores non-array localStorage value", () => {
    localStorage.setItem("eki_synthesis_state", JSON.stringify({ id: "obj" }));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.id).toBe("1");
  });

  // --- persist to localStorage L101-112 ---
  it("skips persist on initial mount", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    renderHook(() => useSentenceState());
    const synthCalls = spy.mock.calls.filter((c) => c[0] === "eki_synthesis_state");
    expect(synthCalls).toHaveLength(0);
    spy.mockRestore();
  });

  it("persists sanitized state without isPlaying/isLoading", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.handleTextChange(result.current.sentences[0]?.id ?? "", "test"); });
    const stored = JSON.parse(localStorage.getItem("eki_synthesis_state") ?? "[]");
    expect(stored[0]).not.toHaveProperty("isPlaying");
    expect(stored[0]).not.toHaveProperty("isLoading");
    expect(stored[0].currentInput).toBe("test");
  });

  it("handles localStorage.setItem error gracefully", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const origSetItem = localStorage.setItem.bind(localStorage);
    const { result } = renderHook(() => useSentenceState());
    localStorage.setItem = (): void => { throw new Error("quota exceeded"); };
    act(() => { result.current.handleAddSentence(); });
    expect(spy).toHaveBeenCalled();
    localStorage.setItem = origSetItem;
    spy.mockRestore();
  });

  // --- Legacy migration L114-161 ---
  it("legacy migration splits text on whitespace and filters empty", () => {
    localStorage.setItem("eki_playlist_entries", JSON.stringify([
      { id: "p1", text: "  hello   world  " },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.tags).toStrictEqual(["hello", "world"]);
  });

  it("legacy migration sets stressedTags only when word count matches", () => {
    localStorage.setItem("eki_playlist_entries", JSON.stringify([
      { id: "p1", text: "hello world", stressedText: "héllo" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    // stressedText has 1 word, text has 2 → no match → stressedTags should be null
    expect(result.current.sentences[0]?.stressedTags).toBeNull();
  });

  it("legacy migration sets audioUrl from entry", () => {
    localStorage.setItem("eki_playlist_entries", JSON.stringify([
      { id: "p1", text: "hi", audioUrl: "http://audio.wav" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.audioUrl).toBe("http://audio.wav");
  });

  it("legacy migration sets phoneticText from stressedText", () => {
    localStorage.setItem("eki_playlist_entries", JSON.stringify([
      { id: "p1", text: "hi", stressedText: "hí" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.phoneticText).toBe("hí");
  });

  it("legacy migration ignores empty entries array", () => {
    localStorage.setItem("eki_playlist_entries", JSON.stringify([]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.id).toBe("1");
    expect(localStorage.getItem("eki_playlist_entries")).toBe("[]");
  });

  it("legacy migration handles corrupted data and removes key", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("eki_playlist_entries", "bad-json");
    renderHook(() => useSentenceState());
    expect(spy).toHaveBeenCalled();
    expect(localStorage.getItem("eki_playlist_entries")).toBeNull();
    spy.mockRestore();
  });

  it("legacy migration generates id when entry has no id", () => {
    localStorage.setItem("eki_playlist_entries", JSON.stringify([
      { text: "hi" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.id).toBeTruthy();
    expect(result.current.sentences[0]?.id).not.toBe("");
  });

  // --- Copied entries from sessionStorage L164-213 ---
  it("copied entries split text into tags correctly", () => {
    sessionStorage.setItem("copiedEntries", JSON.stringify([
      { id: "c1", text: "  one   two  " },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.tags).toStrictEqual(["one", "two"]);
  });

  it("copied entries set stressedTags when word count matches", () => {
    sessionStorage.setItem("copiedEntries", JSON.stringify([
      { id: "c1", text: "one two", stressedText: "óne twó" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.stressedTags).toStrictEqual(["óne", "twó"]);
  });

  it("copied entries ignores empty array", () => {
    sessionStorage.setItem("copiedEntries", JSON.stringify([]));
    const { result } = renderHook(() => useSentenceState());
    expect(result.current.sentences[0]?.id).toBe("1");
  });

  it("copied entries removes sessionStorage key after load", () => {
    sessionStorage.setItem("copiedEntries", JSON.stringify([
      { id: "c1", text: "test" },
    ]));
    renderHook(() => useSentenceState());
    expect(sessionStorage.getItem("copiedEntries")).toBeNull();
  });

  it("copied entries handles error and removes key", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    sessionStorage.setItem("copiedEntries", "not-json");
    renderHook(() => useSentenceState());
    expect(sessionStorage.getItem("copiedEntries")).toBeNull();
    spy.mockRestore();
  });

  // --- Demo sentences exact values L215-240 ---
  it("demo-2 has empty text and empty tags", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.setDemoSentences(); });
    const d2 = result.current.sentences[1];
    expect(d2?.text).toBe("");
    expect(d2?.currentInput).toBe("");
    expect(d2?.isPlaying).toBe(false);
    expect(d2?.isLoading).toBe(false);
    expect(d2?.phoneticText).toBeNull();
    expect(d2?.audioUrl).toBeNull();
    expect(d2?.stressedTags).toBeNull();
  });

  // --- handleTextChange L242-246 only updates matching id ---
  it("handleTextChange only updates target sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.handleAddSentence(); });
    const id0 = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleTextChange(id0, "changed"); });
    expect(result.current.sentences[0]?.currentInput).toBe("changed");
    expect(result.current.sentences[1]?.currentInput).toBe("");
  });

  // --- handleClearSentence L248-264 only clears matching id ---
  it("handleClearSentence only clears target sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.setDemoSentences(); });
    const id0 = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleClearSentence(id0); });
    expect(result.current.sentences[0]?.text).toBe("");
    expect(result.current.sentences[1]?.id).toBe("demo-2");
  });

  // --- handleAddSentence L266-281 new sentence defaults ---
  it("handleAddSentence generates unique id", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.handleAddSentence(); });
    const id0 = result.current.sentences[0]?.id;
    const id1 = result.current.sentences[1]?.id;
    expect(id0).not.toBe(id1);
  });

  // --- handleRemoveSentence L283-296 ---
  it("handleRemoveSentence filters correct sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.setDemoSentences(); });
    expect(result.current.sentences).toHaveLength(2);
    const id1 = result.current.sentences[1]?.id ?? "";
    act(() => { result.current.handleRemoveSentence(id1); });
    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]?.id).toBe("demo-1");
  });

  it("handleRemoveSentence does not revoke when no audioUrl", () => {
    global.URL.revokeObjectURL = vi.fn();
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.handleAddSentence(); });
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleRemoveSentence(id, true); });
    expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  // --- updateAllSentences L307-309 ---
  it("updateAllSentences merges updates into every sentence", () => {
    const { result } = renderHook(() => useSentenceState());
    act(() => { result.current.handleAddSentence(); });
    act(() => { result.current.updateAllSentences({ isLoading: true }); });
    expect(result.current.sentences.every((s) => s.isLoading)).toBe(true);
  });

  // --- ensureSentenceState L9-20 ---
  it("ensureSentenceState fills phoneticText, audioUrl, stressedTags with null", () => {
    localStorage.setItem("eki_synthesis_state", JSON.stringify([
      { id: "s1", text: "t", tags: ["t"], currentInput: "" },
    ]));
    const { result } = renderHook(() => useSentenceState());
    const s = result.current.sentences[0];
    expect(s?.phoneticText).toBeNull();
    expect(s?.audioUrl).toBeNull();
    expect(s?.stressedTags).toBeNull();
  });
});
