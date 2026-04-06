// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, beforeEach } from "vitest";
import { useSentenceStore, createEmptySentence, INITIAL_SENTENCE } from "./synthesisStore";

describe("synthesisStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useSentenceStore.getState()._reset();
  });

  describe("initial state", () => {
    it("starts with one empty sentence", () => {
      const state = useSentenceStore.getState();
      expect(state.sentences).toHaveLength(1);
      expect(state.sentences[0]?.text).toBe("");
    });

    it("has isPlayingAll false initially", () => {
      expect(useSentenceStore.getState().isPlayingAll).toBe(false);
    });

    it("has isLoadingPlayAll false initially", () => {
      expect(useSentenceStore.getState().isLoadingPlayAll).toBe(false);
    });
  });

  describe("setSentences", () => {
    it("sets sentences with array", () => {
      const newSentences = [createEmptySentence("test-1")];
      useSentenceStore.getState().setSentences(newSentences);
      expect(useSentenceStore.getState().sentences).toEqual(newSentences);
    });

    it("sets sentences with updater function", () => {
      useSentenceStore.getState().setSentences((prev) => [...prev, createEmptySentence("test-2")]);
      expect(useSentenceStore.getState().sentences).toHaveLength(2);
    });
  });

  describe("setIsPlayingAll", () => {
    it("sets isPlayingAll to true", () => {
      useSentenceStore.getState().setIsPlayingAll(true);
      expect(useSentenceStore.getState().isPlayingAll).toBe(true);
    });

    it("sets isPlayingAll to false", () => {
      useSentenceStore.getState().setIsPlayingAll(true);
      useSentenceStore.getState().setIsPlayingAll(false);
      expect(useSentenceStore.getState().isPlayingAll).toBe(false);
    });
  });

  describe("setIsLoadingPlayAll", () => {
    it("sets isLoadingPlayAll to true", () => {
      useSentenceStore.getState().setIsLoadingPlayAll(true);
      expect(useSentenceStore.getState().isLoadingPlayAll).toBe(true);
    });

    it("sets isLoadingPlayAll to false", () => {
      useSentenceStore.getState().setIsLoadingPlayAll(true);
      useSentenceStore.getState().setIsLoadingPlayAll(false);
      expect(useSentenceStore.getState().isLoadingPlayAll).toBe(false);
    });
  });

  describe("_reset", () => {
    it("resets sentences to initial state", () => {
      useSentenceStore.getState().setSentences([createEmptySentence("test")]);
      useSentenceStore.getState()._reset();
      expect(useSentenceStore.getState().sentences).toHaveLength(1);
      expect(useSentenceStore.getState().sentences[0]?.id).toBe("1");
    });

    it("resets isPlayingAll to false", () => {
      useSentenceStore.getState().setIsPlayingAll(true);
      useSentenceStore.getState()._reset();
      expect(useSentenceStore.getState().isPlayingAll).toBe(false);
    });

    it("resets isLoadingPlayAll to false", () => {
      useSentenceStore.getState().setIsLoadingPlayAll(true);
      useSentenceStore.getState()._reset();
      expect(useSentenceStore.getState().isLoadingPlayAll).toBe(false);
    });
  });

  describe("createEmptySentence", () => {
    it("creates sentence with correct defaults", () => {
      const s = createEmptySentence("test-id");
      expect(s.id).toBe("test-id");
      expect(s.text).toBe("");
      expect(s.tags).toEqual([]);
      expect(s.isPlaying).toBe(false);
      expect(s.isLoading).toBe(false);
      expect(s.currentInput).toBe("");
      expect(s.phoneticText).toBeNull();
      expect(s.audioUrl).toBeNull();
      expect(s.stressedTags).toBeNull();
    });
  });

  describe("INITIAL_SENTENCE", () => {
    it("has id 1", () => {
      expect(INITIAL_SENTENCE.id).toBe("1");
    });
  });

  describe("persistence", () => {
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
});
