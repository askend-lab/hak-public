// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUserTasks } from "./useUserTasks";
import { useAuth } from "@/features/auth/services";
import { createElement } from "react";
import { DataServiceTestWrapper } from "@/test/dataServiceMock";
import type { DataService } from "@/services/dataService";

vi.mock("@/features/auth/services");

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockDataService = {
  getUserTasks: vi.fn(),
} as DataService & { getUserTasks: ReturnType<typeof vi.fn> };
function dsWrapper({ children }: { children: React.ReactNode }) { return createElement(DataServiceTestWrapper, { dataService: mockDataService }, children); }

describe("useUserTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty tasks when user is not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useUserTasks(), { wrapper: dsWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
    expect(mockDataService.getUserTasks).not.toHaveBeenCalled();
  });

  it("loads tasks for authenticated user", async () => {
    const mockTasks = [
      { id: "1", name: "Task 1" },
      { id: "2", name: "Task 2" },
    ];

    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAuthenticated: true,
    });
    mockDataService.getUserTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useUserTasks(), { wrapper: dsWrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.isEmpty).toBe(false);
    expect(mockDataService.getUserTasks).toHaveBeenCalled();
  });

  it("handles error when loading tasks fails", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAuthenticated: true,
    });
    mockDataService.getUserTasks.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useUserTasks(), { wrapper: dsWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.tasks).toEqual([]);
  });

  it("handles non-Error exceptions", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAuthenticated: true,
    });
    mockDataService.getUserTasks.mockRejectedValue("string error");

    const { result } = renderHook(() => useUserTasks(), { wrapper: dsWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Viga ülesannete laadimisel");
  });

  it("reloads tasks when refreshTrigger changes", async () => {
    const mockTasks = [{ id: "1", name: "Task 1" }];

    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAuthenticated: true,
    });
    mockDataService.getUserTasks.mockResolvedValue(mockTasks);

    const { result, rerender } = renderHook(
      ({ refreshTrigger }) => useUserTasks(refreshTrigger),
      { initialProps: { refreshTrigger: 0 }, wrapper: dsWrapper },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockDataService.getUserTasks).toHaveBeenCalledTimes(1);

    rerender({ refreshTrigger: 1 });

    await waitFor(() => {
      expect(mockDataService.getUserTasks).toHaveBeenCalledTimes(2);
    });
  });

  it("isEmpty is true when tasks array is empty after loading", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAuthenticated: true,
    });
    mockDataService.getUserTasks.mockResolvedValue([]);

    const { result } = renderHook(() => useUserTasks(), { wrapper: dsWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
  });

  it("isEmpty is false while still loading", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAuthenticated: true,
    });
    mockDataService.getUserTasks.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useUserTasks(), { wrapper: dsWrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });
});
