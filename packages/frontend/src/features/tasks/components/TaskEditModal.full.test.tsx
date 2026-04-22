// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("rendering", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <TaskEditModal
          isOpen={false}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("returns null when no task", () => {
      const { container } = render(
        <TaskEditModal
          isOpen={true}
          task={null}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders when open with task", () => {
      render(
        <TaskEditModal
          isOpen={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );
      expect(screen.getByText("Muuda ülesannet")).toBeInTheDocument();
    });

    it("populates name field with task name", () => {
      render(
        <TaskEditModal
          isOpen={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );
      expect(
        screen.getByPlaceholderText("Ülesande nimi (Kohustuslik)"),
      ).toHaveValue("Test Task");
    });

    it("populates description field with task description", () => {
      render(
        <TaskEditModal
          isOpen={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );
      expect(screen.getByPlaceholderText("Kirjeldus")).toHaveValue(
        "Test description",
      );
    });

    it("handles task without description", () => {
      const taskNoDesc = { id: "task-1", name: "Test Task" };
      render(
        <TaskEditModal
          isOpen={true}
          task={taskNoDesc}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );
      expect(screen.getByPlaceholderText("Kirjeldus")).toHaveValue("");
    });

    it("renders submit button", () => {
      render(
        <TaskEditModal
          isOpen={true}
          task={mockTask}
          onClose={mockOnClose}
          onSave={mockOnSave}
          setTaskToEdit={mockSetTaskToEdit}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Salvesta" }),
      ).toBeInTheDocument();
    });
  });

  });

  });

  });

  });

  });

});
