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

  describe("handleKeyDown", () => {
    const makeKeyEvent = (key: string, extra: Partial<React.KeyboardEvent> = {}): React.KeyboardEvent =>
      ({ key, preventDefault: vi.fn(), ...extra }) as unknown as React.KeyboardEvent;

    it("does nothing if sentence not found", () => {
      const { result, updateSentence } = setup();
      const e = makeKeyEvent("Enter");
      act(() => result.current.handleKeyDown(e, "nonexistent", vi.fn()));
      expect(updateSentence).not.toHaveBeenCalled();
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it("adds tags on space when input has text and tags exist", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello"], currentInput: "world" }),
      );
      const e = makeKeyEvent(" ");
      act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
      expect(e.preventDefault).toHaveBeenCalled();
      expect(updateSentence).toHaveBeenCalled();
    });

    it("does not add tags on space when tags are empty", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: [], currentInput: "word" }),
      );
      const e = makeKeyEvent(" ");
      act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("does not add tags on space when input is empty", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello"], currentInput: "" }),
      );
      const e = makeKeyEvent(" ");
      act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("synthesizes on Enter with input text", () => {
      const onSynthesize = vi.fn();
      const { result } = setup(
        makeSentence({ tags: ["Hello"], currentInput: "world" }),
      );
      const e = makeKeyEvent("Enter");
      act(() => result.current.handleKeyDown(e, "s1", onSynthesize));
      expect(e.preventDefault).toHaveBeenCalled();
      expect(onSynthesize).toHaveBeenCalledWith("s1", "Hello world");
    });

    it("synthesizes on Enter with no input but has tags", () => {
      const onSynthesize = vi.fn();
      const { result } = setup(
        makeSentence({ tags: ["Hello", "world"], currentInput: "" }),
      );
      const e = makeKeyEvent("Enter");
      act(() => result.current.handleKeyDown(e, "s1", onSynthesize));
      expect(e.preventDefault).toHaveBeenCalled();
      expect(onSynthesize).toHaveBeenCalledWith("s1");
    });

    it("does not synthesize on Enter with no input and no tags", () => {
      const onSynthesize = vi.fn();
      const { result } = setup(
        makeSentence({ tags: [], currentInput: "" }),
      );
      const e = makeKeyEvent("Enter");
      act(() => result.current.handleKeyDown(e, "s1", onSynthesize));
      expect(onSynthesize).not.toHaveBeenCalled();
    });

    it("removes last tag on Backspace with empty input", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello", "world"], currentInput: "" }),
      );
      const e = makeKeyEvent("Backspace");
      act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
      expect(e.preventDefault).toHaveBeenCalled();
      expect(updateSentence).toHaveBeenCalledWith("s1", expect.objectContaining({
        tags: ["Hello"],
        currentInput: "world",
      }));
    });

    it("does not remove tag on Backspace when input has text", () => {
      const { result, updateSentence } = setup(
        makeSentence({ tags: ["Hello"], currentInput: "w" }),
      );
      const e = makeKeyEvent("Backspace");
      act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(updateSentence).not.toHaveBeenCalled();
    });

    it("does nothing for unrelated keys", () => {
      const { result, updateSentence } = setup();
      const e = makeKeyEvent("a");
      act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(updateSentence).not.toHaveBeenCalled();
    });
  });

});
