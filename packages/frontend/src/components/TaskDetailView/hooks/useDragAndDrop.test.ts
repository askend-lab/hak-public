// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragAndDrop } from "./useDragAndDrop";
import { TaskEntry } from "@/types/task";

const mockEntries = [
  { id: "1", text: "a", stressedText: "a", audioUrl: null, audioBlob: null },
  { id: "2", text: "b", stressedText: "b", audioUrl: null, audioBlob: null },
];

describe("useDragAndDrop", () => {
  it("initializes with null draggedId and dragOverId", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    expect(result.current.draggedId).toBeNull();
    expect(result.current.dragOverId).toBeNull();
  });

  it("sets draggedId on drag start", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    const mockEvent = {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragStart(mockEvent, "1");
    });
    expect(result.current.draggedId).toBe("1");
  });

  it("clears state on drag end", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    const startEvent = {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragStart(startEvent, "1");
    });
    act(() => {
      result.current.handleDragEnd({} as React.DragEvent);
    });
    expect(result.current.draggedId).toBeNull();
  });

  it("sets dragOverId on drag over different element", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    const startEvent = {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    } as unknown as React.DragEvent;
    const overEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: "" },
    } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragStart(startEvent, "1");
    });
    act(() => {
      result.current.handleDragOver(overEvent, "2");
    });
    expect(result.current.dragOverId).toBe("2");
  });

  it("does not set dragOverId when dragging over same element", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    const startEvent = {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    } as unknown as React.DragEvent;
    const overEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: "" },
    } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragStart(startEvent, "1");
    });
    act(() => {
      result.current.handleDragOver(overEvent, "1");
    });
    expect(result.current.dragOverId).toBeNull();
  });

  it("clears dragOverId on drag leave", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    act(() => {
      result.current.handleDragLeave();
    });
    expect(result.current.dragOverId).toBeNull();
  });

  it("reorders entries on drop", () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(setEntries));
    const startEvent = {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    } as unknown as React.DragEvent;
    const dropEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragStart(startEvent, "1");
    });
    act(() => {
      result.current.handleDrop(dropEvent, "2");
    });
    expect(setEntries).toHaveBeenCalled();
  });

  it("does not reorder when dropping on same element", () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(setEntries));
    const startEvent = {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    } as unknown as React.DragEvent;
    const dropEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragStart(startEvent, "1");
    });
    act(() => {
      result.current.handleDrop(dropEvent, "1");
    });
    expect(setEntries).not.toHaveBeenCalled();
  });

  it("handles setEntries callback correctly", () => {
    let entries = [...mockEntries];
    const setEntries = vi.fn().mockImplementation((fn) => {
      entries = fn(entries);
    });
    const { result } = renderHook(() => useDragAndDrop(setEntries));
    const startEvent = {
      dataTransfer: { effectAllowed: "", setData: vi.fn() },
    } as unknown as React.DragEvent;
    const dropEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragStart(startEvent, "1");
    });
    act(() => {
      result.current.handleDrop(dropEvent, "2");
    });
    expect(entries[0]?.id).toBe("2");
  });
});

// --- Merged from useDragAndDrop.mutations.test.ts ---
const makeEntry = (id: string): TaskEntry => ({
  id, taskId: "t1", text: id, stressedText: id,
  audioUrl: null, audioBlob: null, order: 0, createdAt: new Date(),
});

const makeDragEvent = (overrides = {}) =>
  ({ preventDefault: vi.fn(), dataTransfer: { effectAllowed: "", dropEffect: "", setData: vi.fn() }, ...overrides } as unknown as React.DragEvent);

