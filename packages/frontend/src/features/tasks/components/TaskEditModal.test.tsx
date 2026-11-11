// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskEditModal from "./TaskEditModal";

describe("TaskEditModal", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <TaskEditModal
        isOpen={false}
        task={null}
        onClose={vi.fn()}
        onSave={vi.fn()}
        setTaskToEdit={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders modal when isOpen is true with task", () => {
    render(
      <TaskEditModal
        isOpen={true}
        task={{ id: "1", name: "Test Task", description: "Test" }}
        onClose={vi.fn()}
        onSave={vi.fn()}
        setTaskToEdit={vi.fn()}
      />,
    );

    const modal = document.querySelector(".base-modal");
    expect(modal).toBeInTheDocument();
  });

  it("populates form from task with null description", () => {
    render(
      <TaskEditModal
        isOpen={true}
        task={{ id: "1", name: "My Task", description: null }}
        onClose={vi.fn()}
        onSave={vi.fn()}
        setTaskToEdit={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("My Task")).toBeInTheDocument();
  });

});
