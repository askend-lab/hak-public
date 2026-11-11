// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, beforeEach } from "vitest";
import { useSentenceStore, createEmptySentence } from "./synthesisStore";

describe("synthesisStore persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    useSentenceStore.getState()._reset();
  });

  it("persists sentences to localStorage", () => {
    const sentence = { ...createEmptySentence("persist-test"), text: "Hello", tags: ["Hello"] };
    useSentenceStore.getState().setSentences([sentence]);
    const stored = localStorage.getItem("eki_synthesis_state");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored ?? "{}");
    expect(parsed.state?.sentences?.[0]?.text).toBe("Hello");
  });

  it("does not persist isPlaying and isLoading", () => {
    const sentence = { ...createEmptySentence("persist-test"), isPlaying: true, isLoading: true };
    useSentenceStore.getState().setSentences([sentence]);
    const stored = localStorage.getItem("eki_synthesis_state");
    const parsed = JSON.parse(stored ?? "{}");
    expect(parsed.state?.sentences?.[0]?.isPlaying).toBeUndefined();
    expect(parsed.state?.sentences?.[0]?.isLoading).toBeUndefined();
  });

  it("restores sentences from localStorage on rehydrate", () => {
    const storedData = {
      state: { sentences: [{ id: "restored", text: "Restored", tags: ["Restored"], currentInput: "" }] },
      version: 0,
    };
    localStorage.setItem("eki_synthesis_state", JSON.stringify(storedData));
    useSentenceStore.persist.rehydrate();
    expect(useSentenceStore.getState().sentences[0]?.text).toBe("Restored");
  });

  it("restores with defaults for missing fields", () => {
    const storedData = {
      state: { sentences: [{ id: "partial", text: "Partial" }] },
      version: 0,
    };
    localStorage.setItem("eki_synthesis_state", JSON.stringify(storedData));
    useSentenceStore.persist.rehydrate();
    const s = useSentenceStore.getState().sentences[0];
    expect(s?.isPlaying).toBe(false);
    expect(s?.isLoading).toBe(false);
    expect(s?.phoneticText).toBeNull();
  });

  it("uses initial state when localStorage is empty", () => {
    localStorage.clear();
    useSentenceStore.persist.rehydrate();
    expect(useSentenceStore.getState().sentences).toHaveLength(1);
  });
});
