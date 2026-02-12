// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTagUpdater } from "./useTagUpdater";
import type { SentenceState } from "@/types/synthesis";

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
