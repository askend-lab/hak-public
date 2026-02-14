// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { ShowNotificationOptions } from "@/contexts/NotificationContext";
import { logger } from "@hak/shared";

/**
 * Copies text to clipboard and reports success/failure via a notification callback.
 * Consolidates the repeated clipboard + notification pattern.
 */
export async function copyTextToClipboard(
  text: string,
  showNotification: (options: ShowNotificationOptions) => void,
): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for HTTP contexts where clipboard API is unavailable
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    showNotification({
      type: "success",
      message: "Tekst kopeeritud!",
      color: "success",
    });
  } catch (error) {
    logger.error("Failed to copy text:", error);
    showNotification({ type: "error", message: "Viga teksti kopeerimisel" });
  }
}
