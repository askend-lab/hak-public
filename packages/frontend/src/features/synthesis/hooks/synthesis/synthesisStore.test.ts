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

  describe("editingTag", () => {
    it("starts as null", () => {
      expect(useSentenceStore.getState().editingTag).toBeNull();
    });

    it("sets editing tag", () => {
      useSentenceStore.getState().setEditingTag({ sentenceId: "1", tagIndex: 0, value: "test" });
      expect(useSentenceStore.getState().editingTag).toEqual({ sentenceId: "1", tagIndex: 0, value: "test" });
    });

    it("clears editing tag", () => {
      useSentenceStore.getState().setEditingTag({ sentenceId: "1", tagIndex: 0, value: "test" });
      useSentenceStore.getState().setEditingTag(null);
      expect(useSentenceStore.getState().editingTag).toBeNull();
    });
  });

  describe("openTagMenu", () => {
    it("starts as null", () => {
      expect(useSentenceStore.getState().openTagMenu).toBeNull();
    });

    it("sets open tag menu", () => {
      useSentenceStore.getState().setOpenTagMenu({ sentenceId: "1", tagIndex: 2 });
      expect(useSentenceStore.getState().openTagMenu).toEqual({ sentenceId: "1", tagIndex: 2 });
    });

    it("clears open tag menu", () => {
      useSentenceStore.getState().setOpenTagMenu({ sentenceId: "1", tagIndex: 2 });
      useSentenceStore.getState().setOpenTagMenu(null);
      expect(useSentenceStore.getState().openTagMenu).toBeNull();
    });
  });

  describe("INITIAL_SENTENCE", () => {
    it("has id 1", () => {
      expect(INITIAL_SENTENCE.id).toBe("1");
    });
  });
});
