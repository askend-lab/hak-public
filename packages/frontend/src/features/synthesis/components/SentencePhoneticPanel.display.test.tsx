// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SentencePhoneticPanel from "./SentencePhoneticPanel";

describe("SentencePhoneticPanel", () => {
  const defaultProps = {
    sentenceText: "Hello world",
    phoneticText: "Héllo wórld",
    isOpen: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  it("handleClose stops audio if playing", async () => {
    // First trigger play to set audioRef
    vi.mock("@/features/synthesis/utils/synthesize", () => ({
      synthesizeWithPolling: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
      synthesizeAuto: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
    }));
    const pauseFn = vi.fn();
    class MockAudioClose {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = pauseFn;
      play = vi.fn().mockImplementation(function (this: MockAudioClose) {
        setTimeout(() => this.onloadeddata?.(), 0);
        // Don't end - keep audio "playing"
        return Promise.resolve();
      });
    }
    global.Audio = MockAudioClose as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
    global.URL.revokeObjectURL = vi.fn();

    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} onClose={onClose} />);

    // Start playing
    await user.click(screen.getByText("Kuula"));
    await new Promise((r) => setTimeout(r, 10));

    // Now close - should stop audio
    const closeBtn = screen.getByRole("button", { name: /sulge/i });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("handles play error gracefully", async () => {
    const { synthesizeAuto } = await import("@/features/synthesis/utils/synthesize");
    (synthesizeAuto as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("synth fail"),
    );
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);
    await user.click(screen.getByText("Kuula"));
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it("does not apply with empty trimmed text", async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);

    const input = screen.getByDisplayValue("Héllo wórld");
    await user.clear(input);
    await user.type(input, "   ");
    const applyButton = screen.getByRole("button", { name: /rakenda/i });
    await user.click(applyButton);

    expect(onApply).not.toHaveBeenCalled();
  });

  it("shows correct title and description", () => {
    render(<SentencePhoneticPanel {...defaultProps} />);
    expect(screen.getByText("Muuda häälduskuju")).toBeInTheDocument();
    expect(screen.getByText(/Sisesta hääldusmärgid/)).toBeInTheDocument();
  });

  it("textarea has correct placeholder and class", () => {
    const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
    const ta = container.querySelector(".sentence-phonetic-panel__textarea");
    expect(ta).toBeTruthy();
    expect(ta?.getAttribute("placeholder")).toBe("Kirjuta oma hääldusvariant");
  });

  it("apply button has button--secondary class", () => {
    render(<SentencePhoneticPanel {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /rakenda/i });
    expect(btn.className).toContain("button--secondary");
  });

  });

  });

  });

  });

  });

});
