// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SentencePhoneticPanel from "./SentencePhoneticPanel";

vi.mock("@/features/synthesis/utils/phoneticMarkers", () => ({
  transformToUI: (text: string | null) =>
    text?.replace(/</, "`").replace(/\?/, "´") ?? null,
  transformToVabamorf: (text: string | null) =>
    text?.replace(/`/, "<").replace(/´/, "?") ?? null,
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
  synthesizeAuto: vi.fn().mockResolvedValue("mock-audio-url"),
}));

describe("SentencePhoneticPanel", () => {
  const defaultProps = {
    sentenceText: "Hello world",
    phoneticText: "H`ello w`orld",
    isOpen: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Audio
    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => {
        setTimeout(() => this.onended?.(), 10);
        return Promise.resolve();
      });
    }
    global.Audio = MockAudio as unknown as typeof Audio;

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("markers guide box", () => {
    it("shows markers guide box with title", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByText("Hääldusmärgid")).toBeInTheDocument();
    });

    it("shows intro text in guide box", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(
        screen.getByText(
          "Kasuta märke häälduse täpsustamiseks. Klõpsa märgil selle lisamiseks või hõlju kohal juhiste nägemiseks.",
        ),
      ).toBeInTheDocument();
    });

    it("shows info button to open full guide", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(
        screen.getByLabelText("Ava hääldusmärkide juhend"),
      ).toBeInTheDocument();
    });

    it("shows guide view when info button clicked", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);

      await user.click(screen.getByLabelText("Ava hääldusmärkide juhend"));
      expect(screen.getByText("Hääldusmärkide juhend")).toBeInTheDocument();
    });

    it("shows marker documentation in guide", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);

      await user.click(screen.getByLabelText("Ava hääldusmärkide juhend"));
      // The guide view shows detailed marker info
      expect(
        screen.getByText(/Hääldusmärgid aitavad täpsustada/),
      ).toBeInTheDocument();
    });

    it("returns to edit view when back button clicked", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);

      await user.click(screen.getByLabelText("Ava hääldusmärkide juhend"));
      expect(screen.getByText("Hääldusmärkide juhend")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Tagasi"));
      expect(
        screen.queryByRole("heading", { name: "Hääldusmärkide juhend" }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Kuula")).toBeInTheDocument();
    });
  });

  });

  });

  });

  });

  });

});
