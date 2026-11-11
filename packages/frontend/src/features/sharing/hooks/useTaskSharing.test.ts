// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement } from "react";
import { useTaskSharing } from "./useTaskSharing";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "u1", name: "User" },
    isAuthenticated: true,
    setShowLoginModal: vi.fn(),
  })),
}));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({ showNotification: vi.fn() })),
}));

describe("useTaskSharing", () => {
  const mockSetShowShareTaskModal = vi.fn();
  const mockSetTaskToShare = vi.fn();
  const mockRequireAuth = vi.fn().mockReturnValue(false);

  beforeEach(() => vi.clearAllMocks());

  it("handles share error gracefully", async () => {
    const ds = createMockDataService({
      shareUserTask: vi.fn().mockRejectedValue(new Error("share fail")),
    });
    function wrapper({ children }: { children: React.ReactNode }) {
      return createElement(DataServiceTestWrapper, { dataService: ds }, children);
    }
    const { result } = renderHook(
      () => useTaskSharing({
        setShowShareTaskModal: mockSetShowShareTaskModal,
        setTaskToShare: mockSetTaskToShare,
        requireAuth: mockRequireAuth,
      }),
      { wrapper },
    );
    await act(async () => {
      await result.current.handleShareTask({ id: "t1", name: "Task" });
    });
    expect(mockSetShowShareTaskModal).not.toHaveBeenCalled();
  });

  it("handles revoke error by rethrowing", async () => {
    const ds = createMockDataService({
      revokeShare: vi.fn().mockRejectedValue(new Error("revoke fail")),
    });
    function wrapper({ children }: { children: React.ReactNode }) {
      return createElement(DataServiceTestWrapper, { dataService: ds }, children);
    }
    const { result } = renderHook(
      () => useTaskSharing({
        setShowShareTaskModal: mockSetShowShareTaskModal,
        setTaskToShare: mockSetTaskToShare,
        requireAuth: mockRequireAuth,
      }),
      { wrapper },
    );
    await expect(
      act(async () => { await result.current.handleRevokeShare("token"); }),
    ).rejects.toThrow("revoke fail");
  });
});
