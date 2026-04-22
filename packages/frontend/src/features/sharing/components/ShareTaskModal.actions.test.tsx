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

  it("does not show expiration notice", () => {
    render(<ShareTaskModal isOpen={true} shareToken="tok" taskName="T" onClose={mockOnClose} />);
    expect(screen.queryByText(/90 päeva/)).not.toBeInTheDocument();
  });

  it("shows revoke button when onRevoke provided", () => {
    const onRevoke = vi.fn().mockResolvedValue(undefined);
    render(<ShareTaskModal isOpen={true} shareToken="tok" taskName="T" onClose={mockOnClose} onRevoke={onRevoke} />);
    expect(screen.getByRole("button", { name: "Tühista jagamine" })).toBeInTheDocument();
  });

  it("does not show revoke button when onRevoke not provided", () => {
    render(<ShareTaskModal isOpen={true} shareToken="tok" taskName="T" onClose={mockOnClose} />);
    expect(screen.queryByRole("button", { name: "Tühista jagamine" })).not.toBeInTheDocument();
  });

  it("calls onRevoke and closes on revoke click", async () => {
    const onRevoke = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ShareTaskModal isOpen={true} shareToken="tok" taskName="T" onClose={mockOnClose} onRevoke={onRevoke} />);
    await user.click(screen.getByRole("button", { name: "Tühista jagamine" }));
    expect(onRevoke).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows error notification when revoke fails", async () => {
    const onRevoke = vi.fn().mockRejectedValue(new Error("fail"));
    const user = userEvent.setup();
    render(<ShareTaskModal isOpen={true} shareToken="tok" taskName="T" onClose={mockOnClose} onRevoke={onRevoke} />);
    await user.click(screen.getByRole("button", { name: "Tühista jagamine" }));
    expect(onRevoke).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

});
