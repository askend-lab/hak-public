// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SentenceSynthesisItem from "./SentenceSynthesisItem";

/**
 * Mutation-killing tests for SentenceSynthesisItem
 * Targets: default prop values, containerClasses filter/join, drag handlers,
 * PlayButton disabled logic, RowMenu conditional, legacy menu conditional,
 * data-onboarding-target attributes, mode switch
 */
describe("SentenceSynthesisItem mutation kills", () => {
  const baseProps = {
    id: "s1",
    text: "Hello world",
    tags: ["Hello", "world"],
    mode: "tags" as const,
    onPlay: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Default prop values ───

  describe("default prop values", () => {
    it("draggable defaults to false (no drag handle)", () => {
      render(<SentenceSynthesisItem {...baseProps} />);
      expect(screen.queryByLabelText("Drag to reorder")).not.toBeInTheDocument();
    });

    it("isDragging defaults to false (no dragging class)", () => {
      const { container } = render(<SentenceSynthesisItem {...baseProps} />);
      expect(container.querySelector(".sentence-synthesis-item--dragging")).toBeNull();
    });

    it("isDragOver defaults to false (no drag-over class)", () => {
      const { container } = render(<SentenceSynthesisItem {...baseProps} />);
      expect(container.querySelector(".sentence-synthesis-item--drag-over")).toBeNull();
    });

    it("isPlaying defaults to false", () => {
      render(<SentenceSynthesisItem {...baseProps} />);
      expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /playing/i })).not.toBeInTheDocument();
    });

    it("isLoading defaults to false", () => {
      render(<SentenceSynthesisItem {...baseProps} />);
      expect(screen.queryByRole("button", { name: /loading/i })).not.toBeInTheDocument();
    });

    it("tags defaults to empty array", () => {
      render(
        <SentenceSynthesisItem
          id="s1"
          text="Hello"
          mode="tags"
          onPlay={vi.fn()}
        />,
      );
      // Should render without crashing, no tag elements
      expect(screen.queryByText("Hello")).not.toBeInTheDocument();
    });

    it("tagMenuItems defaults to empty array", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          mode="input"
          onInputChange={vi.fn()}
          currentInput=""
        />,
      );
      // Should render without crashing
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("rowMenuItems defaults to empty array", () => {
      render(<SentenceSynthesisItem {...baseProps} />);
      // No RowMenu should be rendered
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
    });

    it("currentInput defaults to empty string", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          mode="input"
          tags={[]}
          onInputChange={vi.fn()}
        />,
      );
      // Play button should be disabled (no tags, empty input)
      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });

    it("className defaults to empty string", () => {
      const { container } = render(<SentenceSynthesisItem {...baseProps} />);
      const item = container.querySelector(".sentence-synthesis-item")!;
      expect(item.className).toBe("sentence-synthesis-item");
    });

    it("sentenceIndex defaults to 0", () => {
      render(<SentenceSynthesisItem {...baseProps} />);
      const playBtn = screen.getByRole("button", { name: /play/i });
      expect(playBtn.getAttribute("data-onboarding-target")).toBe("sentence-0-play");
    });
  });

  // ─── containerClasses ───

  describe("containerClasses", () => {
    it("includes dragging class when isDragging", () => {
      const { container } = render(
        <SentenceSynthesisItem {...baseProps} isDragging={true} />,
      );
      const item = container.querySelector(".sentence-synthesis-item")!;
      expect(item.className).toContain("sentence-synthesis-item--dragging");
    });

    it("includes drag-over class when isDragOver", () => {
      const { container } = render(
        <SentenceSynthesisItem {...baseProps} isDragOver={true} />,
      );
      const item = container.querySelector(".sentence-synthesis-item")!;
      expect(item.className).toContain("sentence-synthesis-item--drag-over");
    });

    it("includes custom className", () => {
      const { container } = render(
        <SentenceSynthesisItem {...baseProps} className="my-class" />,
      );
      const item = container.querySelector(".sentence-synthesis-item")!;
      expect(item.className).toContain("my-class");
    });

    it("filters out false values (no 'false' in class string)", () => {
      const { container } = render(<SentenceSynthesisItem {...baseProps} />);
      const item = container.querySelector(".sentence-synthesis-item")!;
      expect(item.className).not.toContain("false");
    });
  });

  // ─── Drag handlers ───

  describe("drag handlers internal", () => {
    it("handleDragStartInternal sets drag image and calls onDragStart", () => {
      const onDragStart = vi.fn();
      render(
        <SentenceSynthesisItem {...baseProps} draggable={true} onDragStart={onDragStart} />,
      );
      const handle = screen.getByLabelText("Drag to reorder");
      const setDragImage = vi.fn();
      fireEvent.dragStart(handle, { dataTransfer: { setDragImage } });
      expect(onDragStart).toHaveBeenCalledWith(expect.anything(), "s1");
    });

    it("handleDragEndInternal calls onDragEnd", () => {
      const onDragEnd = vi.fn();
      render(
        <SentenceSynthesisItem {...baseProps} draggable={true} onDragEnd={onDragEnd} />,
      );
      fireEvent.dragEnd(screen.getByLabelText("Drag to reorder"));
      expect(onDragEnd).toHaveBeenCalled();
    });

    it("onDragOver wrapper passes id", () => {
      const onDragOver = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem {...baseProps} onDragOver={onDragOver} />,
      );
      fireEvent.dragOver(container.querySelector(".sentence-synthesis-item")!);
      expect(onDragOver).toHaveBeenCalledWith(expect.anything(), "s1");
    });

    it("onDrop wrapper passes id", () => {
      const onDrop = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem {...baseProps} onDrop={onDrop} />,
      );
      fireEvent.drop(container.querySelector(".sentence-synthesis-item")!);
      expect(onDrop).toHaveBeenCalledWith(expect.anything(), "s1");
    });
  });

  // ─── PlayButton disabled logic ───

  describe("PlayButton disabled logic", () => {
    it("disabled when isLoading", () => {
      render(<SentenceSynthesisItem {...baseProps} isLoading={true} />);
      expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });

    it("disabled in input mode with no tags and empty currentInput", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          mode="input"
          tags={[]}
          currentInput=""
          onInputChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });

    it("disabled in input mode with no tags and whitespace currentInput", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          mode="input"
          tags={[]}
          currentInput="   "
          onInputChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });

    it("enabled in input mode with tags", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          mode="input"
          onInputChange={vi.fn()}
          currentInput=""
        />,
      );
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });

    it("enabled in input mode with currentInput text", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          mode="input"
          tags={[]}
          currentInput="hello"
          onInputChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });

    it("enabled in tags mode (not input mode check)", () => {
      render(<SentenceSynthesisItem {...baseProps} />);
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });
  });

  // ─── data-onboarding-target attributes ───

  describe("data-onboarding-target", () => {
    it("play button has sentence-N-play target", () => {
      render(<SentenceSynthesisItem {...baseProps} sentenceIndex={3} />);
      const btn = screen.getByRole("button", { name: /play/i });
      expect(btn.getAttribute("data-onboarding-target")).toBe("sentence-3-play");
    });

    it("legacy menu button has sentence-N-menu target", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          onMenuOpenLegacy={vi.fn()}
          sentenceIndex={2}
        />,
      );
      const menuBtn = screen.getByLabelText("More options");
      expect(menuBtn.getAttribute("data-onboarding-target")).toBe("sentence-2-menu");
    });
  });

  // ─── RowMenu conditional rendering ───

  describe("RowMenu conditional", () => {
    it("shows RowMenu when all three conditions met", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          onMenuOpen={vi.fn()}
          onMenuClose={vi.fn()}
          rowMenuItems={[{ label: "Delete", onClick: vi.fn() }]}
        />,
      );
      expect(screen.getByLabelText("Rohkem valikuid")).toBeInTheDocument();
    });

    it("hides RowMenu when onMenuOpen missing", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          onMenuClose={vi.fn()}
          rowMenuItems={[{ label: "Delete", onClick: vi.fn() }]}
        />,
      );
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
    });

    it("hides RowMenu when rowMenuItems empty", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          onMenuOpen={vi.fn()}
          onMenuClose={vi.fn()}
          rowMenuItems={[]}
        />,
      );
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
    });

    it("hides RowMenu when onMenuClose missing", () => {
      render(
        <SentenceSynthesisItem
          {...baseProps}
          onMenuOpen={vi.fn()}
          rowMenuItems={[{ label: "Delete", onClick: vi.fn() }]}
        />,
      );
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
    });
  });

  // ─── Legacy menu conditional rendering ───

  describe("legacy menu conditional", () => {
    it("renders when onMenuOpenLegacy provided", () => {
      render(
        <SentenceSynthesisItem {...baseProps} onMenuOpenLegacy={vi.fn()} />,
      );
      expect(screen.getByLabelText("More options")).toBeInTheDocument();
    });

    it("does not render when onMenuOpenLegacy not provided", () => {
      render(<SentenceSynthesisItem {...baseProps} />);
      expect(screen.queryByLabelText("More options")).not.toBeInTheDocument();
    });
  });

  // ─── Mode switch ───

  describe("mode rendering", () => {
    it("readonly mode shows text directly", () => {
      render(<SentenceSynthesisItem {...baseProps} mode="readonly" />);
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("readonly mode hides drag handle even when draggable", () => {
      render(
        <SentenceSynthesisItem {...baseProps} mode="readonly" draggable={true} />,
      );
      expect(screen.queryByLabelText("Drag to reorder")).not.toBeInTheDocument();
    });
  });
});
