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

});
