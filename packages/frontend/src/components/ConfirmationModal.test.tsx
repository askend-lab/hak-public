// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmationModal from "./ConfirmationModal";

describe("ConfirmationModal", () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("rendering", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={false}
          title="Test"
          message="Test message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders when open", () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test Title"
          message="Test message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("renders default button texts", () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test"
          message="Test"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Tühista" }),
      ).toBeInTheDocument();
    });

    it("renders custom button texts", () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test"
          message="Test"
          confirmText="Confirm"
          cancelText="Dismiss"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Confirm" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Dismiss" }),
      ).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onConfirm when confirm button clicked", async () => {
      const user = userEvent.setup();
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test"
          message="Test"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      await user.click(screen.getByRole("button", { name: "OK" }));
      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it("calls onCancel when cancel button clicked", async () => {
      const user = userEvent.setup();
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test"
          message="Test"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Tühista" }));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  });

  });

  });

  });

  });

});
