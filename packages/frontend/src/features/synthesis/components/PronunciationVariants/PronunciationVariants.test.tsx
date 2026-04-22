// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PronunciationVariants from "./PronunciationVariants";

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
  synthesizeAuto: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
  AuthRequiredError: class AuthRequiredError extends Error { constructor() { super("Authentication required"); this.name = "AuthRequiredError"; } },
}));
vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: { getAccessToken: vi.fn().mockReturnValue("test-token") },
}));
vi.mock("@/features/synthesis/utils/audioPlayer", () => ({
  createAudioPlayer: vi.fn(() => ({
    audio: { play: vi.fn().mockResolvedValue(undefined), pause: vi.fn() },
  })),
}));
vi.mock("@/features/synthesis/utils/phoneticMarkers", () => ({
  transformToVabamorf: vi.fn((t: string): string => t),
  transformToUI: vi.fn((t: string): string => t),
}));
vi.mock("./VariantItem", () => ({
  VariantItem: ({
    variant,
    onPlay,
    onUse,
  }: {
    variant: { text: string; description: string };
    onPlay: (v: { text: string; description: string }) => void;
    onUse: (v: { text: string; description: string }) => void;
  }) => (
    <div data-testid={`variant-${variant.text}`}>
      <span>{variant.description}</span>
      <button aria-label="play" onClick={() => onPlay(variant)}>
        Play
      </button>
      <button onClick={() => onUse(variant)}>Kasuta</button>
    </div>
  ),
}));
vi.mock("./CustomVariantForm", () => ({
  CustomVariantForm: ({
    onChange,
    onPlay,
    onUse,
    onClose,
  }: {
    onChange: (v: string) => void;
    onPlay: () => void;
    onUse: () => void;
    onClose: () => void;
  }) => (
    <div data-testid="custom-form">
      <input
        data-testid="custom-input"
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onPlay}>Play Custom</button>
      <button onClick={onUse}>Use Custom</button>
      <button onClick={onClose}>Close Custom</button>
    </div>
  ),
}));
vi.mock("./PhoneticGuide", () => ({
  default: ({
    onBack,
    onClose,
  }: {
    onBack: () => void;
    onClose: () => void;
  }) => (
    <div data-testid="phonetic-guide">
      <button onClick={onBack}>Back</button>
      <button onClick={onClose}>Close Guide</button>
    </div>
  ),
}));

describe("PronunciationVariants", () => {
  const defaultProps = {
    word: "tere",
    isOpen: true,
    onClose: vi.fn(),
    onUseVariant: vi.fn(),
    customPhoneticForm: null as string | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          variants: [
            { text: "te`re", description: "Variant 1" },
            { text: "te're", description: "Variant 2" },
            { text: "te`re", description: "Duplicate" },
          ],
        }),
    });
  });

  it("returns null when not open", () => {
    const { container } = render(
      <PronunciationVariants {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders panel with word title when open", async () => {
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("tere")).toBeInTheDocument();
    });
  });

  it("shows loading state while fetching", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<PronunciationVariants {...defaultProps} />);
    expect(screen.getByText("Laen variante...")).toBeInTheDocument();
  });

  it("renders unique variants after fetching", async () => {
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Variant 1")).toBeInTheDocument();
      expect(screen.getByText("Variant 2")).toBeInTheDocument();
    });
  });

  it("deduplicates variants by text", async () => {
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Variant 1")).toBeInTheDocument();
      expect(screen.getByText("Variant 2")).toBeInTheDocument();
    });
    // The duplicate te`re should be filtered out
    const items = screen.getAllByText(/Variant/);
    expect(items.length).toBe(2);
  });

  it("shows error on fetch failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("shows error on network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it("shows generic error for non-Error throws", async () => {
    global.fetch = vi.fn().mockRejectedValue("unknown");
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
    });
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<PronunciationVariants {...defaultProps} onClose={onClose} />);
    await waitFor(() => expect(screen.getByText("tere")).toBeInTheDocument());
    await user.click(screen.getByLabelText(/sulge|close/i));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows custom form when toggle clicked", async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Loo oma variant")).toBeInTheDocument(),
    );
    await user.click(screen.getByText("Loo oma variant"));
  });

  it("handles play variant", async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Variant 1")).toBeInTheDocument(),
    );
    const playBtns = screen.getAllByLabelText("play");
    if (playBtns[0]) {await user.click(playBtns[0]);}
  });

  it("handles play variant error", async () => {
    const { synthesizeAuto } = await import("@/features/synthesis/utils/synthesize");
    (synthesizeAuto as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("synth fail"),
    );
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    const user = userEvent.setup();
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Variant 1")).toBeInTheDocument(),
    );
    const playBtns = screen.getAllByLabelText("play");
    if (playBtns[0]) {await user.click(playBtns[0]);}
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

});
