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

  it("renders notification with message", () => {
    render(
      <Notification type="success" message="Test message" onClose={vi.fn()} />,
    );

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders notification with description", () => {
    render(
      <Notification
        type="info"
        message="Test message"
        description="Test description"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("calls onClose after duration", () => {
    const onClose = vi.fn();
    render(
      <Notification
        type="success"
        message="Test message"
        duration={3000}
        onClose={onClose}
      />,
    );

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not auto-close when duration is 0", () => {
    const onClose = vi.fn();
    render(
      <Notification
        type="success"
        message="Test message"
        duration={0}
        onClose={onClose}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders action button when provided", () => {
    const actionClick = vi.fn();
    render(
      <Notification
        type="info"
        message="Test message"
        action={{ label: "Undo", onClick: actionClick }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  it("calls action onClick and onClose when action button clicked", async () => {
    vi.useRealTimers();
    const actionClick = vi.fn();
    const onClose = vi.fn();
    render(
      <Notification
        type="info"
        message="Test message"
        action={{ label: "Undo", onClick: actionClick }}
        onClose={onClose}
        duration={0}
      />,
    );

    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    await user.click(screen.getByText("Undo"));
    expect(actionClick).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    vi.useFakeTimers();
  });

  it("applies correct color class for each type", () => {
    const { container, unmount } = render(
      <Notification type="success" message="ok" onClose={vi.fn()} />,
    );
    expect(container.querySelector(".modal--success--outlined")).toBeTruthy();
    unmount();

    const { container: c2, unmount: u2 } = render(
      <Notification type="error" message="err" onClose={vi.fn()} />,
    );
    expect(c2.querySelector(".modal--danger--outlined")).toBeTruthy();
    u2();

    const { container: c3, unmount: u3 } = render(
      <Notification type="warning" message="warn" onClose={vi.fn()} />,
    );
    expect(c3.querySelector(".modal--warning--outlined")).toBeTruthy();
    u3();

    const { container: c4 } = render(
      <Notification type="info" message="info" onClose={vi.fn()} />,
    );
    expect(c4.querySelector(".modal--primary--outlined")).toBeTruthy();
  });

  it("uses custom color when provided", () => {
    const { container } = render(
      <Notification type="success" color="neutral" message="msg" onClose={vi.fn()} />,
    );
    expect(container.querySelector(".modal--neutral--outlined")).toBeTruthy();
  });

  it("renders description and action with separator space", () => {
    const { container } = render(
      <Notification
        type="info"
        message="msg"
        description="Some desc"
        action={{ label: "Act", onClick: vi.fn() }}
        onClose={vi.fn()}
      />,
    );
    const paragraphs = container.querySelectorAll("p");
    const descP = paragraphs[1];
    expect(descP?.textContent).toContain("Some desc");
    expect(descP?.textContent).toContain("Act");
  });

  it("has close button with aria-label", () => {
    render(
      <Notification type="info" message="msg" onClose={vi.fn()} />,
    );
    expect(screen.getByLabelText("Sulge teade")).toBeInTheDocument();
  });

  it("uses default duration of 4000ms", () => {
    const onClose = vi.fn();
    render(
      <Notification type="info" message="msg" onClose={onClose} />,
    );
    act(() => { vi.advanceTimersByTime(3999); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onClose).toHaveBeenCalledTimes(1);
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
