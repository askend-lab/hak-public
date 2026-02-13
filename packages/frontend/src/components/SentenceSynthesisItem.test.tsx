// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SentenceSynthesisItem from "./SentenceSynthesisItem";

describe("SentenceSynthesisItem", () => {
  const defaultProps = {
    id: "test-sentence",
    text: "Hello world test",
    tags: ["Hello", "world", "test"],
    mode: "tags" as const,
    onPlay: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering modes", () => {
    it("renders tags in tags mode", () => {
      render(<SentenceSynthesisItem {...defaultProps} mode="tags" />);
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("world")).toBeInTheDocument();
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("renders text in readonly mode", () => {
      render(<SentenceSynthesisItem {...defaultProps} mode="readonly" />);
      expect(screen.getByText("Hello world test")).toBeInTheDocument();
    });

    it("renders input field in input mode", () => {
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={onInputChange}
          currentInput=""
        />,
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("shows placeholder when no tags in input mode", () => {
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          tags={[]}
          onInputChange={onInputChange}
          currentInput=""
          placeholder="Enter text here"
        />,
      );
      expect(
        screen.getByPlaceholderText("Enter text here"),
      ).toBeInTheDocument();
    });
  });

  describe("play button", () => {
    it("renders play button", () => {
      render(<SentenceSynthesisItem {...defaultProps} />);
      expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    });

    it("calls onPlay when clicked", async () => {
      const user = userEvent.setup();
      render(<SentenceSynthesisItem {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /play/i }));
      expect(defaultProps.onPlay).toHaveBeenCalledWith("test-sentence");
    });

    it("shows loading state", () => {
      render(<SentenceSynthesisItem {...defaultProps} isLoading={true} />);
      expect(
        screen.getByRole("button", { name: /loading/i }),
      ).toBeInTheDocument();
    });

    it("shows playing state", () => {
      render(<SentenceSynthesisItem {...defaultProps} isPlaying={true} />);
      expect(
        screen.getByRole("button", { name: /playing/i }),
      ).toBeInTheDocument();
    });

    it("disables play button when loading", () => {
      render(<SentenceSynthesisItem {...defaultProps} isLoading={true} />);
      expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });

    it("disables play button in input mode with no tags and empty input", () => {
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          tags={[]}
          onInputChange={onInputChange}
          currentInput=""
        />,
      );
      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });

    it("enables play button in input mode with tags", () => {
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={onInputChange}
          currentInput=""
        />,
      );
      expect(screen.getByRole("button", { name: /play/i })).not.toBeDisabled();
    });
  });

  describe("drag and drop", () => {
    it("shows drag handle when draggable", () => {
      render(<SentenceSynthesisItem {...defaultProps} draggable={true} />);
      expect(screen.getByLabelText("Lohista järjestamiseks")).toBeInTheDocument();
    });

    it("does not show drag handle when not draggable", () => {
      render(<SentenceSynthesisItem {...defaultProps} draggable={false} />);
      expect(
        screen.queryByLabelText("Lohista järjestamiseks"),
      ).not.toBeInTheDocument();
    });

    it("does not show drag handle in readonly mode", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="readonly"
          draggable={true}
        />,
      );
      expect(
        screen.queryByLabelText("Lohista järjestamiseks"),
      ).not.toBeInTheDocument();
    });

    it("applies dragging class", () => {
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} isDragging={true} />,
      );
      expect(
        container.querySelector(".sentence-synthesis-item--dragging"),
      ).toBeInTheDocument();
    });

    it("applies drag-over class", () => {
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} isDragOver={true} />,
      );
      expect(
        container.querySelector(".sentence-synthesis-item--drag-over"),
      ).toBeInTheDocument();
    });
  });

  describe("tag interactions in tags mode", () => {
    it("makes tags clickable when onTagClick provided", () => {
      const onTagClick = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} onTagClick={onTagClick} />,
      );
      expect(
        container.querySelectorAll(".sentence-synthesis-item__tag--clickable")
          .length,
      ).toBe(3);
    });

    it("calls onTagClick when tag clicked", async () => {
      const user = userEvent.setup();
      const onTagClick = vi.fn();
      render(
        <SentenceSynthesisItem {...defaultProps} onTagClick={onTagClick} />,
      );

      await user.click(screen.getByText("world"));
      expect(onTagClick).toHaveBeenCalledWith("test-sentence", 1, "world");
    });

    it("highlights selected tag when panel open", () => {
      const onTagClick = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem
          {...defaultProps}
          onTagClick={onTagClick}
          selectedTagIndex={1}
          isPronunciationPanelOpen={true}
        />,
      );
      expect(
        container.querySelector(".sentence-synthesis-item__tag--selected"),
      ).toBeInTheDocument();
    });

    it("handles keyboard navigation on tags", () => {
      const onTagClick = vi.fn();
      render(
        <SentenceSynthesisItem {...defaultProps} onTagClick={onTagClick} />,
      );

      const tag = screen.getByText("Hello");
      fireEvent.keyDown(tag, { key: "Enter" });
      expect(onTagClick).toHaveBeenCalledWith("test-sentence", 0, "Hello");
    });
  });

  describe("input mode features", () => {
    it("calls onInputChange when typing", async () => {
      const user = userEvent.setup();
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          tags={[]}
          onInputChange={onInputChange}
          currentInput=""
        />,
      );

      await user.type(screen.getByRole("textbox"), "test");
      expect(onInputChange).toHaveBeenCalled();
    });

    it("shows clear button when has content", () => {
      const onClear = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={vi.fn()}
          onClear={onClear}
          currentInput="test"
        />,
      );
      expect(screen.getByLabelText("Tühjenda kõik")).toBeInTheDocument();
    });

    it("calls onClear when clear button clicked", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={vi.fn()}
          onClear={onClear}
          currentInput="test"
        />,
      );

      await user.click(screen.getByLabelText("Tühjenda kõik"));
      expect(onClear).toHaveBeenCalledWith("test-sentence");
    });

    it("shows tag dropdown menu when tag menu open", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={vi.fn()}
          onTagMenuOpen={vi.fn()}
          onTagMenuClose={vi.fn()}
          openTagMenu={{ sentenceId: "test-sentence", tagIndex: 0 }}
          tagMenuItems={[
            { label: "Edit", onClick: vi.fn() },
            { label: "Delete", onClick: vi.fn(), danger: true },
          ]}
        />,
      );
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("shows inline edit input when editing tag", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={vi.fn()}
          editingTag={{
            sentenceId: "test-sentence",
            tagIndex: 0,
            value: "Hello",
          }}
          onEditTagChange={vi.fn()}
          onEditTagKeyDown={vi.fn()}
          onEditTagCommit={vi.fn()}
        />,
      );
      const inputs = screen.getAllByRole("textbox");
      expect(
        inputs.some((input) => (input as HTMLInputElement).value === "Hello"),
      ).toBe(true);
    });
  });

  describe("row menu", () => {
    it("shows menu button when onMenuOpen provided", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          onMenuOpen={vi.fn()}
          onMenuClose={vi.fn()}
          rowMenuItems={[{ label: "Delete", onClick: vi.fn() }]}
        />,
      );
      expect(screen.getByLabelText("Rohkem valikuid")).toBeInTheDocument();
    });

    it("calls onMenuOpen when menu button clicked", async () => {
      const user = userEvent.setup();
      const onMenuOpen = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          onMenuOpen={onMenuOpen}
          onMenuClose={vi.fn()}
          rowMenuItems={[{ label: "Delete", onClick: vi.fn() }]}
        />,
      );

      await user.click(screen.getByLabelText("Rohkem valikuid"));
      expect(onMenuOpen).toHaveBeenCalledWith("test-sentence");
    });
  });

  describe("legacy menu", () => {
    it("shows legacy menu button when onMenuOpenLegacy provided", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          onMenuOpenLegacy={vi.fn()}
          menuContent={<div>Menu Content</div>}
        />,
      );
      expect(screen.getByLabelText("Rohkem valikuid")).toBeInTheDocument();
    });

    it("renders menu content", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          onMenuOpenLegacy={vi.fn()}
          menuContent={<div data-testid="custom-menu">Custom Menu</div>}
        />,
      );
      expect(screen.getByTestId("custom-menu")).toBeInTheDocument();
    });
  });

  describe("custom className", () => {
    it("applies custom className", () => {
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} className="custom-class" />,
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("drag handle", () => {
    it("renders drag handle when draggable", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          draggable={true}
          mode="input"
        />,
      );
      expect(screen.getByLabelText("Lohista järjestamiseks")).toBeInTheDocument();
    });

    it("does not render drag handle in readonly mode", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          draggable={true}
          mode="readonly"
        />,
      );
      expect(
        screen.queryByLabelText("Lohista järjestamiseks"),
      ).not.toBeInTheDocument();
    });
  });

  describe("tag click", () => {
    it("calls onTagClick when tag clicked", async () => {
      const user = userEvent.setup();
      const onTagClick = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="tags"
          onTagClick={onTagClick}
        />,
      );

      await user.click(screen.getByText("Hello"));
      expect(onTagClick).toHaveBeenCalledWith("test-sentence", 0, "Hello");
    });

    it("tags are not clickable without onTagClick", () => {
      render(<SentenceSynthesisItem {...defaultProps} mode="tags" />);
      const tag = screen.getByText("Hello");
      expect(tag).not.toHaveAttribute("role", "button");
    });
  });

  describe("input mode interactions", () => {
    it("calls onInputChange when typing", async () => {
      const user = userEvent.setup();
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={onInputChange}
          currentInput=""
        />,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "a");
      expect(onInputChange).toHaveBeenCalled();
    });

    it("calls onInputKeyDown on key press", async () => {
      const onInputKeyDown = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={vi.fn()}
          onInputKeyDown={onInputKeyDown}
          currentInput=""
        />,
      );

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(onInputKeyDown).toHaveBeenCalled();
    });

    it("calls onInputBlur on blur", () => {
      const onInputBlur = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          onInputChange={vi.fn()}
          onInputBlur={onInputBlur}
          currentInput=""
        />,
      );

      const input = screen.getByRole("textbox");
      fireEvent.blur(input);
      expect(onInputBlur).toHaveBeenCalledWith("test-sentence");
    });
  });

  describe("drag start and end internal handlers", () => {
    it("calls onDragStart with id on drag start", () => {
      const onDragStart = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          draggable={true}
          onDragStart={onDragStart}
        />,
      );
      const handle = screen.getByLabelText("Lohista järjestamiseks");
      const mockDataTransfer = { setDragImage: vi.fn() };
      fireEvent.dragStart(handle, { dataTransfer: mockDataTransfer });
      expect(onDragStart).toHaveBeenCalledWith(
        expect.anything(),
        "test-sentence",
      );
    });

    it("calls onDragEnd on drag end", () => {
      const onDragEnd = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          draggable={true}
          onDragEnd={onDragEnd}
        />,
      );
      const handle = screen.getByLabelText("Lohista järjestamiseks");
      fireEvent.dragEnd(handle);
      expect(onDragEnd).toHaveBeenCalled();
    });

    it("calls onDragOver on container dragover", () => {
      const onDragOver = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} onDragOver={onDragOver} />,
      );
      const item = container.querySelector(".sentence-synthesis-item")!;
      fireEvent.dragOver(item);
      expect(onDragOver).toHaveBeenCalledWith(
        expect.anything(),
        "test-sentence",
      );
    });

    it("calls onDragLeave on container dragleave", () => {
      const onDragLeave = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} onDragLeave={onDragLeave} />,
      );
      const item = container.querySelector(".sentence-synthesis-item")!;
      fireEvent.dragLeave(item);
      expect(onDragLeave).toHaveBeenCalled();
    });

    it("calls onDrop on container drop", () => {
      const onDrop = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} onDrop={onDrop} />,
      );
      const item = container.querySelector(".sentence-synthesis-item")!;
      fireEvent.drop(item);
      expect(onDrop).toHaveBeenCalledWith(expect.anything(), "test-sentence");
    });
  });

  describe("legacy menu click handler", () => {
    it("calls onMenuOpenLegacy with event and id", async () => {
      const user = userEvent.setup();
      const onMenuOpenLegacy = vi.fn();
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          onMenuOpenLegacy={onMenuOpenLegacy}
        />,
      );
      await user.click(screen.getByLabelText("Rohkem valikuid"));
      expect(onMenuOpenLegacy).toHaveBeenCalledWith(
        expect.anything(),
        "test-sentence",
      );
    });
  });

  describe("row menu open state", () => {
    it("shows open menu when openMenuId matches", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          openMenuId="test-sentence"
          onMenuOpen={vi.fn()}
          onMenuClose={vi.fn()}
          rowMenuItems={[{ label: "Delete", onClick: vi.fn(), danger: true }]}
        />,
      );
      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("does not show menu when openMenuId does not match", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          openMenuId="other-id"
          onMenuOpen={vi.fn()}
          onMenuClose={vi.fn()}
          rowMenuItems={[{ label: "Delete", onClick: vi.fn() }]}
        />,
      );
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("play button disabled states", () => {
    it("disables play when loading", () => {
      render(<SentenceSynthesisItem {...defaultProps} isLoading={true} />);
      expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });

    it("disables play in input mode with no tags and empty input", () => {
      render(
        <SentenceSynthesisItem
          {...defaultProps}
          mode="input"
          tags={[]}
          currentInput=""
          onInputChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });
  });
});

// --- Merged from SentenceSynthesisItem.mutations.test.tsx ---
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
      expect(screen.queryByLabelText("Lohista järjestamiseks")).not.toBeInTheDocument();
    });
  });

  // --- Drag handlers (kills setDragImage, opacity, setTimeout, conditional) ---
  describe("drag handlers", () => {
    it("handleDragStartInternal calls setDragImage with offsetHeight/2", () => {
      vi.useFakeTimers();
      render(<SentenceSynthesisItem {...bp} draggable={true} onDragStart={vi.fn()} />);
      const handle = screen.getByLabelText("Lohista järjestamiseks");
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
      const handle = screen.getByLabelText("Lohista järjestamiseks");
      const container = handle.closest(".sentence-synthesis-item") as HTMLDivElement;
      container.style.opacity = "0.5";
      fireEvent.dragEnd(handle);
      expect(container.style.opacity).toBe("1");
    });

    it("calls onDragStart with id", () => {
      const onDragStart = vi.fn();
      render(<SentenceSynthesisItem {...bp} draggable={true} onDragStart={onDragStart} />);
      fireEvent.dragStart(screen.getByLabelText("Lohista järjestamiseks"), {
        dataTransfer: { setDragImage: vi.fn() },
      });
      expect(onDragStart).toHaveBeenCalledWith(expect.anything(), "s1");
    });

    it("calls onDragEnd", () => {
      const onDragEnd = vi.fn();
      render(<SentenceSynthesisItem {...bp} draggable={true} onDragEnd={onDragEnd} />);
      fireEvent.dragEnd(screen.getByLabelText("Lohista järjestamiseks"));
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
      expect(screen.queryByLabelText("Lohista järjestamiseks")).not.toBeInTheDocument();
    });
    it("dragStart works without onDragStart (kills L148 true)", () => {
      render(<SentenceSynthesisItem {...bp} draggable={true} />);
      const handle = screen.getByLabelText("Lohista järjestamiseks");
      const cont = handle.closest(".sentence-synthesis-item") as HTMLDivElement;
      Object.defineProperty(cont, "offsetHeight", { value: 40, configurable: true });
      fireEvent.dragStart(handle, { dataTransfer: { setDragImage: vi.fn() } });
    });
    it("dragEnd works without onDragEnd (kills L157 true)", () => {
      render(<SentenceSynthesisItem {...bp} draggable={true} />);
      fireEvent.dragEnd(screen.getByLabelText("Lohista järjestamiseks"));
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
        screen.getByLabelText("Rohkem valikuid").getAttribute("data-onboarding-target"),
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
      expect(screen.getByLabelText("Rohkem valikuid")).toBeInTheDocument();
    });
    it("not rendered without onMenuOpenLegacy", () => {
      render(<SentenceSynthesisItem {...bp} />);
      expect(screen.queryByLabelText("Rohkem valikuid")).not.toBeInTheDocument();
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
