// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragAndDrop } from "./useDragAndDrop";
import type { SentenceState } from "@/types/synthesis";

describe("useDragAndDrop", () => {
  const createMockSentences = (): SentenceState[] => [
    {
      id: "1",
      text: "Hello",
      tags: ["Hello"],
      stressedTags: ["Hello"],
      currentInput: "",
      isPlaying: false,
      isLoading: false,
    },
    {
      id: "2",
      text: "World",
      tags: ["World"],
      stressedTags: ["World"],
      currentInput: "",
      isPlaying: false,
      isLoading: false,
    },
    {
      id: "3",
      text: "Test",
      tags: ["Test"],
      stressedTags: ["Test"],
      currentInput: "",
      isPlaying: false,
      isLoading: false,
    },
  ];

  let mockSetSentences: any;

  beforeEach(() => {
    mockSetSentences = vi.fn();
  });

  describe("initial state", () => {
    it("returns null draggedId initially", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));
      expect(result.current.draggedId).toBeNull();
    });

    it("returns null dragOverId initially", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));
      expect(result.current.dragOverId).toBeNull();
    });

    it("returns all handler functions", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));
      expect(typeof result.current.handleDragStart).toBe("function");
      expect(typeof result.current.handleDragEnd).toBe("function");
      expect(typeof result.current.handleDragOver).toBe("function");
      expect(typeof result.current.handleDragLeave).toBe("function");
      expect(typeof result.current.handleDrop).toBe("function");
    });
  });

  describe("handleDragStart", () => {
    it("sets draggedId", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: vi.fn(),
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockEvent, "1");
      });

      expect(result.current.draggedId).toBe("1");
    });

    it("sets effectAllowed to move", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: vi.fn(),
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockEvent, "1");
      });

      expect(mockEvent.dataTransfer.effectAllowed).toBe("move");
    });

    it("sets data in dataTransfer", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const setDataMock = vi.fn();
      const mockEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: setDataMock,
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockEvent, "1");
      });

      expect(setDataMock).toHaveBeenCalledWith("text/html", "1");
    });
  });

  describe("handleDragEnd", () => {
    it("resets draggedId and dragOverId", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: vi.fn(),
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockEvent, "1");
      });

      expect(result.current.draggedId).toBe("1");

      act(() => {
        result.current.handleDragEnd();
      });

      expect(result.current.draggedId).toBeNull();
      expect(result.current.dragOverId).toBeNull();
    });
  });

  describe("handleDragOver", () => {
    it("sets dragOverId when dragging over different element", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockStartEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: vi.fn(),
        },
      } as unknown as React.DragEvent;

      const mockOverEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          dropEffect: "",
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockStartEvent, "1");
      });

      act(() => {
        result.current.handleDragOver(mockOverEvent, "2");
      });

      expect(result.current.dragOverId).toBe("2");
      expect(mockOverEvent.preventDefault).toHaveBeenCalled();
    });

    it("does not set dragOverId when dragging over same element", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockStartEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: vi.fn(),
        },
      } as unknown as React.DragEvent;

      const mockOverEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          dropEffect: "",
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockStartEvent, "1");
      });

      act(() => {
        result.current.handleDragOver(mockOverEvent, "1");
      });

      expect(result.current.dragOverId).toBeNull();
    });
  });

  describe("handleDragLeave", () => {
    it("resets dragOverId", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockStartEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: vi.fn(),
        },
      } as unknown as React.DragEvent;

      const mockOverEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          dropEffect: "",
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockStartEvent, "1");
      });

      act(() => {
        result.current.handleDragOver(mockOverEvent, "2");
      });

      expect(result.current.dragOverId).toBe("2");

      act(() => {
        result.current.handleDragLeave();
      });

      expect(result.current.dragOverId).toBeNull();
    });
  });

  describe("handleDrop", () => {
    it("calls setSentences with reordered array", () => {
      const sentences = createMockSentences();
      mockSetSentences.mockImplementation(
        (updater: (prev: SentenceState[]) => SentenceState[]) => {
          const result = updater(sentences);
          return result;
        },
      );

      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockStartEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: vi.fn(),
        },
      } as unknown as React.DragEvent;

      const mockDropEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockStartEvent, "1");
      });

      act(() => {
        result.current.handleDrop(mockDropEvent, "3");
      });

      expect(mockSetSentences).toHaveBeenCalled();
      expect(mockDropEvent.preventDefault).toHaveBeenCalled();
    });

    it("does not reorder when dropping on same element", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockStartEvent = {
        dataTransfer: {
          effectAllowed: "",
          setData: vi.fn(),
        },
      } as unknown as React.DragEvent;

      const mockDropEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart(mockStartEvent, "1");
      });

      act(() => {
        result.current.handleDrop(mockDropEvent, "1");
      });

      // setSentences should not be called when dropping on same element
      expect(mockSetSentences).not.toHaveBeenCalled();
    });

    it("does not reorder when no element is being dragged", () => {
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockDropEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(mockDropEvent, "2");
      });

      expect(mockSetSentences).not.toHaveBeenCalled();
    });

    it("correctly reorders items when dropping item 1 on item 3", () => {
      const sentences = createMockSentences();
      let reorderedResult: SentenceState[] = [];
      mockSetSentences.mockImplementation(
        (updater: (prev: SentenceState[]) => SentenceState[]) => {
          reorderedResult = updater(sentences);
          return reorderedResult;
        },
      );

      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockStartEvent = {
        dataTransfer: { effectAllowed: "", setData: vi.fn() },
      } as unknown as React.DragEvent;

      const mockDropEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => { result.current.handleDragStart(mockStartEvent, "1"); });
      act(() => { result.current.handleDrop(mockDropEvent, "3"); });

      expect(reorderedResult.map((s) => s.id)).toEqual(["2", "3", "1"]);
    });

    it("handles drop when dragged item not found in list", () => {
      const sentences = createMockSentences();
      let reorderedResult: SentenceState[] = sentences;
      mockSetSentences.mockImplementation(
        (updater: (prev: SentenceState[]) => SentenceState[]) => {
          reorderedResult = updater(sentences);
          return reorderedResult;
        },
      );

      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));

      const mockStartEvent = {
        dataTransfer: { effectAllowed: "", setData: vi.fn() },
      } as unknown as React.DragEvent;

      const mockDropEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => { result.current.handleDragStart(mockStartEvent, "nonexistent"); });
      act(() => { result.current.handleDrop(mockDropEvent, "1"); });

      // Should return prev unchanged when dragged item not found
      expect(reorderedResult).toBe(sentences);
    });

    it("resets state after drop", () => {
      const sentences = createMockSentences();
      mockSetSentences.mockImplementation(
        (updater: (prev: SentenceState[]) => SentenceState[]) => updater(sentences),
      );
      const { result } = renderHook(() => useDragAndDrop(mockSetSentences));
      const mockStartEvent = {
        dataTransfer: { effectAllowed: "", setData: vi.fn() },
      } as unknown as React.DragEvent;
      const mockDropEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => { result.current.handleDragStart(mockStartEvent, "1"); });
      expect(result.current.draggedId).toBe("1");
      act(() => { result.current.handleDrop(mockDropEvent, "3"); });
      expect(result.current.draggedId).toBeNull();
      expect(result.current.dragOverId).toBeNull();
    });
  });
});
