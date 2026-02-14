// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareTaskModal from "./ShareTaskModal";
import { logger } from "@hak/shared";

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({
    showNotification: vi.fn(),
  })),
}));

describe("ShareTaskModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <ShareTaskModal
          isOpen={false}
          shareToken="abc123"
          taskName="Test"
          onClose={mockOnClose}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders when open", () => {
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("Jaga ülesanne: Test Task")).toBeInTheDocument();
    });

    it("renders share URL with token", () => {
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      const input = screen.getByLabelText("Jagamislink");
      expect(input).toHaveValue();
      expect((input as HTMLInputElement).value).toContain(
        "/shared/task/abc123",
      );
    });

    it("renders copy button", () => {
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Kopeeri" }),
      ).toBeInTheDocument();
    });

    it("renders description text", () => {
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      expect(
        screen.getByText(/Kopeeri ja jaga seda linki/),
      ).toBeInTheDocument();
    });

    it("URL input is readonly", () => {
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByLabelText("Jagamislink")).toHaveAttribute("readonly");
    });
  });

  describe("copy button", () => {
    it("shows copy button", () => {
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Kopeeri" }),
      ).toBeInTheDocument();
    });

    it("button is not disabled by default", () => {
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Kopeeri" }),
      ).not.toBeDisabled();
    });
  });

  describe("copy functionality", () => {
    it("copy button is clickable", async () => {
      const user = userEvent.setup();
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      const btn = screen.getByRole("button", { name: "Kopeeri" });
      expect(btn).not.toBeDisabled();
      // Note: clipboard API not available in jsdom, just verify button is interactive
      await user.click(btn);
    });

    it("does not close on copy click", async () => {
      const user = userEvent.setup();
      render(
        <ShareTaskModal
          isOpen={true}
          shareToken="abc123"
          taskName="Test Task"
          onClose={mockOnClose}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Kopeeri" }));
      // onClose should not be called after copy attempt
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});

// --- Merged from ShareTaskModal.mutations.test.tsx ---
const mockShowNotification = vi.fn();
vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({ showNotification: mockShowNotification })),
}));

describe("ShareTaskModal mutation kills", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when not open", () => {
    const { container } = render(
      <ShareTaskModal isOpen={false} shareToken="abc" taskName="T" onClose={mockOnClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders share URL containing shareToken", () => {
    render(<ShareTaskModal isOpen={true} shareToken="tok-42" taskName="T" onClose={mockOnClose} />);
    const input = screen.getByLabelText("Jagamislink") as HTMLInputElement;
    expect(input.value).toContain("/shared/task/tok-42");
    expect(input.value).toContain(window.location.origin);
  });

  it("copy button is not disabled by default", () => {
    render(<ShareTaskModal isOpen={true} shareToken="abc" taskName="T" onClose={mockOnClose} />);
    expect(screen.getByRole("button", { name: "Kopeeri" })).not.toBeDisabled();
  });

  it("copy button text says Kopeeri", () => {
    render(<ShareTaskModal isOpen={true} shareToken="abc" taskName="T" onClose={mockOnClose} />);
    expect(screen.getByRole("button", { name: "Kopeeri" })).toHaveTextContent("Kopeeri");
  });

  it("does not call onClose when copy button clicked", async () => {
    const user = userEvent.setup();
    render(<ShareTaskModal isOpen={true} shareToken="abc" taskName="T" onClose={mockOnClose} />);
    await user.click(screen.getByRole("button", { name: "Kopeeri" }));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("renders description text", () => {
    render(<ShareTaskModal isOpen={true} shareToken="abc" taskName="T" onClose={mockOnClose} />);
    expect(screen.getByText(/Kopeeri ja jaga seda linki/)).toBeInTheDocument();
  });

  it("input is readonly", () => {
    render(<ShareTaskModal isOpen={true} shareToken="abc" taskName="T" onClose={mockOnClose} />);
    expect(screen.getByLabelText("Jagamislink")).toHaveAttribute("readonly");
  });

  it("renders with correct modal title", () => {
    render(<ShareTaskModal isOpen={true} shareToken="abc" taskName="T" onClose={mockOnClose} />);
    expect(screen.getByText("Jaga ülesanne: T")).toBeInTheDocument();
  });

  it("isCopying resets to false after successful copy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, writable: true, configurable: true });
    const user = userEvent.setup();
    render(<ShareTaskModal isOpen={true} shareToken="tok" taskName="T" onClose={mockOnClose} />);
    await user.click(screen.getByRole("button", { name: "Kopeeri" }));
    // After copy completes, button should show "Kopeeri" (not "Kopeeritud!")
    expect(screen.getByRole("button", { name: "Kopeeri" })).not.toBeDisabled();
  });

  it("isCopying resets to false after failed copy", async () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, writable: true, configurable: true });
    const user = userEvent.setup();
    render(<ShareTaskModal isOpen={true} shareToken="tok" taskName="T" onClose={mockOnClose} />);
    await user.click(screen.getByRole("button", { name: "Kopeeri" }));
    expect(screen.getByRole("button", { name: "Kopeeri" })).not.toBeDisabled();
    spy.mockRestore();
  });
});
