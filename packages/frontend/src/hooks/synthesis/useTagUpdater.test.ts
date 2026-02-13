// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTagUpdater } from "./useTagUpdater";
import type { SentenceState } from "@/types/synthesis";

describe("useTagUpdater", () => {
  it("should update sentence tags using transformer", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.updateSentenceTags("test-1", () => ({
        text: "updated text",
      }));
    });

    expect(mockSetSentences).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should delete tag at specific index", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.deleteTag("test-1", 1);
    });

    expect(mockSetSentences).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should replace tag at specific index", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.replaceTag("test-1", 0, ["hi", "there"]);
    });

    expect(mockSetSentences).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should update stressed tag", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.updateStressedTag("test-1", 0, "stressed-hello");
    });

    expect(mockSetSentences).toHaveBeenCalledWith(expect.any(Function));
  });

  it("deleteTag filters stressedTags when present", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.deleteTag("s1", 1);
    });

    const updater = mockSetSentences.mock.calls[0]?.[0] as (
      prev: {
        id: string;
        tags: string[];
        stressedTags?: string[];
        text: string;
      }[],
    ) => {
      id: string;
      tags: string[];
      stressedTags?: string[];
      text: string;
    }[];
    const prev = [
      {
        id: "s1",
        tags: ["a", "b", "c"],
        stressedTags: ["sa", "sb", "sc"],
        text: "a b c",
      },
    ];
    const result2 = updater(prev as never);
    expect(result2[0]?.tags).toEqual(["a", "c"]);
    expect(result2[0]?.stressedTags).toEqual(["sa", "sc"]);
  });

  it("replaceTag splices stressedTags when present", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.replaceTag("s1", 1, ["x", "y"]);
    });

    const updater = mockSetSentences.mock.calls[0]?.[0] as (
      prev: {
        id: string;
        tags: string[];
        stressedTags?: string[];
        text: string;
      }[],
    ) => {
      id: string;
      tags: string[];
      stressedTags?: (string | undefined)[];
      text: string;
    }[];
    const prev = [
      {
        id: "s1",
        tags: ["a", "b", "c"],
        stressedTags: ["sa", "sb", "sc"],
        text: "a b c",
      },
    ];
    const result2 = updater(prev as never);
    expect(result2[0]?.tags).toEqual(["a", "x", "y", "c"]);
    expect(result2[0]?.text).toBe("a x y c");
  });

  it("replaceTag without stressedTags leaves them undefined", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));
    act(() => result.current.replaceTag("s1", 0, ["x"]));
    const updater = mockSetSentences.mock.calls[0]?.[0] as (prev: never) => { stressedTags?: unknown; phoneticText?: unknown; audioUrl?: unknown }[];
    const res = updater([{ id: "s1", tags: ["a", "b"], text: "a b" }] as never);
    expect(res[0]?.stressedTags).toBeUndefined();
    expect(res[0]?.phoneticText).toBeUndefined();
    expect(res[0]?.audioUrl).toBeUndefined();
  });

  it("deleteTag clears phoneticText and audioUrl", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));
    act(() => result.current.deleteTag("s1", 0));
    const updater = mockSetSentences.mock.calls[0]?.[0] as (prev: never) => { tags: string[]; text: string; phoneticText?: unknown; audioUrl?: unknown }[];
    const res = updater([{ id: "s1", tags: ["a", "b"], text: "a b" }] as never);
    expect(res[0]?.tags).toStrictEqual(["b"]);
    expect(res[0]?.text).toBe("b");
    expect(res[0]?.phoneticText).toBeUndefined();
    expect(res[0]?.audioUrl).toBeUndefined();
  });

  it("updateStressedTag creates stressedTags from tags when none exist", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));
    act(() => result.current.updateStressedTag("s1", 1, "stressed-b"));
    const updater = mockSetSentences.mock.calls[0]?.[0] as (prev: never) => { stressedTags: string[]; phoneticText: string; audioUrl?: unknown }[];
    const res = updater([{ id: "s1", tags: ["a", "b"], text: "a b" }] as never);
    expect(res[0]?.stressedTags).toStrictEqual(["a", "stressed-b"]);
    expect(res[0]?.phoneticText).toBe("a stressed-b");
    expect(res[0]?.audioUrl).toBeUndefined();
  });

  it("updateStressedTag updates existing stressedTags", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));
    act(() => result.current.updateStressedTag("s1", 0, "new-sa"));
    const updater = mockSetSentences.mock.calls[0]?.[0] as (prev: never) => { stressedTags: string[]; phoneticText: string }[];
    const res = updater([{ id: "s1", tags: ["a", "b"], stressedTags: ["sa", "sb"], text: "a b" }] as never);
    expect(res[0]?.stressedTags).toStrictEqual(["new-sa", "sb"]);
    expect(res[0]?.phoneticText).toBe("new-sa sb");
  });

  it("updateSentenceTags does not modify non-matching sentences", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));
    act(() => result.current.updateSentenceTags("s1", () => ({ text: "new" })));
    const updater = mockSetSentences.mock.calls[0]?.[0] as (prev: never) => { id: string; text: string }[];
    const res = updater([{ id: "s1", text: "old" }, { id: "s2", text: "keep" }] as never);
    expect(res[0]?.text).toBe("new");
    expect(res[1]?.text).toBe("keep");
  });
});

