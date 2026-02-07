import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetailLoading, TaskDetailError } from "./TaskDetailStates";

describe("TaskDetailLoading", () => {
  it("renders loading state with back button", () => {
    render(<TaskDetailLoading onBack={vi.fn()} />);
    expect(screen.getByText("Laen ülesannet...")).toBeInTheDocument();
    expect(screen.getByText("Tagasi")).toBeInTheDocument();
  });

  it("calls onBack when clicked", async () => {
    const onBack = vi.fn();
    render(<TaskDetailLoading onBack={onBack} />);
    await userEvent.click(screen.getByText("Tagasi"));
    expect(onBack).toHaveBeenCalled();
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
