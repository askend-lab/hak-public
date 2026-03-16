// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { NotificationProvider, useNotification } from "./NotificationContext";
import { ReactNode } from "react";

const showMock = vi.fn();

vi.mock("@/components/NotificationContainer", () => ({
  default: vi.fn(({ ref }: { ref: unknown }) => {
    if (ref && typeof ref === "object" && ref !== null && "current" in ref) {
      (ref as { current: { show: typeof showMock } }).current = {
        show: showMock,
      };
    }
    return null;
  }),
}));

describe("NotificationContext showNotification calls ref.show", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  beforeEach(() => {
    showMock.mockClear();
  });

  it("showNotification delegates to notificationRef.current.show", () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    act(() => {
      result.current.showNotification("success", "Test msg", "Desc", 3000);
    });
    // L41: BlockStatement {} would make function body empty → show not called
    // L42: OptionalChaining removes ?. → would throw if ref is null
    expect(showMock).toHaveBeenCalledTimes(1);
    expect(showMock).toHaveBeenCalledWith("success", "Test msg", "Desc", 3000, undefined, undefined);
  });

  it("showNotification passes all arguments to show", () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    const action = { label: "Click", onClick: vi.fn() };
    act(() => {
      result.current.showNotification("error", "Err", "Detail", 5000, undefined, action);
    });
    expect(showMock).toHaveBeenCalledWith("error", "Err", "Detail", 5000, undefined, action);
  });
});
