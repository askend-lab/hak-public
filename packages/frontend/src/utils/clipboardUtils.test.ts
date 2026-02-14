// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ShowNotificationOptions } from "@/contexts/NotificationContext";
import { copyTextToClipboard } from "./clipboardUtils";

describe("copyTextToClipboard", () => {
  const showNotification = vi.fn<(options: ShowNotificationOptions) => void>();
  let originalClipboard: Clipboard;

  beforeEach(() => {
    vi.restoreAllMocks();
    showNotification.mockClear();
    originalClipboard = navigator.clipboard;
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  it("copies text using clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    await copyTextToClipboard("hello", showNotification);

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("uses execCommand fallback when clipboard API unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    // jsdom doesn't define execCommand — add it so the fallback path works
    document.execCommand = vi.fn().mockReturnValue(true);

    await copyTextToClipboard("fallback text", showNotification);

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("shows error notification when copy fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Denied")),
      },
      writable: true,
      configurable: true,
    });

    await copyTextToClipboard("text", showNotification);

    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });
});
