// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareTaskModal from "./ShareTaskModal";

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
});
