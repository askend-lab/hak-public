// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCurrentView } from "./useCurrentView";
import { useLocation } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useLocation: vi.fn(),
}));

const mockUseLocation = useLocation as ReturnType<typeof vi.fn>;

describe("useCurrentView", () => {
  it("returns synthesis view for root path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("synthesis");
    expect(result.current.selectedTaskId).toBeNull();
  });

  it("returns synthesis view for /synthesis path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/synthesis",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("synthesis");
  });

  it("returns tasks view for /tasks path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/tasks",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("tasks");
    expect(result.current.selectedTaskId).toBeNull();
  });

  it("returns tasks view with task id for /tasks/:id path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/tasks/task-123",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("tasks");
    expect(result.current.selectedTaskId).toBe("task-123");
  });

  it("returns specs view for /specs path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/specs",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("specs");
  });

  it("returns dashboard view for /dashboard path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/dashboard",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("dashboard");
  });

  it("returns role-selection view for /role-selection path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/role-selection",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("role-selection");
  });

  it("returns pathname from location", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/tasks/abc",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.pathname).toBe("/tasks/abc");
  });

  it("does not extract task id for nested task paths", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/tasks/abc/edit",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("tasks");
    expect(result.current.selectedTaskId).toBeNull();
  });

  it("returns null selectedTaskId for specs path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/specs/something",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("specs");
    expect(result.current.selectedTaskId).toBeNull();
  });

  it("returns not-found view for unknown path", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/nonexistent-page",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    const { result } = renderHook(() => useCurrentView());
    expect(result.current.currentView).toBe("not-found");
  });
});
