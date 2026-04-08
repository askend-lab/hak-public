// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddEntryModal from "./AddEntryModal";

describe("AddEntryModal", () => {
  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAdd.mockResolvedValue(undefined);
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("form submission", () => {
    it("calls onAdd with trimmed values", async () => {
      const user = userEvent.setup();
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );

      await user.type(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
        "  Test Title  ",
      );
      await user.type(
        screen.getByPlaceholderText("Kirjeldus"),
        "  Test Description  ",
      );
      await user.click(screen.getByRole("button", { name: "Lisa" }));

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          "Test Title",
          "Test Description",
        );
      });
    });

    it("closes modal on successful submit", async () => {
      const user = userEvent.setup();
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );

      await user.type(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
        "Test Title",
      );
      await user.click(screen.getByRole("button", { name: "Lisa" }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("resets form after successful submit", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );

      await user.type(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
        "Test Title",
      );
      await user.click(screen.getByRole("button", { name: "Lisa" }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // Rerender to simulate reopening
      rerender(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );
      expect(screen.getByPlaceholderText("Pealkiri (Kohustuslik)")).toHaveValue(
        "",
      );
    });

    it("shows loading state during submission", async () => {
      mockOnAdd.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      const user = userEvent.setup();
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );

      await user.type(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
        "Test",
      );
      await user.click(screen.getByRole("button", { name: "Lisa" }));

      expect(screen.getByText("Lisaan...")).toBeInTheDocument();
    });

    it("disables inputs during submission", async () => {
      mockOnAdd.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      const user = userEvent.setup();
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );

      await user.type(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
        "Test",
      );
      await user.click(screen.getByRole("button", { name: "Lisa" }));

      expect(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
      ).toBeDisabled();
      expect(screen.getByPlaceholderText("Kirjeldus")).toBeDisabled();
    });
  });

  });

  });

  });

  });

  });

});
