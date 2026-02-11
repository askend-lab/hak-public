// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomVariantForm } from "./CustomVariantForm";

vi.mock("../ui/Icons", () => ({
  PlayIcon: () => <span data-testid="play-icon">▶</span>,
  PauseIcon: () => <span data-testid="pause-icon">⏸</span>,
  CloseIcon: () => <span data-testid="close-icon">✕</span>,
}));

vi.mock("../ui/MarkersGuideBox", () => ({
  default: ({ onInsertMarker, onShowGuide, className }: { onInsertMarker: (m: string) => void; onShowGuide: () => void; className?: string }) => (
    <div data-testid="markers-guide" className={className}>
      <button onClick={() => onInsertMarker("`")}>Insert</button>
      <button onClick={onShowGuide}>Guide</button>
    </div>
  ),
}));

describe("CustomVariantForm", () => {
  const defaultProps = {
    value: "test",
    onChange: vi.fn(),
    onPlay: vi.fn(),
    onUse: vi.fn(),
    onClose: vi.fn(),
    onShowGuide: vi.fn(),
    isPlaying: false,
    isLoading: false,
  };

  it("renders title and description", () => {
    render(<CustomVariantForm {...defaultProps} />);
    expect(screen.getByText("Loo oma variant")).toBeInTheDocument();
    expect(screen.getByText(/Sisesta oma tekst/)).toBeInTheDocument();
  });

  it("renders input with value", () => {
    render(<CustomVariantForm {...defaultProps} />);
    expect(screen.getByDisplayValue("test")).toBeInTheDocument();
  });

  it("renders placeholder", () => {
    render(<CustomVariantForm {...defaultProps} value="" />);
    expect(screen.getByPlaceholderText(/Kirjuta oma/)).toBeInTheDocument();
  });

  it("calls onChange on input change", () => {
    const onChange = vi.fn();
    render(<CustomVariantForm {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue("test"), { target: { value: "new" } });
    expect(onChange).toHaveBeenCalledWith("new");
  });

  it("shows clear button when value is non-empty", () => {
    render(<CustomVariantForm {...defaultProps} value="hello" />);
    expect(screen.getByLabelText("Clear input")).toBeInTheDocument();
  });

  it("hides clear button when value is empty", () => {
    render(<CustomVariantForm {...defaultProps} value="" />);
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
  });

  it("calls onChange with empty string when clear clicked", () => {
    const onChange = vi.fn();
    render(<CustomVariantForm {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Clear input"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("calls onPlay when play button clicked", () => {
    const onPlay = vi.fn();
    render(<CustomVariantForm {...defaultProps} onPlay={onPlay} />);
    fireEvent.click(screen.getByTitle("Kuula"));
    expect(onPlay).toHaveBeenCalled();
  });

  it("play button is disabled when value is empty", () => {
    const { container } = render(<CustomVariantForm {...defaultProps} value="  " />);
    const playBtn = container.querySelector(".button--primary.button--circular");
    expect(playBtn).toBeTruthy();
    expect((playBtn as HTMLButtonElement)?.disabled).toBe(true);
  });

  it("play button is disabled when loading", () => {
    const { container } = render(<CustomVariantForm {...defaultProps} isLoading={true} />);
    const playBtn = container.querySelector(".button--primary.button--circular");
    expect((playBtn as HTMLButtonElement)?.disabled).toBe(true);
  });

  it("shows spinner when loading", () => {
    const { container } = render(<CustomVariantForm {...defaultProps} isLoading={true} />);
    expect(container.querySelector(".loader-spinner")).toBeTruthy();
  });

  it("shows pause icon when playing", () => {
    render(<CustomVariantForm {...defaultProps} isPlaying={true} />);
    expect(screen.getByTestId("pause-icon")).toBeInTheDocument();
  });

  it("shows play icon in default state", () => {
    render(<CustomVariantForm {...defaultProps} />);
    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
  });

  it("calls onUse when Helinda button clicked", () => {
    const onUse = vi.fn();
    render(<CustomVariantForm {...defaultProps} onUse={onUse} />);
    fireEvent.click(screen.getByText("Helinda"));
    expect(onUse).toHaveBeenCalled();
  });

  it("Helinda button is disabled when value is empty", () => {
    render(<CustomVariantForm {...defaultProps} value="  " />);
    expect(screen.getByText("Helinda")).toBeDisabled();
  });

  it("calls onClose when remove link clicked", () => {
    const onClose = vi.fn();
    render(<CustomVariantForm {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Eemalda loodud variant"));
    expect(onClose).toHaveBeenCalled();
  });

  it("play button has correct title based on state", () => {
    const { rerender } = render(<CustomVariantForm {...defaultProps} />);
    expect(screen.getByTitle("Kuula")).toBeInTheDocument();
    rerender(<CustomVariantForm {...defaultProps} isLoading={true} />);
    expect(screen.getByTitle("Laen...")).toBeInTheDocument();
    rerender(<CustomVariantForm {...defaultProps} isPlaying={true} />);
    expect(screen.getByTitle("Mängib")).toBeInTheDocument();
  });

  it("play button has loading class when loading", () => {
    const { container } = render(<CustomVariantForm {...defaultProps} isLoading={true} />);
    const btn = container.querySelector(".button--circular");
    expect(btn?.className).toContain("loading");
  });

  it("play button has playing class when playing", () => {
    const { container } = render(<CustomVariantForm {...defaultProps} isPlaying={true} />);
    const btn = container.querySelector(".button--circular");
    expect(btn?.className).toContain("playing");
  });

  it("renders MarkersGuideBox with correct class", () => {
    render(<CustomVariantForm {...defaultProps} />);
    const guide = screen.getByTestId("markers-guide");
    expect(guide.className).toContain("pronunciation-variants__markers-guide-box");
  });
});
