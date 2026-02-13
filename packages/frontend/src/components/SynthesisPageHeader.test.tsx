// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SynthesisPageHeader from "./SynthesisPageHeader";

vi.mock("./AddToTaskDropdown", () => ({
  default: ({ isOpen, onClose, onSelectTask, onCreateNew }: { isOpen: boolean; onClose: () => void; onSelectTask: (id: string, name: string, mode: string) => void; onCreateNew: () => void }) =>
    isOpen ? (
      <div data-testid="dropdown">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSelectTask("t1", "Task 1", "append")}>Select</button>
        <button onClick={onCreateNew}>Create</button>
      </div>
    ) : null,
}));

vi.mock("./ui/PlayAllButton", () => ({
  PlayAllButton: ({ isPlaying, isLoading, onClick }: { isPlaying: boolean; isLoading: boolean; onClick: () => void }) => (
    <button data-testid="play-all" onClick={onClick}>
      {isLoading ? "Loading" : isPlaying ? "Playing" : "Play All"}
    </button>
  ),
}));

const defaultProps = {
  sentenceCount: 2,
  isPlayingAll: false,
  isLoadingPlayAll: false,
  onAddAllClick: vi.fn(),
  onPlayAllClick: vi.fn(),
  showDropdown: false,
  onDropdownClose: vi.fn(),
  onSelectTask: vi.fn(),
  onCreateNew: vi.fn(),
};

describe("SynthesisPageHeader", () => {
  it("renders title and description", () => {
    render(<SynthesisPageHeader {...defaultProps} />);
    expect(screen.getByText("Muuda tekst kõneks")).toBeInTheDocument();
    expect(screen.getByText(/Sisesta lause/)).toBeInTheDocument();
  });

  it("shows add to task button with sentence count", () => {
    render(<SynthesisPageHeader {...defaultProps} />);
    expect(screen.getByText(/Lisa ülesandesse \(2\)/)).toBeInTheDocument();
  });

  it("hides add button when sentenceCount is 0", () => {
    render(<SynthesisPageHeader {...defaultProps} sentenceCount={0} />);
    expect(screen.queryByText(/Lisa ülesandesse/)).not.toBeInTheDocument();
  });

  it("shows play all button when sentenceCount > 1", () => {
    render(<SynthesisPageHeader {...defaultProps} sentenceCount={2} />);
    expect(screen.getByTestId("play-all")).toBeInTheDocument();
  });

  it("hides play all button when sentenceCount is 1", () => {
    render(<SynthesisPageHeader {...defaultProps} sentenceCount={1} />);
    expect(screen.queryByTestId("play-all")).not.toBeInTheDocument();
  });

  it("calls onAddAllClick when add button clicked", () => {
    const onAddAllClick = vi.fn();
    render(<SynthesisPageHeader {...defaultProps} onAddAllClick={onAddAllClick} />);
    fireEvent.click(screen.getByText(/Lisa ülesandesse/));
    expect(onAddAllClick).toHaveBeenCalled();
  });

  it("calls onPlayAllClick when play all clicked", () => {
    const onPlayAllClick = vi.fn();
    render(<SynthesisPageHeader {...defaultProps} onPlayAllClick={onPlayAllClick} />);
    fireEvent.click(screen.getByTestId("play-all"));
    expect(onPlayAllClick).toHaveBeenCalled();
  });

  it("shows dropdown when showDropdown is true", () => {
    render(<SynthesisPageHeader {...defaultProps} showDropdown={true} />);
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
  });

  it("hides dropdown when showDropdown is false", () => {
    render(<SynthesisPageHeader {...defaultProps} showDropdown={false} />);
    expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
  });

  it("has correct page header classes", () => {
    const { container } = render(<SynthesisPageHeader {...defaultProps} />);
    expect(container.querySelector(".page-header--full")).toBeTruthy();
    expect(container.querySelector(".page-header__content")).toBeTruthy();
    expect(container.querySelector(".page-header__actions")).toBeTruthy();
  });

  it("add button has button--secondary class", () => {
    render(<SynthesisPageHeader {...defaultProps} />);
    const btn = screen.getByText(/Lisa ülesandesse/).closest("button");
    expect(btn?.className).toContain("button--secondary");
  });

  it("add button has data-onboarding-target", () => {
    render(<SynthesisPageHeader {...defaultProps} />);
    const btn = screen.getByText(/Lisa ülesandesse/).closest("button");
    expect(btn?.getAttribute("data-onboarding-target")).toBe("save-to-task-button");
  });

  it("title is h1 with correct class", () => {
    const { container } = render(<SynthesisPageHeader {...defaultProps} />);
    const h1 = container.querySelector("h1.page-header__title");
    expect(h1?.textContent).toBe("Muuda tekst kõneks");
  });

  it("description has correct class", () => {
    const { container } = render(<SynthesisPageHeader {...defaultProps} />);
    expect(container.querySelector("p.page-header__description")).toBeTruthy();
  });
});
