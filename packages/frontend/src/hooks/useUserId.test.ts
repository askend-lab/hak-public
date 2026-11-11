// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUserId } from "./useUserId";
import { useAuth } from "@/features/auth/services";

vi.mock("@/features/auth/services");

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe("useUserId", () => {
  it("returns user id when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "real-user-123", email: "test@example.com" },
      isAuthenticated: true,
      showLoginModal: false,
      setShowLoginModal: vi.fn(),
      logout: vi.fn(),
      login: vi.fn(),
      refreshSession: vi.fn(),
      handleCodeCallback: vi.fn(),
      loginWithTara: vi.fn(),
      handleTaraTokens: vi.fn(),
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useUserId());
    expect(result.current).toBe("real-user-123");
  });

  it("throws when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      showLoginModal: false,
      setShowLoginModal: vi.fn(),
      logout: vi.fn(),
      login: vi.fn(),
      refreshSession: vi.fn(),
      handleCodeCallback: vi.fn(),
      loginWithTara: vi.fn(),
      handleTaraTokens: vi.fn(),
      isLoading: false,
      error: null,
    });

    expect(() => renderHook(() => useUserId())).toThrow(
      "useUserId: user is not authenticated",
    );
  });
});
