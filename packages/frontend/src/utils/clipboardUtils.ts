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
    await navigator.clipboard.writeText(text);
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
