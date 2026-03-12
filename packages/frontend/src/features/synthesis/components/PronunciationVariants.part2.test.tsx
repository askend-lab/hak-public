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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("interactions", () => {
    it("calls onClose when close button clicked", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ variants: [] }),
      });

      render(<PronunciationVariants {...defaultProps} />);

      await user.click(screen.getByLabelText("Sulge"));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("calls onUseVariant when use button clicked", async () => {
      const user = userEvent.setup();
      const onUseVariant = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            variants: [{ text: "test", description: "Normal" }],
          }),
      });

      render(
        <PronunciationVariants {...defaultProps} onUseVariant={onUseVariant} />,
      );

      await waitFor(() => {
        expect(screen.getByText("Kasuta")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Kasuta"));
      expect(onUseVariant).toHaveBeenCalledWith("test");
    });
  });

  });

  });

  });

  });

  });

});
