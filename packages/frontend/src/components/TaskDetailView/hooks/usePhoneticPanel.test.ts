import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePhoneticPanel } from "./usePhoneticPanel";
import type { TaskEntry, Task } from "@/types/task";

const mockUpdateTaskEntry = vi.fn();
vi.mock("@/services/dataService", () => ({
  DataService: {
    getInstance: (): { updateTaskEntry: ReturnType<typeof vi.fn> } => ({
      updateTaskEntry: mockUpdateTaskEntry,
    }),
  },
}));

vi.mock("@/utils/phoneticMarkers", () => ({
  stripPhoneticMarkers: (text: string): string => text.replace(/[`~^]/g, ""),
}));

describe("usePhoneticPanel", () => {
  const mockEntry: TaskEntry = {
    id: "e1",
    taskId: "t1",
    text: "tere maailm",
    stressedText: "tere maailm",
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
  const onMenuClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("initializes with panel closed", () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel([mockEntry], setEntries, mockTask, "u1", onMenuClose),
    );
    expect(result.current.showPhoneticPanel).toBe(false);
    expect(result.current.phoneticPanelEntryId).toBeNull();
  });

  it("handleExplorePhonetic opens panel", async () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel([mockEntry], setEntries, mockTask, "u1", onMenuClose),
    );
    await act(async () => {
      await result.current.handleExplorePhonetic("e1");
    });
    expect(result.current.showPhoneticPanel).toBe(true);
    expect(result.current.phoneticPanelEntryId).toBe("e1");
    expect(onMenuClose).toHaveBeenCalled();
  });

  it("handleExplorePhonetic does nothing for missing entry", async () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel([mockEntry], setEntries, mockTask, "u1", onMenuClose),
    );
    await act(async () => {
      await result.current.handleExplorePhonetic("nonexistent");
    });
    expect(result.current.showPhoneticPanel).toBe(false);
  });

  it("handleExplorePhonetic fetches stressedText when missing", async () => {
    const entryNoStressed = { ...mockEntry, stressedText: "" };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stressedText: "te`re maailm" }),
    });
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel(
        [entryNoStressed],
        setEntries,
        mockTask,
        "u1",
        onMenuClose,
      ),
    );
    await act(async () => {
      await result.current.handleExplorePhonetic("e1");
    });
    expect(global.fetch).toHaveBeenCalled();
    expect(setEntries).toHaveBeenCalled();
  });

  it("handleExplorePhonetic handles fetch error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const entryNoStressed = { ...mockEntry, stressedText: "" };
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("fail"),
    );
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel(
        [entryNoStressed],
        setEntries,
        mockTask,
        "u1",
        onMenuClose,
      ),
    );
    await act(async () => {
      await result.current.handleExplorePhonetic("e1");
    });
    expect(result.current.showPhoneticPanel).toBe(true);
    spy.mockRestore();
  });

  it("handleClosePhoneticPanel closes panel", async () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel([mockEntry], setEntries, mockTask, "u1", onMenuClose),
    );
    await act(async () => {
      await result.current.handleExplorePhonetic("e1");
    });
    act(() => {
      result.current.handleClosePhoneticPanel();
    });
    expect(result.current.showPhoneticPanel).toBe(false);
  });

  it("handlePhoneticApply updates entry and saves", async () => {
    mockUpdateTaskEntry.mockResolvedValueOnce(undefined);
    const invokingSetEntries = vi
      .fn()
      .mockImplementation((updater: (prev: TaskEntry[]) => TaskEntry[]) => {
        if (typeof updater === "function") updater([mockEntry]);
      }) as unknown as React.Dispatch<React.SetStateAction<TaskEntry[]>>;

    const { result } = renderHook(() =>
      usePhoneticPanel(
        [mockEntry],
        invokingSetEntries,
        mockTask,
        "u1",
        onMenuClose,
      ),
    );

    await act(async () => {
      await result.current.handleExplorePhonetic("e1");
    });
    await act(async () => {
      await result.current.handlePhoneticApply("te`re maailm");
    });

    expect(invokingSetEntries).toHaveBeenCalled();
    expect(mockUpdateTaskEntry).toHaveBeenCalled();
    expect(result.current.showPhoneticPanel).toBe(false);
  });

  it("handlePhoneticApply closes panel when no selection", async () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel([mockEntry], setEntries, mockTask, "u1", onMenuClose),
    );
    await act(async () => {
      await result.current.handlePhoneticApply("test");
    });
    expect(result.current.showPhoneticPanel).toBe(false);
  });

  it("handlePhoneticApply handles save error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    window.alert = vi.fn();
    mockUpdateTaskEntry.mockRejectedValueOnce(new Error("save fail"));
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel([mockEntry], setEntries, mockTask, "u1", onMenuClose),
    );
    await act(async () => {
      await result.current.handleExplorePhonetic("e1");
    });
    await act(async () => {
      await result.current.handlePhoneticApply("te`re");
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
