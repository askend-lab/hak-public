// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetailLoading, TaskDetailError } from "./TaskDetailStates";

describe("TaskDetailLoading", () => {
  it("renders loading state without back button", () => {
    render(<TaskDetailLoading />);
    expect(screen.getByText("Laen ülesannet...")).toBeInTheDocument();
    expect(screen.queryByText("Tagasi")).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<TaskDetailLoading />);
    const loadingState = screen.getByRole("status");
    expect(loadingState).toBeInTheDocument();
    expect(loadingState).toHaveAttribute("aria-live", "polite");
  });
});

describe("TaskDetailError", () => {
  it("renders error message with back button", () => {
    render(<TaskDetailError onBack={vi.fn()} error="Test error" />);
    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(screen.getByText("Tagasi")).toBeInTheDocument();
  });

  it("calls onBack when clicked", async () => {
    const onBack = vi.fn();
    render(<TaskDetailError onBack={onBack} error="Error" />);
    await userEvent.click(screen.getByText("Tagasi"));
    expect(onBack).toHaveBeenCalled();
  });
});
