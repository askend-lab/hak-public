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

});
