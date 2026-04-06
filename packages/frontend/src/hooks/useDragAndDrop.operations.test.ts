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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
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

  });

  });

  });

  });

  });

});
