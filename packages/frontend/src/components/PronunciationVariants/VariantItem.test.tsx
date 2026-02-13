// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VariantItem } from "./VariantItem";

vi.mock("@/utils/phoneticMarkers", () => ({
  transformToUI: (text: string) => text.replace(/`/g, "˘"),
}));

vi.mock("./phoneticHelpers", () => ({
  parsePhoneticMarkers: (text: string) =>
    text.includes("`") ? [{ tag: "kolmas välde" }] : [],
  generatePronunciationExplanation: (text: string) =>
    text.includes("˘") ? "Kolmandas vältes" : "",
}));

vi.mock("../ui/Icons", () => ({
  PlayIcon: () => <span data-testid="play-icon">▶</span>,
  PauseIcon: () => <span data-testid="pause-icon">⏸</span>,
  VolumeIcon: ({ className }: { className?: string }) => <span data-testid="volume-icon" className={className}>🔊</span>,
}));

describe("VariantItem", () => {
  const variant = { text: "te`st", description: "test variant" };
  const defaultProps = {
    variant,
    isSelected: false,
    isPlaying: false,
    isLoading: false,
    onPlay: vi.fn(),
    onUse: vi.fn(),
  };

  it("renders display text", () => {
    render(<VariantItem {...defaultProps} />);
    expect(screen.getByText("te˘st")).toBeInTheDocument();
  });

  it("renders tags from markers", () => {
    const { container } = render(<VariantItem {...defaultProps} />);
    expect(container.querySelector(".pronunciation-variants__item-tag")).toBeTruthy();
    expect(screen.getByText("kolmas välde")).toBeInTheDocument();
  });

  it("renders variant without explanation section", () => {
    const { container } = render(<VariantItem {...defaultProps} />);
    expect(container.querySelector(".pronunciation-variants__item-explanation")).toBeNull();
  });

  it("hides explanation when empty", () => {
    const { container } = render(
      <VariantItem {...defaultProps} variant={{ text: "plain", description: "" }} />,
    );
    expect(container.querySelector(".pronunciation-variants__item-explanation")).toBeNull();
  });

  it("adds selected class when isSelected", () => {
    const { container } = render(<VariantItem {...defaultProps} isSelected={true} />);
    expect(container.querySelector(".pronunciation-variants__item--selected")).toBeTruthy();
  });

  it("does not add selected class when not selected", () => {
    const { container } = render(<VariantItem {...defaultProps} isSelected={false} />);
    expect(container.querySelector(".pronunciation-variants__item--selected")).toBeNull();
  });

  it("calls onPlay with variant when play clicked", () => {
    const onPlay = vi.fn();
    render(<VariantItem {...defaultProps} onPlay={onPlay} />);
    fireEvent.click(screen.getByTitle("Mängi"));
    expect(onPlay).toHaveBeenCalledWith(variant);
  });

  it("calls onUse with variant when Kasuta clicked", () => {
    const onUse = vi.fn();
    render(<VariantItem {...defaultProps} onUse={onUse} />);
    fireEvent.click(screen.getByText("Kasuta"));
    expect(onUse).toHaveBeenCalledWith(variant);
  });

  it("play button is disabled when loading", () => {
    render(<VariantItem {...defaultProps} isLoading={true} />);
    expect(screen.getByTitle("Laen...")).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    const { container } = render(<VariantItem {...defaultProps} isLoading={true} />);
    expect(container.querySelector(".loader-spinner")).toBeTruthy();
  });

  it("shows pause icon when playing", () => {
    render(<VariantItem {...defaultProps} isPlaying={true} />);
    expect(screen.getByTestId("pause-icon")).toBeInTheDocument();
    expect(screen.getByTitle("Mängib")).toBeInTheDocument();
  });

  it("shows play icon in default state", () => {
    render(<VariantItem {...defaultProps} />);
    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
  });

  it("play button has loading class when loading", () => {
    const { container } = render(<VariantItem {...defaultProps} isLoading={true} />);
    const btn = container.querySelector(".button--circular");
    expect(btn?.className).toContain("loading");
  });

  it("play button has playing class when playing", () => {
    const { container } = render(<VariantItem {...defaultProps} isPlaying={true} />);
    const btn = container.querySelector(".button--circular");
    expect(btn?.className).toContain("playing");
  });

  it("Kasuta button has button--secondary class", () => {
    render(<VariantItem {...defaultProps} />);
    const btn = screen.getByText("Kasuta");
    expect(btn.className).toContain("button--secondary");
  });
});
