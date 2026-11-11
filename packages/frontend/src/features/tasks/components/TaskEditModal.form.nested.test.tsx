// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { beforeEach,  describe, it, expect, vi } from "vitest";
import { waitFor,  render, screen } from "@testing-library/react";
import TaskEditModal from "./TaskEditModal";
import userEvent from "@testing-library/user-event";

describe("TaskEditModal mutation kills", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockSetTaskToEdit = vi.fn();
  const task = { id: "t1", name: "My Task", description: "My Desc" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  it("submit calls setTaskToEdit with trimmed description", async () => {
    const user = userEvent.setup();
    render(<TaskEditModal isOpen={true} task={task} onClose={mockOnClose} onSave={mockOnSave} setTaskToEdit={mockSetTaskToEdit} />);
    const desc = screen.getByPlaceholderText("Kirjeldus");
    await user.clear(desc);
    await user.type(desc, "  trimmed desc  ");
    await user.click(screen.getByRole("button", { name: "Salvesta" }));
    await waitFor(() => {
      expect(mockSetTaskToEdit).toHaveBeenCalledWith(
        expect.objectContaining({ description: "trimmed desc" }),
      );
    });
  });

  it("submit trims name (not raw value)", async () => {
    const user = userEvent.setup();
    render(<TaskEditModal isOpen={true} task={task} onClose={mockOnClose} onSave={mockOnSave} setTaskToEdit={mockSetTaskToEdit} />);
    const nameInput = screen.getByPlaceholderText("Ülesande nimi (Kohustuslik)");
    await user.clear(nameInput);
    await user.type(nameInput, "  Name With Spaces  ");
    await user.click(screen.getByRole("button", { name: "Salvesta" }));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Name With Spaces" }),
      );
    });
  });

  it("empty description after trim becomes null", async () => {
    const user = userEvent.setup();
    render(<TaskEditModal isOpen={true} task={task} onClose={mockOnClose} onSave={mockOnSave} setTaskToEdit={mockSetTaskToEdit} />);
    const desc = screen.getByPlaceholderText("Kirjeldus");
    await user.clear(desc);
    await user.type(desc, "   ");
    await user.click(screen.getByRole("button", { name: "Salvesta" }));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ description: null }),
      );
    });
  });

  it("submit button shows Salvesta text normally", () => {
    render(<TaskEditModal isOpen={true} task={task} onClose={mockOnClose} onSave={mockOnSave} setTaskToEdit={mockSetTaskToEdit} />);
    expect(screen.getByRole("button", { name: "Salvesta" })).toBeInTheDocument();
  });

  });

  });

  });

  });

  });

});
