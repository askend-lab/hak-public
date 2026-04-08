// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import Notification from "./Notification";

describe("Notification", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has correct root class string", () => {
    const { container } = render(
      <Notification type="success" message="msg" onClose={vi.fn()} />,
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain("modal");
    expect(root?.className).toContain("modal--small");
    expect(root?.className).toContain("modal--outlined");
    expect(root?.className).toContain("notification-toast");
  });

  it("does not render paragraph when no description or action", () => {
    const { container } = render(
      <Notification type="info" message="msg" onClose={vi.fn()} />,
    );
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(1);
  });

  it("action button has notification-action-link class", () => {
    const { container } = render(
      <Notification
        type="info"
        message="msg"
        action={{ label: "Do it", onClick: vi.fn() }}
        onClose={vi.fn()}
      />,
    );
    const actionBtn = container.querySelector(".notification-action-link");
    expect(actionBtn).toBeTruthy();
    expect(actionBtn?.textContent).toBe("Do it");
  });

  it("renders message in h2 element", () => {
    render(
      <Notification type="info" message="My message" onClose={vi.fn()} />,
    );
    const el = screen.getByText("My message");
    expect(el.tagName).toBe("P");
  });

  it("returns undefined cleanup when duration is 0", () => {
    const onClose = vi.fn();
    render(
      <Notification type="info" message="msg" duration={0} onClose={onClose} />,
    );
    act(() => { vi.advanceTimersByTime(100000); });
    expect(onClose).not.toHaveBeenCalled();
  });

});
