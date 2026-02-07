import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragAndDrop } from "./useDragAndDrop";

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
