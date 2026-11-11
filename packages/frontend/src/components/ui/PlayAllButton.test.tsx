// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayAllButton } from "./PlayAllButton";

vi.mock("./Icons", () => ({
  PlayIcon: () => <span data-testid="play-icon">▶</span>,
  PauseIcon: () => <span data-testid="pause-icon">⏸</span>,
}));

describe("PlayAllButton", () => {
  it("renders play state with correct text and icon", () => {
    render(<PlayAllButton isPlaying={false} isLoading={false} onClick={vi.fn()} />);
    expect(screen.getByText("Mängi kõik")).toBeInTheDocument();
    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
  });

  it("renders playing state with pause icon and text", () => {
    render(<PlayAllButton isPlaying={true} isLoading={false} onClick={vi.fn()} />);
    expect(screen.getByText("Peata")).toBeInTheDocument();
    expect(screen.getByTestId("pause-icon")).toBeInTheDocument();
  });

  it("renders loading state with spinner and text", () => {
    const { container } = render(
      <PlayAllButton isPlaying={false} isLoading={true} onClick={vi.fn()} />,
    );
    expect(screen.getByText("Laadimine")).toBeInTheDocument();
    expect(container.querySelector(".loader-spinner")).toBeTruthy();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<PlayAllButton isPlaying={false} isLoading={false} onClick={onClick} />);
    fireEvent.click(screen.getByText("Mängi kõik"));
    expect(onClick).toHaveBeenCalled();
  });

  it("has button--primary class", () => {
    render(<PlayAllButton isPlaying={false} isLoading={false} onClick={vi.fn()} />);
    const btn = screen.getByText("Mängi kõik").closest("button");
    expect(btn?.className).toContain("button--primary");
  });

  it("has loading class when isLoading", () => {
    render(<PlayAllButton isPlaying={false} isLoading={true} onClick={vi.fn()} />);
    const btn = screen.getByText("Laadimine").closest("button");
    expect(btn?.className).toContain("loading");
  });

  it("does not have loading class when not loading", () => {
    render(<PlayAllButton isPlaying={false} isLoading={false} onClick={vi.fn()} />);
    const btn = screen.getByText("Mängi kõik").closest("button");
    expect(btn?.className).not.toContain("loading");
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <PlayAllButton isPlaying={false} isLoading={false} onClick={vi.fn()} disabled={true} />,
    );
    expect(screen.getByText("Mängi kõik").closest("button")).toBeDisabled();
  });

  it("is not disabled when disabled prop is false", () => {
    render(
      <PlayAllButton isPlaying={false} isLoading={false} onClick={vi.fn()} disabled={false} />,
    );
    expect(screen.getByText("Mängi kõik").closest("button")).not.toBeDisabled();
  });
});
