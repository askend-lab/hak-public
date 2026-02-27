// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
