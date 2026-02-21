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
        ref.current?.show({ type: "success", message: "Test message" });
      });

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("shows notification with description", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show({ type: "info", message: "Title", description: "Description text" });
      });

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("shows multiple notifications", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show({ type: "success", message: "First" });
        ref.current?.show({ type: "error", message: "Second" });
        ref.current?.show({ type: "info", message: "Third" });
      });

      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });

    it("shows notification with custom color", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show({ type: "success", message: "Test", color: "success" });
      });

      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  describe("remove notification", () => {
    it("removes notification when onClose is triggered", async () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show({ type: "success", message: "Removable" });
      });

      expect(screen.getByText("Removable")).toBeInTheDocument();

      // Click the close button on the notification
      const closeBtn = document.querySelector("[aria-label='Sulge teade']");
      expect(closeBtn).toBeTruthy();
      act(() => {
        (closeBtn as HTMLElement).click();
      });

      expect(screen.queryByText("Removable")).not.toBeInTheDocument();
    });
  });

  describe("notification types", () => {
    it("shows success notification", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show({ type: "success", message: "Success message" });
      });

      expect(screen.getByText("Success message")).toBeInTheDocument();
    });

    it("shows error notification", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show({ type: "error", message: "Error message" });
      });

      expect(screen.getByText("Error message")).toBeInTheDocument();
    });

    it("shows info notification", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show({ type: "info", message: "Info message" });
      });

      expect(screen.getByText("Info message")).toBeInTheDocument();
    });

    it("shows warning notification", () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show({ type: "warning", message: "Warning message" });
      });

      expect(screen.getByText("Warning message")).toBeInTheDocument();
    });
  });
});
