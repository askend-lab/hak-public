// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { NotificationType, NotificationColor } from "@/components/Notification";
import { logger } from "@hak/shared";

/**
 * Copies text to clipboard and reports success/failure via a notification callback.
 * Consolidates the repeated clipboard + notification pattern.
 */
export async function copyTextToClipboard(
  text: string,
  showNotification: (
    type: NotificationType,
    message: string,
    description?: string,
    duration?: number,
    color?: NotificationColor,
  ) => void,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showNotification(
      "success",
      "Tekst kopeeritud!",
      undefined,
      undefined,
      "success",
    );
  } catch (error) {
    logger.error("Failed to copy text:", error);
    showNotification("error", "Viga teksti kopeerimisel");
  }
}
