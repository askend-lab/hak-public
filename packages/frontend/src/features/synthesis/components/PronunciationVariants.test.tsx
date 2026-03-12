// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("rendering", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <PronunciationVariants {...defaultProps} isOpen={false} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders panel when open", () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ variants: [] }),
      });

      render(<PronunciationVariants {...defaultProps} />);
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("renders close button", () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ variants: [] }),
      });

      render(<PronunciationVariants {...defaultProps} />);
      expect(screen.getByLabelText("Sulge")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows loading message while fetching", () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}), // Never resolves
      );

      render(<PronunciationVariants {...defaultProps} />);
      expect(screen.getByText("Laen variante...")).toBeInTheDocument();
    });
  });

  describe("variants display", () => {
    it("displays fetched variants", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            variants: [
              { text: "t<est", description: "Third syllable" },
              { text: "te?st", description: "Stress" },
            ],
          }),
      });

      render(<PronunciationVariants {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("t`est")).toBeInTheDocument();
        expect(screen.getByText("te´st")).toBeInTheDocument();
      });
    });

    it("shows play and use buttons for variants", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            variants: [{ text: "test", description: "Normal" }],
          }),
      });
      render(<PronunciationVariants {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTitle("Mängi")).toBeInTheDocument();
        expect(screen.getByText("Kasuta")).toBeInTheDocument();
      });
    });

    it("filters duplicate variants by text", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            variants: [
              { text: "test", description: "First" },
              { text: "test", description: "Duplicate" },
              { text: "test2", description: "Different" },
            ],
          }),
      });

      render(<PronunciationVariants {...defaultProps} />);

      await waitFor(() => {
        const useButtons = screen.getAllByText("Kasuta");
        expect(useButtons.length).toBe(2); // Only 2 unique variants
      });
    });
  });

  describe("error handling", () => {
    it("displays error message on fetch failure", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      render(<PronunciationVariants {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/viga/i)).toBeInTheDocument();
      });
    });
  });

  });

  });

  });

  });

  });

});
