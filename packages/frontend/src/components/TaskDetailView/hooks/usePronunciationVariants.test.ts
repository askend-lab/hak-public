import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePronunciationVariants } from "./usePronunciationVariants";
import type { TaskEntry, Task } from "@/types/task";

const mockUpdateTaskEntry = vi.fn();
vi.mock("@/services/dataService", () => ({
  DataService: {
    getInstance: (): { updateTaskEntry: ReturnType<typeof vi.fn> } => ({
      updateTaskEntry: mockUpdateTaskEntry,
    }),
  },
}));

describe("usePronunciationVariants", () => {
  const mockEntry: TaskEntry = {
    id: "e1",
    taskId: "t1",
    text: "tere maailm",
    stressedText: "te`re maailm",
    audioUrl: null,
    audioBlob: null,
    order: 0,
    createdAt: new Date(),
  };
  const mockTask: Task = {
    id: "t1",
    userId: "u1",
    name: "Test",
    entries: [mockEntry],
    speechSequences: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    shareToken: "tok1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with panel closed", () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePronunciationVariants([mockEntry], setEntries, mockTask, "u1"),
    );
    expect(result.current.isVariantsPanelOpen).toBe(false);
    expect(result.current.variantsWord).toBeNull();
  });

  it("handleTagClick opens panel with word", () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePronunciationVariants([mockEntry], setEntries, mockTask, "u1"),
    );
    act(() => {
      result.current.handleTagClick("e1", 0, "tere");
    });
    expect(result.current.isVariantsPanelOpen).toBe(true);
    expect(result.current.variantsWord).toBe("tere");
    expect(result.current.variantsCustomPhonetic).toBe("te`re");
  });

  it("handleCloseVariants closes panel", () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePronunciationVariants([mockEntry], setEntries, mockTask, "u1"),
    );
    act(() => {
      result.current.handleTagClick("e1", 0, "tere");
    });
    act(() => {
      result.current.handleCloseVariants();
    });
    expect(result.current.isVariantsPanelOpen).toBe(false);
    expect(result.current.variantsWord).toBeNull();
  });

  it("handleUseVariant closes when no selection", async () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePronunciationVariants([mockEntry], setEntries, mockTask, "u1"),
    );
    await act(async () => {
      await result.current.handleUseVariant("te~re");
    });
    expect(result.current.isVariantsPanelOpen).toBe(false);
  });

  it("handleUseVariant closes when entry not found", async () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePronunciationVariants([], setEntries, mockTask, "u1"),
    );
    act(() => {
      // Manually set selected state by clicking a tag that won't exist
    });
    await act(async () => {
      await result.current.handleUseVariant("te~re");
    });
    expect(result.current.isVariantsPanelOpen).toBe(false);
  });

  it("handleUseVariant closes when tag index out of range", async () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePronunciationVariants([mockEntry], setEntries, mockTask, "u1"),
    );
    act(() => {
      result.current.handleTagClick("e1", 99, "tere");
    });
    await act(async () => {
      await result.current.handleUseVariant("te~re");
    });
    expect(result.current.isVariantsPanelOpen).toBe(false);
  });

  it("handleUseVariant updates entry and saves", async () => {
    mockUpdateTaskEntry.mockResolvedValueOnce(undefined);
    const invokingSetEntries = vi
      .fn()
      .mockImplementation((updater: (prev: TaskEntry[]) => TaskEntry[]) => {
        if (typeof updater === "function") updater([mockEntry]);
      }) as unknown as React.Dispatch<React.SetStateAction<TaskEntry[]>>;

    const { result } = renderHook(() =>
      usePronunciationVariants([mockEntry], invokingSetEntries, mockTask, "u1"),
    );
    act(() => {
      result.current.handleTagClick("e1", 0, "tere");
    });
    await act(async () => {
      await result.current.handleUseVariant("te~re");
    });

    expect(invokingSetEntries).toHaveBeenCalled();
    expect(mockUpdateTaskEntry).toHaveBeenCalled();
    expect(result.current.isVariantsPanelOpen).toBe(false);
  });

  it("handleUseVariant reverts on save error", async () => {
    window.alert = vi.fn();
    mockUpdateTaskEntry.mockRejectedValueOnce(new Error("fail"));
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePronunciationVariants([mockEntry], setEntries, mockTask, "u1"),
    );
    act(() => {
      result.current.handleTagClick("e1", 0, "tere");
    });
    await act(async () => {
      await result.current.handleUseVariant("te~re");
    });
    // setEntries called twice: once for update, once for revert
    expect(setEntries).toHaveBeenCalledTimes(2);
  });
});
