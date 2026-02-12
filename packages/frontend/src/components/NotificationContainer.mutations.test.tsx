// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { createRef } from "react";
import NotificationContainer, { NotificationRef } from "./NotificationContainer";

describe("NotificationContainer mutation kills", () => {
  it("passes all props to Notification child", () => {
    const ref = createRef<NotificationRef>();
    render(<NotificationContainer ref={ref} />);

    act(() => {
      ref.current?.show("error", "msg", "desc", 5000, "success", {
        label: "Undo",
        onClick: vi.fn(),
      });
    });

    expect(screen.getByText("msg")).toBeInTheDocument();
    expect(screen.getByText("desc")).toBeInTheDocument();
  });

  it("renders each notification with correct type", () => {
    const ref = createRef<NotificationRef>();
    render(<NotificationContainer ref={ref} />);

    act(() => {
      ref.current?.show("success", "SuccessMsg");
      ref.current?.show("error", "ErrorMsg");
    });

    expect(screen.getByText("SuccessMsg")).toBeInTheDocument();
    expect(screen.getByText("ErrorMsg")).toBeInTheDocument();
  });

  it("generates unique ids for each notification", () => {
    const ref = createRef<NotificationRef>();
    render(<NotificationContainer ref={ref} />);

    act(() => {
      ref.current?.show("info", "A");
      ref.current?.show("info", "B");
    });

    // Both should render (unique keys)
    const container = document.querySelector(".notification-container");
    expect(container?.children.length).toBe(2);
  });

  it("passes undefined for optional props when not provided", () => {
    const ref = createRef<NotificationRef>();
    render(<NotificationContainer ref={ref} />);

    act(() => {
      ref.current?.show("info", "Plain");
    });

    // Should render without errors
    expect(screen.getByText("Plain")).toBeInTheDocument();
  });

  it("appends new notifications to existing list", () => {
    const ref = createRef<NotificationRef>();
    render(<NotificationContainer ref={ref} />);

    act(() => { ref.current?.show("success", "One"); });
    act(() => { ref.current?.show("error", "Two"); });
    act(() => { ref.current?.show("warning", "Three"); });

    const container = document.querySelector(".notification-container");
    expect(container?.children.length).toBe(3);
  });

  it("has displayName set", () => {
    expect(NotificationContainer.displayName).toBe("NotificationContainer");
  });

  it("container has correct class name", () => {
    render(<NotificationContainer />);
    expect(document.querySelector(".notification-container")).toBeInTheDocument();
  });
});
