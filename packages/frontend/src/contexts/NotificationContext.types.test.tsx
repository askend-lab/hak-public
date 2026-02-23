// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { NotificationProvider, useNotification } from "./NotificationContext";

function wrapper({ children }: { children: ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}

describe("NotificationContext", () => {
  it("provides showNotification function within provider", () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(typeof result.current.showNotification).toBe("function");
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useNotification());
    }).toThrow("useNotification must be used within NotificationProvider");
  });

  it("showNotification does not throw when called", () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    expect(() => {
      result.current.showNotification({ type: "info", message: "test" });
    }).not.toThrow();
  });
});
