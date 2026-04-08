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

  describe("onPlay", () => {
    it("calls onPlay with id", async () => {
      const onPlay = vi.fn();
      render(<SentenceSynthesisItem {...bp} onPlay={onPlay} />);
      fireEvent.click(screen.getByRole("button", { name: /play/i }));
      expect(onPlay).toHaveBeenCalledWith("s1");
    });
  });

});
