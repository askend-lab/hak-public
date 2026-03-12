// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PronunciationVariants from "./PronunciationVariants";

vi.mock("@/features/synthesis/utils/phoneticMarkers", () => ({
  transformToUI: (text: string | null) =>
    text?.replace(/</, "`").replace(/\?/, "´") ?? null,
  transformToVabamorf: (text: string | null) =>
    text?.replace(/`/, "<").replace(/´/, "?") ?? null,
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
  synthesizeAuto: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
}));

describe("PronunciationVariants", () => {
  const defaultProps = {
    word: "test",
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

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

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  describe("markers guide box", () => {
    it("shows markers guide box in custom variant form", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            variants: [{ text: "test", description: "Normal" }],
          }),
      });

      render(<PronunciationVariants {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Loo oma variant")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Loo oma variant"));

      expect(screen.getByText("Hääldusmärgid")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Kasuta märke häälduse täpsustamiseks. Klõpsa märgil selle lisamiseks või hõlju kohal juhiste nägemiseks.",
        ),
      ).toBeInTheDocument();
    });

    it("opens guide view when info button clicked", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            variants: [{ text: "test", description: "Normal" }],
          }),
      });

      render(<PronunciationVariants {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Loo oma variant")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Loo oma variant"));
      await user.click(screen.getByLabelText("Ava hääldusmärkide juhend"));

      expect(screen.getByText("Hääldusmärkide juhend")).toBeInTheDocument();
    });

    it("closes guide view when back button clicked", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            variants: [{ text: "test", description: "Normal" }],
          }),
      });

      render(<PronunciationVariants {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Loo oma variant")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Loo oma variant"));
      await user.click(screen.getByLabelText("Ava hääldusmärkide juhend"));
      expect(screen.getByText("Hääldusmärkide juhend")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Tagasi variantide juurde"));
      expect(
        screen.queryByRole("heading", { name: "Hääldusmärkide juhend" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("selected variant highlighting", () => {
    it("highlights selected variant when customPhoneticForm matches", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            variants: [{ text: "test", description: "Normal" }],
          }),
      });

      const { container } = render(
        <PronunciationVariants {...defaultProps} customPhoneticForm="test" />,
      );

      await waitFor(() => {
        expect(
          container.querySelector(".pronunciation-variants__item--selected"),
        ).toBeInTheDocument();
      });
    });
  });

});
