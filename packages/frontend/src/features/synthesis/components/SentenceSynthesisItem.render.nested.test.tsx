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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
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

  });

  });

  });

  });

  });

});
