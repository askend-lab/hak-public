// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAppRedirects } from "./useAppRedirects";
import type { ReactNode } from "react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockSetShowLoginModal = vi.fn();
let mockIsAuthenticated = false;
vi.mock("@/features/auth/services", () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    setShowLoginModal: mockSetShowLoginModal,
  }),
}));

let mockOnboardingState = { completed: true, selectedRole: "teacher" as string | null };
let mockIsOnboardingLoading = false;
vi.mock("@/features/onboarding/contexts/OnboardingContext", () => ({
  useOnboarding: () => ({
    state: mockOnboardingState,
    isLoading: mockIsOnboardingLoading,
  }),
}));

vi.mock("@/features/synthesis/hooks/synthesis/useSentenceState", () => ({
  COPIED_ENTRIES_KEY: "test_copied_entries",
}));

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("useAppRedirects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
    mockOnboardingState = { completed: true, selectedRole: "teacher" };
    mockIsOnboardingLoading = false;
    sessionStorage.clear();
  });

  describe("handleTasksClick", () => {
    it("opens login modal when not authenticated", () => {
      mockIsAuthenticated = false;
      const { result } = renderHook(() => useAppRedirects("synthesis"), { wrapper });

      act(() => result.current.handleTasksClick());

      expect(mockSetShowLoginModal).toHaveBeenCalledWith(true);
    });

    it("does nothing when authenticated", () => {
      mockIsAuthenticated = true;
      const { result } = renderHook(() => useAppRedirects("synthesis"), { wrapper });

      act(() => result.current.handleTasksClick());

      expect(mockSetShowLoginModal).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("post-login redirect", () => {
    it("navigates to /tasks after login when tasks access was pending", () => {
      mockIsAuthenticated = false;
      const { result, rerender } = renderHook(() => useAppRedirects("synthesis"), { wrapper });

      // Click tasks while not authenticated
      act(() => result.current.handleTasksClick());
      expect(mockSetShowLoginModal).toHaveBeenCalledWith(true);

      // Simulate authentication completing
      mockIsAuthenticated = true;
      rerender();

      expect(mockNavigate).toHaveBeenCalledWith("/tasks");
    });
  });

  describe("onboarding redirect", () => {
    it("redirects to role-selection when onboarding not completed", () => {
      mockOnboardingState = { completed: false, selectedRole: null };
      renderHook(() => useAppRedirects("synthesis"), { wrapper });

      expect(mockNavigate).toHaveBeenCalledWith("/role-selection", { replace: true });
    });

    it("does not redirect when onboarding is completed", () => {
      mockOnboardingState = { completed: true, selectedRole: "teacher" };
      renderHook(() => useAppRedirects("synthesis"), { wrapper });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does not redirect when onboarding is loading", () => {
      mockIsOnboardingLoading = true;
      mockOnboardingState = { completed: false, selectedRole: null };
      renderHook(() => useAppRedirects("synthesis"), { wrapper });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does not redirect when not on synthesis view", () => {
      mockOnboardingState = { completed: false, selectedRole: null };
      renderHook(() => useAppRedirects("tasks"), { wrapper });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does not redirect when sessionStorage has copied entries", () => {
      sessionStorage.setItem("test_copied_entries", "true");
      mockOnboardingState = { completed: false, selectedRole: null };
      renderHook(() => useAppRedirects("synthesis"), { wrapper });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("only checks redirect once (initial load)", () => {
      mockOnboardingState = { completed: false, selectedRole: null };
      const { rerender } = renderHook(() => useAppRedirects("synthesis"), { wrapper });

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      mockNavigate.mockClear();

      // Re-render should not trigger another redirect
      rerender();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
