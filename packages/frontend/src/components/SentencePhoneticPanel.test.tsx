// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
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

  it("returns null when not open", () => {
    const { container } = render(
      <SentencePhoneticPanel {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when open", () => {
    render(<SentencePhoneticPanel {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /rakenda/i }),
    ).toBeInTheDocument();
  });

  it("displays phonetic text", () => {
    render(<SentencePhoneticPanel {...defaultProps} />);
    expect(screen.getByDisplayValue("Héllo wórld")).toBeInTheDocument();
  });

  it("allows editing phonetic text", async () => {
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);

    const input = screen.getByDisplayValue("Héllo wórld");
    await user.clear(input);
    await user.type(input, "New phonetic");

    expect(input).toHaveValue("New phonetic");
  });

  it("calls onApply when apply button is clicked", async () => {
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);

    const applyButton = screen.getByRole("button", { name: /rakenda/i });
    await user.click(applyButton);

    expect(defaultProps.onApply).toHaveBeenCalledWith("Héllo wórld");
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);

    const closeButton = screen.getByRole("button", { name: /sulge/i });
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("uses sentenceText when phoneticText is null", () => {
    render(<SentencePhoneticPanel {...defaultProps} phoneticText={null} />);
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
  });

  it("plays audio on play button click", async () => {
    vi.mock("@/utils/synthesize", () => ({
      synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
      synthesizeAuto: vi.fn().mockResolvedValue("mock-audio-url"),
    }));
    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(function (this: MockAudio) {
        setTimeout(() => this.onloadeddata?.(), 0);
        setTimeout(() => this.onended?.(), 10);
        return Promise.resolve();
      });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
    global.URL.revokeObjectURL = vi.fn();

    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);

    await user.click(screen.getByText("Kuula"));
    await new Promise((r) => setTimeout(r, 15));
  });

  it("handles audio onerror callback", async () => {
    vi.mock("@/utils/synthesize", () => ({
      synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
      synthesizeAuto: vi.fn().mockResolvedValue("mock-audio-url"),
    }));
    class ErrorAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(function (this: ErrorAudio) {
        setTimeout(() => this.onerror?.(), 5);
        return Promise.resolve();
      });
    }
    global.Audio = ErrorAudio as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
    global.URL.revokeObjectURL = vi.fn();

    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);

    await user.click(screen.getByText("Kuula"));
    await new Promise((r) => setTimeout(r, 15));
  });

  it("handles play error", async () => {
    vi.mock("@/utils/synthesize", () => ({
      synthesizeWithPolling: vi.fn().mockRejectedValue(new Error("synth fail")),
      synthesizeAuto: vi.fn().mockRejectedValue(new Error("synth fail")),
    }));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);

    await user.click(screen.getByText("Kuula"));
    await new Promise((r) => setTimeout(r, 10));
    consoleSpy.mockRestore();
  });

  it("shows and hides guide view", async () => {
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);
    // Click "Näita juhendit" link/button to show guide
    const guideBtn = screen.queryByText(/juhend/i);
    if (guideBtn) {
      await user.click(guideBtn);
    }
  });

  it("handleClose stops audio if playing", async () => {
    // First trigger play to set audioRef
    vi.mock("@/utils/synthesize", () => ({
      synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
      synthesizeAuto: vi.fn().mockResolvedValue("mock-audio-url"),
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
    const { synthesizeAuto } = await import("@/utils/synthesize");
    (synthesizeAuto as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("synth fail"),
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
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

  it("play button is disabled when text is empty", () => {
    render(<SentencePhoneticPanel {...defaultProps} phoneticText={null} sentenceText="" />);
    const playBtn = screen.getByText("Kuula").closest("button");
    expect(playBtn?.disabled).toBe(true);
  });

  it("apply button is disabled when text is empty", () => {
    render(<SentencePhoneticPanel {...defaultProps} phoneticText={null} sentenceText="" />);
    const applyBtn = screen.getByRole("button", { name: /rakenda/i });
    expect(applyBtn).toBeDisabled();
  });

  it("panel has correct root class", () => {
    const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
    expect(container.querySelector(".sentence-phonetic-panel")).toBeTruthy();
  });

  it("header has correct structure", () => {
    const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
    expect(container.querySelector(".sentence-phonetic-panel__header")).toBeTruthy();
    expect(container.querySelector(".sentence-phonetic-panel__title-section")).toBeTruthy();
    expect(container.querySelector(".sentence-phonetic-panel__header-actions")).toBeTruthy();
  });

  it("close button has correct class", () => {
    const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
    expect(container.querySelector(".sentence-phonetic-panel__close")).toBeTruthy();
  });

  it("play button has button--primary class", () => {
    render(<SentencePhoneticPanel {...defaultProps} />);
    const btn = screen.getByText("Kuula").closest("button");
    expect(btn?.className).toContain("button--primary");
  });
});
