// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SentenceSynthesisItem from "./SentenceSynthesisItem";

describe("SentenceSynthesisItem mutation kills", () => {
  const bp = {
    id: "s1",
    text: "Hello world",
    tags: ["Hello", "world"],
    mode: "tags" as const,
    onPlay: vi.fn(),
  };
  beforeEach(() => { vi.clearAllMocks(); });

  // --- Default prop values (kills ArrayDeclaration mutations) ---
  describe("defaults", () => {
    it("tags defaults to empty array (no tags rendered)", () => {
      const { container } = render(<SentenceSynthesisItem id="s1" text="t" mode="tags" onPlay={vi.fn()} />);
      const tagsWrap = container.querySelector(".sentence-synthesis-item__tags");
      expect(tagsWrap?.children.length ?? 0).toBe(0);
    });
    it("tagMenuItems defaults to empty (no menu items crash)", () => {
      render(
        <SentenceSynthesisItem {...bp} mode="input" onInputChange={vi.fn()} currentInput="" />,
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
    it("rowMenuItems defaults to empty (no RowMenu)", () => {
      render(<SentenceSynthesisItem {...bp} onMenuOpen={vi.fn()} onMenuClose={vi.fn()} />);
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
    });
    it("className defaults to empty string", () => {
      const { container } = render(<SentenceSynthesisItem {...bp} />);
      expect(container.querySelector(".sentence-synthesis-item")!.className).toBe(
        "sentence-synthesis-item",
      );
    });
    it("sentenceIndex defaults to 0", () => {
      render(<SentenceSynthesisItem {...bp} />);
      expect(
        screen.getByRole("button", { name: /play/i }).getAttribute("data-onboarding-target"),
      ).toBe("sentence-0-play");
    });
    it("isDragging defaults to false", () => {
      const { container } = render(<SentenceSynthesisItem {...bp} />);
      expect(container.querySelector(".sentence-synthesis-item--dragging")).toBeNull();
    });
    it("isDragOver defaults to false", () => {
      const { container } = render(<SentenceSynthesisItem {...bp} />);
      expect(container.querySelector(".sentence-synthesis-item--drag-over")).toBeNull();
    });
    it("isPlaying defaults to false", () => {
      render(<SentenceSynthesisItem {...bp} />);
      expect(screen.queryByRole("button", { name: /playing/i })).not.toBeInTheDocument();
    });
    it("isLoading defaults to false", () => {
      render(<SentenceSynthesisItem {...bp} />);
      expect(screen.queryByRole("button", { name: /loading/i })).not.toBeInTheDocument();
    });
    it("currentInput defaults to empty (play disabled with no tags)", () => {
      render(
        <SentenceSynthesisItem {...bp} mode="input" tags={[]} onInputChange={vi.fn()} />,
      );
      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });
    it("draggable defaults to false", () => {
      render(<SentenceSynthesisItem {...bp} />);
      expect(screen.queryByLabelText("Drag to reorder")).not.toBeInTheDocument();
    });
  });

  // --- Drag handlers (kills setDragImage, opacity, setTimeout, conditional) ---
  describe("drag handlers", () => {
    it("handleDragStartInternal calls setDragImage with offsetHeight/2", () => {
      vi.useFakeTimers();
      render(<SentenceSynthesisItem {...bp} draggable={true} onDragStart={vi.fn()} />);
      const handle = screen.getByLabelText("Drag to reorder");
      // The container div is the parent with ref
      const container = handle.closest(".sentence-synthesis-item") as HTMLDivElement;
      Object.defineProperty(container, "offsetHeight", { value: 40, configurable: true });

      const setDragImage = vi.fn();
      fireEvent.dragStart(handle, { dataTransfer: { setDragImage } });
      expect(setDragImage).toHaveBeenCalledWith(container, 20, 20); // 40/2=20

      // setTimeout sets opacity to 0.5
      vi.advanceTimersByTime(10);
      expect(container.style.opacity).toBe("0.5");
      vi.useRealTimers();
    });

    it("handleDragEndInternal resets opacity to '1'", () => {
      render(
        <SentenceSynthesisItem {...bp} draggable={true} onDragEnd={vi.fn()} />,
      );
      const handle = screen.getByLabelText("Drag to reorder");
      const container = handle.closest(".sentence-synthesis-item") as HTMLDivElement;
      container.style.opacity = "0.5";
      fireEvent.dragEnd(handle);
      expect(container.style.opacity).toBe("1");
    });

    it("calls onDragStart with id", () => {
      const onDragStart = vi.fn();
      render(<SentenceSynthesisItem {...bp} draggable={true} onDragStart={onDragStart} />);
      fireEvent.dragStart(screen.getByLabelText("Drag to reorder"), {
        dataTransfer: { setDragImage: vi.fn() },
      });
      expect(onDragStart).toHaveBeenCalledWith(expect.anything(), "s1");
    });

    it("calls onDragEnd", () => {
      const onDragEnd = vi.fn();
      render(<SentenceSynthesisItem {...bp} draggable={true} onDragEnd={onDragEnd} />);
      fireEvent.dragEnd(screen.getByLabelText("Drag to reorder"));
      expect(onDragEnd).toHaveBeenCalled();
    });

    it("onDragOver passes id", () => {
      const onDragOver = vi.fn();
      const { container } = render(<SentenceSynthesisItem {...bp} onDragOver={onDragOver} />);
      fireEvent.dragOver(container.querySelector(".sentence-synthesis-item")!);
      expect(onDragOver).toHaveBeenCalledWith(expect.anything(), "s1");
    });

    it("onDrop passes id", () => {
      const onDrop = vi.fn();
      const { container } = render(<SentenceSynthesisItem {...bp} onDrop={onDrop} />);
      fireEvent.drop(container.querySelector(".sentence-synthesis-item")!);
      expect(onDrop).toHaveBeenCalledWith(expect.anything(), "s1");
    });

    it("no drag handle in readonly mode even with draggable", () => {
      render(<SentenceSynthesisItem {...bp} mode="readonly" draggable={true} />);
      expect(screen.queryByLabelText("Drag to reorder")).not.toBeInTheDocument();
    });
    it("dragStart works without onDragStart (kills L148 true)", () => {
      render(<SentenceSynthesisItem {...bp} draggable={true} />);
      const handle = screen.getByLabelText("Drag to reorder");
      const cont = handle.closest(".sentence-synthesis-item") as HTMLDivElement;
      Object.defineProperty(cont, "offsetHeight", { value: 40, configurable: true });
      fireEvent.dragStart(handle, { dataTransfer: { setDragImage: vi.fn() } });
    });
    it("dragEnd works without onDragEnd (kills L157 true)", () => {
      render(<SentenceSynthesisItem {...bp} draggable={true} />);
      fireEvent.dragEnd(screen.getByLabelText("Drag to reorder"));
    });
  });

  // --- containerClasses ---
  describe("containerClasses", () => {
    it("joins dragging + dragOver + custom", () => {
      const { container } = render(
        <SentenceSynthesisItem {...bp} isDragging isDragOver className="custom" />,
      );
      const cls = container.querySelector(".sentence-synthesis-item")!.className;
      expect(cls).toContain("sentence-synthesis-item--dragging");
      expect(cls).toContain("sentence-synthesis-item--drag-over");
      expect(cls).toContain("custom");
      expect(cls).not.toContain("false");
    });
  });

  // --- PlayButton disabled logic ---
  describe("PlayButton disabled", () => {
    it("disabled when isLoading", () => {
      render(<SentenceSynthesisItem {...bp} isLoading />);
      expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });
    it("disabled in input mode no tags empty input", () => {
      render(
        <SentenceSynthesisItem {...bp} mode="input" tags={[]} currentInput="" onInputChange={vi.fn()} />,
      );
      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });
    it("disabled in input mode no tags whitespace input", () => {
      render(
        <SentenceSynthesisItem {...bp} mode="input" tags={[]} currentInput="   " onInputChange={vi.fn()} />,
      );
      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });
    it("enabled in input mode with tags", () => {
      render(
        <SentenceSynthesisItem {...bp} mode="input" currentInput="" onInputChange={vi.fn()} />,
      );
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });
    it("enabled in input mode with currentInput text", () => {
      render(
        <SentenceSynthesisItem {...bp} mode="input" tags={[]} currentInput="hi" onInputChange={vi.fn()} />,
      );
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });
    it("enabled in tags mode", () => {
      render(<SentenceSynthesisItem {...bp} />);
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });
    it("enabled in tags mode even with empty tags (kills L246 mode===input→true)", () => {
      render(<SentenceSynthesisItem {...bp} mode="tags" tags={[]} />);
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });
    it("enabled in readonly mode", () => {
      render(<SentenceSynthesisItem {...bp} mode="readonly" />);
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });
    it("enabled in readonly mode with empty tags (kills L246 mode===input→true)", () => {
      render(<SentenceSynthesisItem {...bp} mode="readonly" tags={[]} />);
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });
  });

  // --- data-onboarding-target ---
  describe("data-onboarding-target", () => {
    it("play button target uses sentenceIndex", () => {
      render(<SentenceSynthesisItem {...bp} sentenceIndex={5} />);
      expect(
        screen.getByRole("button", { name: /play/i }).getAttribute("data-onboarding-target"),
      ).toBe("sentence-5-play");
    });
    it("legacy menu button target", () => {
      render(<SentenceSynthesisItem {...bp} onMenuOpenLegacy={vi.fn()} sentenceIndex={3} />);
      expect(
        screen.getByLabelText("More options").getAttribute("data-onboarding-target"),
      ).toBe("sentence-3-menu");
    });
  });

  // --- RowMenu conditional (3 conditions: onMenuOpen && rowMenuItems.length > 0 && onMenuClose) ---
  describe("RowMenu conditional", () => {
    it("shows when all 3 conditions met", () => {
      render(
        <SentenceSynthesisItem {...bp}
          onMenuOpen={vi.fn()} onMenuClose={vi.fn()}
          rowMenuItems={[{ label: "X", onClick: vi.fn() }]}
        />,
      );
      expect(screen.getByLabelText("Rohkem valikuid")).toBeInTheDocument();
    });
    it("hidden without onMenuOpen", () => {
      render(
        <SentenceSynthesisItem {...bp}
          onMenuClose={vi.fn()} rowMenuItems={[{ label: "X", onClick: vi.fn() }]}
        />,
      );
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
    });
    it("hidden with empty rowMenuItems", () => {
      render(
        <SentenceSynthesisItem {...bp}
          onMenuOpen={vi.fn()} onMenuClose={vi.fn()} rowMenuItems={[]}
        />,
      );
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
    });
    it("hidden without onMenuClose", () => {
      render(
        <SentenceSynthesisItem {...bp}
          onMenuOpen={vi.fn()} rowMenuItems={[{ label: "X", onClick: vi.fn() }]}
        />,
      );
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
    });
  });

  // --- Legacy menu ---
  describe("legacy menu", () => {
    it("renders when onMenuOpenLegacy provided", () => {
      render(<SentenceSynthesisItem {...bp} onMenuOpenLegacy={vi.fn()} />);
      expect(screen.getByLabelText("More options")).toBeInTheDocument();
    });
    it("not rendered without onMenuOpenLegacy", () => {
      render(<SentenceSynthesisItem {...bp} />);
      expect(screen.queryByLabelText("More options")).not.toBeInTheDocument();
    });
  });

  // --- Mode rendering ---
  describe("modes", () => {
    it("readonly shows text", () => {
      render(<SentenceSynthesisItem {...bp} mode="readonly" />);
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });
    it("tags shows tag elements", () => {
      render(<SentenceSynthesisItem {...bp} mode="tags" />);
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("world")).toBeInTheDocument();
    });
    it("input shows textbox", () => {
      render(
        <SentenceSynthesisItem {...bp} mode="input" onInputChange={vi.fn()} currentInput="" />,
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  // --- onPlay ---
  describe("onPlay", () => {
    it("calls onPlay with id", async () => {
      const onPlay = vi.fn();
      render(<SentenceSynthesisItem {...bp} onPlay={onPlay} />);
      fireEvent.click(screen.getByRole("button", { name: /play/i }));
      expect(onPlay).toHaveBeenCalledWith("s1");
    });
  });
});