// --- Merged from useTagUpdater.mutations.test.ts ---
type Updater = (prev: { id: string; tags: string[]; text: string; stressedTags?: string[] | null }[]) =>
  { id: string; tags: string[]; text: string; stressedTags?: unknown; phoneticText?: unknown; audioUrl?: unknown }[];

const setup = () => {
  const setSentences = vi.fn() as unknown as React.Dispatch<React.SetStateAction<SentenceState[]>> & ReturnType<typeof vi.fn>;
  const hook = renderHook(() => useTagUpdater(setSentences));
  return { result: hook.result, setSentences };
};

const getUpdater = (setSentences: ReturnType<typeof vi.fn>): Updater =>
  setSentences.mock.calls[0]?.[0] as Updater;

describe("useTagUpdater mutation kills", () => {
  // --- deleteTag: text joins with space L56 ---
  it("deleteTag joins remaining tags with space", () => {
    const { result, setSentences } = setup();
    act(() => result.current.deleteTag("s1", 1));
    const res = getUpdater(setSentences)([{ id: "s1", tags: ["A", "B", "C"], text: "A B C" }]);
    expect(res[0]?.text).toBe("A C");
    expect(res[0]?.tags).toStrictEqual(["A", "C"]);
  });

  // --- replaceTag with stressedTags: slice/map/filter L78-82 ---
  it("replaceTag splices stressedTags correctly with new words", () => {
    const { result, setSentences } = setup();
    act(() => result.current.replaceTag("s1", 1, ["X", "Y"]));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: ["a", "b", "c"], text: "a b c", stressedTags: ["sa", "sb", "sc"] },
    ]);
    expect(res[0]?.tags).toStrictEqual(["a", "X", "Y", "c"]);
    expect(res[0]?.text).toBe("a X Y c");
    // stressedTags: ["sa", undefined, undefined, "sc"] -> filter removes undefined -> ["sa", "sc"]
    expect(res[0]?.stressedTags).toStrictEqual(["sa", "sc"]);
  });

  it("replaceTag at index 0", () => {
    const { result, setSentences } = setup();
    act(() => result.current.replaceTag("s1", 0, ["Z"]));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: ["a", "b"], text: "a b", stressedTags: ["sa", "sb"] },
    ]);
    expect(res[0]?.tags).toStrictEqual(["Z", "b"]);
    // stressedTags: [undefined, "sb"] -> filter -> ["sb"]
    expect(res[0]?.stressedTags).toStrictEqual(["sb"]);
  });

  it("replaceTag at last index", () => {
    const { result, setSentences } = setup();
    act(() => result.current.replaceTag("s1", 2, ["W"]));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: ["a", "b", "c"], text: "a b c", stressedTags: ["sa", "sb", "sc"] },
    ]);
    expect(res[0]?.tags).toStrictEqual(["a", "b", "W"]);
    expect(res[0]?.stressedTags).toStrictEqual(["sa", "sb"]);
  });

  it("replaceTag without stressedTags returns undefined stressedTags", () => {
    const { result, setSentences } = setup();
    act(() => result.current.replaceTag("s1", 0, ["Z"]));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: ["a", "b"], text: "a b" },
    ]);
    expect(res[0]?.stressedTags).toBeUndefined();
    expect(res[0]?.phoneticText).toBeUndefined();
    expect(res[0]?.audioUrl).toBeUndefined();
  });

  // --- replaceTag clears phoneticText and audioUrl ---
  it("replaceTag clears phoneticText and audioUrl", () => {
    const { result, setSentences } = setup();
    act(() => result.current.replaceTag("s1", 0, ["Z"]));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: ["a"], text: "a", stressedTags: ["sa"] },
    ]);
    expect(res[0]?.phoneticText).toBeUndefined();
    expect(res[0]?.audioUrl).toBeUndefined();
  });

  // --- deleteTag with null stressedTags ---
  it("deleteTag handles null stressedTags", () => {
    const { result, setSentences } = setup();
    act(() => result.current.deleteTag("s1", 0));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: ["a", "b"], text: "a b", stressedTags: null },
    ]);
    expect(res[0]?.stressedTags).toBeUndefined();
  });

  // --- updateStressedTag: copies existing or creates from tags L102-104 ---
  it("updateStressedTag creates from tags when stressedTags is null", () => {
    const { result, setSentences } = setup();
    act(() => result.current.updateStressedTag("s1", 0, "sá"));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: ["a", "b"], text: "a b", stressedTags: null },
    ]);
    expect(res[0]?.stressedTags).toStrictEqual(["sá", "b"]);
    expect(res[0]?.phoneticText).toBe("sá b");
  });

  it("updateStressedTag copies existing stressedTags", () => {
    const { result, setSentences } = setup();
    act(() => result.current.updateStressedTag("s1", 1, "sb2"));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: ["a", "b"], text: "a b", stressedTags: ["sa", "sb"] },
    ]);
    expect(res[0]?.stressedTags).toStrictEqual(["sa", "sb2"]);
    expect(res[0]?.phoneticText).toBe("sa sb2");
    expect(res[0]?.audioUrl).toBeUndefined();
  });

  // --- updateSentenceTags skips non-matching ---
  it("updateSentenceTags leaves non-matching sentences untouched", () => {
    const { result, setSentences } = setup();
    act(() => result.current.updateSentenceTags("s1", () => ({ text: "new" })));
    const res = getUpdater(setSentences)([
      { id: "s1", tags: [], text: "old" },
      { id: "s2", tags: [], text: "keep" },
    ]);
    expect(res[1]?.text).toBe("keep");
  });
});
