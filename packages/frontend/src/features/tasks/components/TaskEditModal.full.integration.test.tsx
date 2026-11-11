// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskEditModal from "./TaskEditModal";

describe("TaskEditModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockSetTaskToEdit = vi.fn();
  const mockTask = {
    id: "task-1",
    name: "Test Task",
    description: "Test description",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("input handling", () => {
    it("updates name on input", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditModal
          isOpen={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );

      const input = screen.getByPlaceholderText("Ülesande nimi (Kohustuslik)");
      await user.clear(input);
      await user.type(input, "New Name");
      expect(input).toHaveValue("New Name");
    });

    it("updates description on input", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditModal
          isOpen={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );

      const textarea = screen.getByPlaceholderText("Kirjeldus");
      await user.clear(textarea);
      await user.type(textarea, "New Description");
      expect(textarea).toHaveValue("New Description");
    });

    it("disables submit with empty name", async () => {
      const user = userEvent.setup();
      render(
        <TaskEditModal
          isOpen={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );

      const input = screen.getByPlaceholderText("Ülesande nimi (Kohustuslik)");
      await user.clear(input);
      expect(screen.getByRole("button", { name: "Salvesta" })).toBeDisabled();
    });
  });

  });

  });

  });

  });

  });

});
