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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
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

  });

  });

  });

  });

  });

});
