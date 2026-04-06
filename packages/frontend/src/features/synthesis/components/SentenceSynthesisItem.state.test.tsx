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

});
