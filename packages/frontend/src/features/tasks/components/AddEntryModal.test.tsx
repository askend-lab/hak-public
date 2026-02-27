// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddEntryModal from "./AddEntryModal";

describe("AddEntryModal", () => {
  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAdd.mockResolvedValue(undefined);
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("rendering", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <AddEntryModal
          isOpen={false}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders when open", () => {
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );
      expect(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
      ).toBeInTheDocument();
    });

    it("renders title input", () => {
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );
      expect(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
      ).toBeInTheDocument();
    });

    it("renders description textarea", () => {
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );
      expect(screen.getByPlaceholderText("Kirjeldus")).toBeInTheDocument();
    });

    it("renders submit button disabled initially", () => {
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );
      expect(screen.getByRole("button", { name: "Lisa" })).toBeDisabled();
    });
  });

  describe("input handling", () => {
    it("enables submit button when title entered", async () => {
      const user = userEvent.setup();
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );

      await user.type(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
        "Test Title",
      );
      expect(screen.getByRole("button", { name: "Lisa" })).not.toBeDisabled();
    });

    it("disables submit with whitespace-only title", async () => {
      const user = userEvent.setup();
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );

      await user.type(
        screen.getByPlaceholderText("Pealkiri (Kohustuslik)"),
        "   ",
      );
      expect(screen.getByRole("button", { name: "Lisa" })).toBeDisabled();
    });

    it("allows entering description", async () => {
      const user = userEvent.setup();
      render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />,
      );

      const textarea = screen.getByPlaceholderText("Kirjeldus");
      await user.type(textarea, "Test description");
      expect(textarea).toHaveValue("Test description");
    });
  });

  });

  });

  });

  });

  });

});
