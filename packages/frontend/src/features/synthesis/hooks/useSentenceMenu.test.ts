// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSentenceMenu } from "./useSentenceMenu";
import { createElement } from "react";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "user-1", name: "Test User" },
    isAuthenticated: true,
  })),
}));

const mockDS = createMockDataService({
  getUserTasks: vi.fn().mockResolvedValue([
    { id: "task-1", name: "Task 1" },
    { id: "task-2", name: "Task 2" },
  ]),
});
function dsWrapper({ children }: { children: React.ReactNode }) { return createElement(DataServiceTestWrapper, { dataService: mockDS }, children); }

describe("useSentenceMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with null openMenuId", () => {
    const { result } = renderHook(() => useSentenceMenu(), { wrapper: dsWrapper });
    expect(result.current.openMenuId).toBeNull();
  });

  it("should initialize with empty menuAnchorEl", () => {
    const { result } = renderHook(() => useSentenceMenu(), { wrapper: dsWrapper });
    expect(result.current.menuAnchorEl).toEqual({});
  });

  it("should initialize with empty menuTasks", () => {
    const { result } = renderHook(() => useSentenceMenu(), { wrapper: dsWrapper });
    expect(result.current.menuTasks).toEqual([]);
  });

  it("should initialize with empty menuSearchQuery", () => {
    const { result } = renderHook(() => useSentenceMenu(), { wrapper: dsWrapper });
    expect(result.current.menuSearchQuery).toBe("");
  });

  it("should open menu and load tasks", async () => {
    const { result } = renderHook(() => useSentenceMenu(), { wrapper: dsWrapper });

    const mockElement = document.createElement("button");
    const mockEvent = {
      currentTarget: mockElement,
    } as unknown as React.MouseEvent;

    await act(async () => {
      await result.current.handleMenuOpen(mockEvent, "sentence-1");
    });

    expect(result.current.openMenuId).toBe("sentence-1");
    expect(result.current.menuAnchorEl["sentence-1"]).toBe(mockElement);

    await waitFor(() => {
      expect(result.current.menuTasks.length).toBe(2);
    });
  });

  it("should close menu and clear search query", () => {
    const { result } = renderHook(() => useSentenceMenu(), { wrapper: dsWrapper });

    act(() => {
      result.current.setMenuSearchQuery("test query");
    });

    expect(result.current.menuSearchQuery).toBe("test query");

    act(() => {
      result.current.handleMenuClose();
    });

    expect(result.current.openMenuId).toBeNull();
    expect(result.current.menuSearchQuery).toBe("");
  });

  it("should update menuSearchQuery", () => {
    const { result } = renderHook(() => useSentenceMenu(), { wrapper: dsWrapper });

    act(() => {
      result.current.setMenuSearchQuery("new search");
    });

    expect(result.current.menuSearchQuery).toBe("new search");
  });

  it("should handle getUserTasks error in handleMenuOpen", async () => {
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const errorDS = createMockDataService({
      getUserTasks: vi.fn().mockRejectedValue(new Error("load failed")),
    });
    function errorWrapper({ children }: { children: React.ReactNode }) { return createElement(DataServiceTestWrapper, { dataService: errorDS }, children); }

    const { result } = renderHook(() => useSentenceMenu(), { wrapper: errorWrapper });

    const mockEvent = {
      currentTarget: document.createElement("div"),
    } as unknown as React.MouseEvent;
    await act(async () => {
      result.current.handleMenuOpen(mockEvent, "s1");
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });
});
