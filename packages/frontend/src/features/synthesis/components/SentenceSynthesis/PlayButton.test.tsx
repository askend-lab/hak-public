// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayButton } from "./PlayButton";

vi.mock("@/components/ui/Icons", () => ({
  PlayIcon: () => <span data-testid="play-icon">▶</span>,
  PauseIcon: () => <span data-testid="pause-icon">⏸</span>,
}));

describe("PlayButton", () => {
  const defaultProps = {
    isPlaying: false,
    isLoading: false,
    disabled: false,
    onClick: vi.fn(),
  };

  it("renders play icon in default state", () => {
    render(<PlayButton {...defaultProps} />);
    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("renders pause icon when playing", () => {
    render(<PlayButton {...defaultProps} isPlaying={true} />);
    expect(screen.getByTestId("pause-icon")).toBeInTheDocument();
    expect(screen.getByLabelText("Playing")).toBeInTheDocument();
  });

  it("renders spinner when loading", () => {
    const { container } = render(<PlayButton {...defaultProps} isLoading={true} />);
    expect(container.querySelector(".loader-spinner")).toBeTruthy();
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<PlayButton {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText("Play"));
    expect(onClick).toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<PlayButton {...defaultProps} disabled={true} />);
    expect(screen.getByLabelText("Play")).toBeDisabled();
  });

  it("has correct CSS classes", () => {
    render(<PlayButton {...defaultProps} />);
    const btn = screen.getByLabelText("Play");
    expect(btn.className).toContain("button--primary");
    expect(btn.className).toContain("button--icon-only");
    expect(btn.className).toContain("button--circular");
  });

  it("has loading class when isLoading", () => {
    render(<PlayButton {...defaultProps} isLoading={true} />);
    const btn = screen.getByLabelText("Loading");
    expect(btn.className).toContain("loading");
  });

  it("has playing class when isPlaying", () => {
    render(<PlayButton {...defaultProps} isPlaying={true} />);
    const btn = screen.getByLabelText("Playing");
    expect(btn.className).toContain("playing");
  });

  it("sets data-onboarding-target when provided", () => {
    render(<PlayButton {...defaultProps} data-onboarding-target="play-btn" />);
    const btn = screen.getByLabelText("Play");
    expect(btn.getAttribute("data-onboarding-target")).toBe("play-btn");
  });

  it("does not have loading or playing class in default state", () => {
    render(<PlayButton {...defaultProps} />);
    const btn = screen.getByLabelText("Play");
    expect(btn.className).not.toContain("loading");
    expect(btn.className).not.toContain("playing");
  });
});
