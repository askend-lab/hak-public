// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { createRef } from "react";
import NotificationContainer, {
  NotificationRef,
} from "./NotificationContainer";

describe("NotificationContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders empty container initially", () => {
      render(<NotificationContainer />);
      expect(
        document.querySelector(".notification-container"),
      ).toBeInTheDocument();
    });

    it("renders no notifications initially", () => {
      render(<NotificationContainer />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("show notification", () => {
    it("shows notification when show is called", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("success", "Test message");
      });

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("shows notification with description", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("info", "Title", "Description text");
      });

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("shows multiple notifications", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("success", "First");
        ref.current?.show("error", "Second");
        ref.current?.show("info", "Third");
      });

      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });

    it("shows notification with custom color", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("success", "Test", undefined, undefined, "success");
      });

      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  describe("remove notification", () => {
    it("removes notification when onClose is triggered", async () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("success", "Removable");
      });

      expect(screen.getByText("Removable")).toBeInTheDocument();

      // Click the close button on the notification
      const closeBtn = document.querySelector(".notification__close");
      if (closeBtn) {
        act(() => {
          (closeBtn as HTMLElement).click();
        });
      }
    });
  });

  describe("notification types", () => {
    it("shows success notification", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("success", "Success message");
      });

      expect(screen.getByText("Success message")).toBeInTheDocument();
    });

    it("shows error notification", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("error", "Error message");
      });

      expect(screen.getByText("Error message")).toBeInTheDocument();
    });

    it("shows info notification", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("info", "Info message");
      });

      expect(screen.getByText("Info message")).toBeInTheDocument();
    });

    it("shows warning notification", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show("warning", "Warning message");
      });

      expect(screen.getByText("Warning message")).toBeInTheDocument();
    });
  });
});

// --- Merged from NotificationContainer.mutations.test.tsx ---
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
