// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
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

  });

  });

  });

  });

  });

});
