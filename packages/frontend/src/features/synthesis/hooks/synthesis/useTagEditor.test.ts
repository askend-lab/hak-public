// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTagEditor } from "./useTagEditor";
import type { SentenceState } from "@/types/synthesis";

describe("useTagEditor", () => {
  const makeSentence = (overrides: Partial<SentenceState> = {}): SentenceState => ({
    id: "s1",
    text: "Hello world",
    tags: ["Hello", "world"],
    currentInput: "",
    isPlaying: false,
    isLoading: false,
    ...overrides,
  });

  const setup = (sentence?: SentenceState) => {
    const s = sentence ?? makeSentence();
    const getSentence = vi.fn((id: string) => (id === s.id ? s : undefined));
    const updateSentence = vi.fn();
    const hook = renderHook(() => useTagEditor(getSentence, updateSentence));
    return { result: hook.result, getSentence, updateSentence, sentence: s };
  };

  describe("handleInputBlur", () => {
    it("does nothing if sentence not found", () => {
      const { result, updateSentence } = setup();
      act(() => result.current.handleInputBlur("nonexistent"));
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("does nothing if currentInput is empty", () => {
      const { result, updateSentence } = setup(makeSentence({ currentInput: "" }));
      act(() => result.current.handleInputBlur("s1"));
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("does nothing if currentInput is whitespace only", () => {
      const { result, updateSentence } = setup(makeSentence({ currentInput: "   " }));
      act(() => result.current.handleInputBlur("s1"));
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("does nothing if tags are empty", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: [], currentInput: "word" }),
      );
      act(() => result.current.handleInputBlur("s1"));
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("merges input words into tags and clears input", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello"], currentInput: "beautiful world" }),
      );
      act(() => result.current.handleInputBlur("s1"));
      expect(updateSentence).toHaveBeenCalledWith("s1", {
        tags: ["Hello", "beautiful", "world"],
        currentInput: "",
        text: "Hello beautiful world",
        phoneticText: undefined,
        audioUrl: undefined,
      });
    });
  });

  describe("addTagsToSentence", () => {
    it("returns null if sentence not found", () => {
      const { result } = setup();
      let res: string | null = null;
      act(() => { res = result.current.addTagsToSentence("nonexistent", "word"); });
      expect(res).toBeNull();
    });

    it("adds input words to tags and returns new text", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello"], text: "Hello", currentInput: "" }),
      );
      let res: string | null = null;
      act(() => { res = result.current.addTagsToSentence("s1", "world"); });
      expect(res).toBe("Hello world");
      expect(updateSentence).toHaveBeenCalledWith("s1", expect.objectContaining({
        tags: ["Hello", "world"],
        currentInput: "",
        text: "Hello world",
      }));
    });

    it("invalidates cache when text changes", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello"], text: "Hello", currentInput: "" }),
      );
      act(() => { result.current.addTagsToSentence("s1", "world"); });
      expect(updateSentence).toHaveBeenCalledWith("s1", expect.objectContaining({
        phoneticText: undefined,
        audioUrl: undefined,
      }));
    });

    it("does not invalidate cache when text is unchanged", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello", "world"], text: "Hello world", currentInput: "" }),
      );
      act(() => { result.current.addTagsToSentence("s1", ""); });
      const call = updateSentence.mock.calls[0]?.[1] as Record<string, unknown> | undefined;
      expect(call?.phoneticText).toBeUndefined();
      expect(call?.audioUrl).toBeUndefined();
    });
  });

  describe("removeLastTag", () => {
    it("does nothing if sentence not found", () => {
      const { result, updateSentence } = setup();
      act(() => result.current.removeLastTag("nonexistent"));
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("does nothing if tags are empty", () => {
      const { result, updateSentence } = setup(makeSentence({ tags: [] }));
      act(() => result.current.removeLastTag("s1"));
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("removes last tag and puts it in currentInput", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello", "world"] }),
      );
      act(() => result.current.removeLastTag("s1"));
      expect(updateSentence).toHaveBeenCalledWith("s1", {
        tags: ["Hello"],
        currentInput: "world",
        text: "Hello",
        phoneticText: undefined,
        audioUrl: undefined,
      });
    });

    it("removes the only tag", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["only"] }),
      );
      act(() => result.current.removeLastTag("s1"));
      expect(updateSentence).toHaveBeenCalledWith("s1", {
        tags: [],
        currentInput: "only",
        text: "",
        phoneticText: undefined,
        audioUrl: undefined,
      });
    });
  });

});
