// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

});
