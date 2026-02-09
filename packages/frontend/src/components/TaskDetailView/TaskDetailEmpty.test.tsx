// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetailEmpty } from "./TaskDetailEmpty";

const mockTask = {
  id: "t1",
  name: "Test",
  description: "Desc",
  userId: "u1",
  entries: [],
  speechSequences: [],
  shareToken: "tok",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("TaskDetailEmpty", () => {
  it("renders task name and description when task provided", () => {
    render(<TaskDetailEmpty task={mockTask} onNavigateToSynthesis={vi.fn()} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });

  it("renders placeholder text when task is null", () => {
    render(<TaskDetailEmpty task={null} onNavigateToSynthesis={vi.fn()} />);
    expect(screen.getByText("Ülesanne")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Alusta sisu loomisega, et lisada lauseid sellesse ülesandesse.",
      ),
    ).toBeInTheDocument();
  });

  it("renders default description when task has no description", () => {
    const taskWithoutDesc = { ...mockTask, description: "" };
    render(
      <TaskDetailEmpty
        task={taskWithoutDesc}
        onNavigateToSynthesis={vi.fn()}
      />,
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Alusta sisu loomisega, et lisada lauseid sellesse ülesandesse.",
      ),
    ).toBeInTheDocument();
  });

  it("calls onNavigateToSynthesis when button clicked", async () => {
    const onNavigateToSynthesis = vi.fn();
    render(
      <TaskDetailEmpty
        task={mockTask}
        onNavigateToSynthesis={onNavigateToSynthesis}
      />,
    );
    await userEvent.click(screen.getByText("Hakkan sisu looma"));
    expect(onNavigateToSynthesis).toHaveBeenCalled();
  });

  it("uses design system empty-state classes", () => {
    const { container } = render(
      <TaskDetailEmpty task={mockTask} onNavigateToSynthesis={vi.fn()} />,
    );
    expect(container.querySelector(".page-content--empty")).toBeInTheDocument();
    expect(container.querySelector(".empty-state")).toBeInTheDocument();
    expect(container.querySelector(".empty-state__title")).toBeInTheDocument();
    expect(
      container.querySelector(".empty-state__description"),
    ).toBeInTheDocument();
    expect(container.querySelector(".empty-state__action")).toBeInTheDocument();
  });
});
