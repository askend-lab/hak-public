import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTagUpdater } from "./useTagUpdater";

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

    const updater = mockSetSentences.mock.calls[0]![0] as (
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
    expect(result2[0]!.tags).toEqual(["a", "c"]);
    expect(result2[0]!.stressedTags).toEqual(["sa", "sc"]);
  });

  it("replaceTag splices stressedTags when present", () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.replaceTag("s1", 1, ["x", "y"]);
    });

    const updater = mockSetSentences.mock.calls[0]![0] as (
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
    expect(result2[0]!.tags).toEqual(["a", "x", "y", "c"]);
    expect(result2[0]!.text).toBe("a x y c");
  });
});
