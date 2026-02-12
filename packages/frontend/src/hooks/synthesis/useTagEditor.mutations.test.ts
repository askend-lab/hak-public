// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTagEditor } from "./useTagEditor";
import type { SentenceState } from "@/types/synthesis";

const makeSentence = (overrides: Partial<SentenceState> = {}): SentenceState => ({
  id: "s1", text: "Hello world", tags: ["Hello", "world"],
  currentInput: "", isPlaying: false, isLoading: false, ...overrides,
});

const setup = (sentence?: SentenceState) => {
  const s = sentence ?? makeSentence();
  const getSentence = vi.fn((id: string) => (id === s.id ? s : undefined));
  const updateSentence = vi.fn();
  const hook = renderHook(() => useTagEditor(getSentence, updateSentence));
  return { result: hook.result, updateSentence, sentence: s };
};

describe("useTagEditor mutation kills", () => {
  // --- handleInputBlur: trim/split/filter L30-33 ---
  it("handleInputBlur trims and splits on whitespace correctly", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: ["A"], currentInput: "  foo   bar  " }),
    );
    act(() => result.current.handleInputBlur("s1"));
    const call = updateSentence.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(call.tags).toStrictEqual(["A", "foo", "bar"]);
    expect(call.text).toBe("A foo bar");
    expect(call.currentInput).toBe("");
  });

  it("handleInputBlur filters empty strings from split", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: ["X"], currentInput: "   " }),
    );
    act(() => result.current.handleInputBlur("s1"));
    // Whitespace-only input trims to empty, so nothing should happen
    expect(updateSentence).not.toHaveBeenCalled();
  });

  // --- addTagsToSentence: trim/split/filter L53-56 ---
  it("addTagsToSentence splits multi-space input into separate words", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: [], text: "", currentInput: "" }),
    );
    let res: string | null = null;
    act(() => { res = result.current.addTagsToSentence("s1", "  a   b  "); });
    expect(res).toBe("a b");
    const call = updateSentence.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(call.tags).toStrictEqual(["a", "b"]);
  });

  it("addTagsToSentence filters zero-length words", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: ["X"], text: "X", currentInput: "" }),
    );
    act(() => { result.current.addTagsToSentence("s1", "  "); });
    const call = updateSentence.mock.calls[0]?.[1] as Record<string, unknown>;
    // Empty input after trim produces no new words
    expect(call.tags).toStrictEqual(["X"]);
    expect(call.text).toBe("X");
  });

  // --- addTagsToSentence: cache invalidation L59,67 ---
  it("addTagsToSentence invalidates cache when text changes", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: ["A"], text: "A", currentInput: "" }),
    );
    act(() => { result.current.addTagsToSentence("s1", "B"); });
    const call = updateSentence.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(call.phoneticText).toBeUndefined();
    expect(call.audioUrl).toBeUndefined();
  });

  it("addTagsToSentence does NOT invalidate cache when text unchanged", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: ["A", "B"], text: "A B", currentInput: "" }),
    );
    act(() => { result.current.addTagsToSentence("s1", ""); });
    const call = updateSentence.mock.calls[0]?.[1] as Record<string, unknown>;
    // When text is same, phoneticText and audioUrl should not be in updates
    expect(Object.prototype.hasOwnProperty.call(call, "phoneticText")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(call, "audioUrl")).toBe(false);
  });

  // --- removeLastTag: join with space L89 ---
  it("removeLastTag joins remaining tags with space separator", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: ["A", "B", "C"] }),
    );
    act(() => result.current.removeLastTag("s1"));
    const call = updateSentence.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(call.text).toBe("A B");
    expect(call.currentInput).toBe("C");
  });

  // --- handleKeyDown: space key checks L108 ---
  it("space key requires non-empty trimmed input", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: ["A"], currentInput: "  " }),
    );
    const e = { key: " ", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
    // Whitespace-only currentInput trims to empty, so no action
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(updateSentence).not.toHaveBeenCalled();
  });

  // --- handleKeyDown: Enter with input L115-119 ---
  it("Enter with input calls onSynthesize with full text", () => {
    const onSynthesize = vi.fn();
    const { result } = setup(
      makeSentence({ tags: ["X"], text: "X", currentInput: "Y" }),
    );
    const e = { key: "Enter", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => result.current.handleKeyDown(e, "s1", onSynthesize));
    expect(onSynthesize).toHaveBeenCalledWith("s1", "X Y");
  });

  it("Enter with whitespace-only input and tags calls onSynthesize without text", () => {
    const onSynthesize = vi.fn();
    const { result } = setup(
      makeSentence({ tags: ["X"], currentInput: "   " }),
    );
    const e = { key: "Enter", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => result.current.handleKeyDown(e, "s1", onSynthesize));
    expect(onSynthesize).toHaveBeenCalledWith("s1");
  });

  // --- handleKeyDown: Backspace L124-126 ---
  it("Backspace with non-empty currentInput does nothing", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: ["A", "B"], currentInput: "x" }),
    );
    const e = { key: "Backspace", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(updateSentence).not.toHaveBeenCalled();
  });

  it("Backspace with empty tags does nothing", () => {
    const { result, updateSentence } = setup(
      makeSentence({ tags: [], currentInput: "" }),
    );
    const e = { key: "Backspace", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => result.current.handleKeyDown(e, "s1", vi.fn()));
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(updateSentence).not.toHaveBeenCalled();
  });
});