describe("useDragAndDrop mutation kills", () => {
  it("handleDragStart sets effectAllowed to move and stores id via setData", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    const e = makeDragEvent();
    act(() => result.current.handleDragStart(e, "item-1"));
    expect(result.current.draggedId).toBe("item-1");
    expect(e.dataTransfer.effectAllowed).toBe("move");
    expect(e.dataTransfer.setData).toHaveBeenCalledWith("text/html", "item-1");
  });

  it("handleDragOver sets dropEffect to move and calls preventDefault", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    act(() => result.current.handleDragStart(makeDragEvent(), "a"));
    const overEvent = makeDragEvent();
    act(() => result.current.handleDragOver(overEvent, "b"));
    expect(overEvent.preventDefault).toHaveBeenCalled();
    expect(overEvent.dataTransfer.dropEffect).toBe("move");
    expect(result.current.dragOverId).toBe("b");
  });

  it("handleDragOver does not set dragOverId when hovering same element", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    act(() => result.current.handleDragStart(makeDragEvent(), "a"));
    act(() => result.current.handleDragOver(makeDragEvent(), "a"));
    expect(result.current.dragOverId).toBeNull();
  });

  it("handleDragLeave clears dragOverId", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    act(() => result.current.handleDragStart(makeDragEvent(), "a"));
    act(() => result.current.handleDragOver(makeDragEvent(), "b"));
    expect(result.current.dragOverId).toBe("b");
    act(() => result.current.handleDragLeave());
    expect(result.current.dragOverId).toBeNull();
  });

  it("handleDrop reorders entries correctly", () => {
    const entries = [makeEntry("a"), makeEntry("b"), makeEntry("c")];
    const setEntries = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(setEntries));

    act(() => result.current.handleDragStart(makeDragEvent(), "a"));
    act(() => result.current.handleDrop(makeDragEvent(), "c"));

    expect(setEntries).toHaveBeenCalled();
    const updater = setEntries.mock.calls[0]?.[0] as (prev: TaskEntry[]) => TaskEntry[];
    const newEntries = updater(entries);
    expect(newEntries.map(e => e.id)).toEqual(["b", "c", "a"]);
  });

  it("handleDrop clears draggedId and dragOverId", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    act(() => result.current.handleDragStart(makeDragEvent(), "a"));
    act(() => result.current.handleDrop(makeDragEvent(), "b"));
    expect(result.current.draggedId).toBeNull();
    expect(result.current.dragOverId).toBeNull();
  });

  it("handleDrop does nothing when dropping on self", () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(setEntries));
    act(() => result.current.handleDragStart(makeDragEvent(), "a"));
    act(() => result.current.handleDrop(makeDragEvent(), "a"));
    expect(setEntries).not.toHaveBeenCalled();
  });

  it("handleDrop does nothing when draggedId is null", () => {
    const setEntries = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(setEntries));
    act(() => result.current.handleDrop(makeDragEvent(), "b"));
    expect(setEntries).not.toHaveBeenCalled();
  });

  it("handleDrop returns prev when dragged item not found in entries", () => {
    const entries = [makeEntry("x"), makeEntry("y")];
    const setEntries = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(setEntries));
    act(() => result.current.handleDragStart(makeDragEvent(), "missing"));
    act(() => result.current.handleDrop(makeDragEvent(), "x"));
    const updater = setEntries.mock.calls[0]?.[0] as (prev: TaskEntry[]) => TaskEntry[];
    expect(updater(entries)).toBe(entries); // Same reference = no change
  });

  it("handleDrop returns prev when target not found in entries", () => {
    const entries = [makeEntry("a"), makeEntry("b")];
    const setEntries = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(setEntries));
    act(() => result.current.handleDragStart(makeDragEvent(), "a"));
    act(() => result.current.handleDrop(makeDragEvent(), "missing"));
    const updater = setEntries.mock.calls[0]?.[0] as (prev: TaskEntry[]) => TaskEntry[];
    expect(updater(entries)).toBe(entries);
  });

  it("handleDrop calls preventDefault", () => {
    const { result } = renderHook(() => useDragAndDrop(vi.fn()));
    act(() => result.current.handleDragStart(makeDragEvent(), "a"));
    const dropEvent = makeDragEvent();
    act(() => result.current.handleDrop(dropEvent, "b"));
    expect(dropEvent.preventDefault).toHaveBeenCalled();
  });
});
