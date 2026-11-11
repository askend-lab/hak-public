// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragAndDrop } from "./useDragAndDrop";
import type { SentenceState } from "@/types/synthesis";
import type { Dispatch, SetStateAction } from "react";
import type { Mock } from "vitest";

describe("useDragAndDrop", () => {
  let mockSetSentences: Mock & Dispatch<SetStateAction<SentenceState[]>>;

  beforeEach(() => {
    mockSetSentences = vi.fn() as Mock & Dispatch<SetStateAction<SentenceState[]>>;
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
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

  });

  });

  });

  });

  });

});
