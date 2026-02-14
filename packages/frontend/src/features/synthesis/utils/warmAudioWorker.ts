// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { logger } from "@hak/shared";
import { CONTENT_TYPE_JSON } from "./analyzeApi";

let warmed = false;
let lastActivity = 0;
const ACTIVITY_THROTTLE = 60000; // 1 min between pings
const WARMUP_API_PATH = "/api/warmup";

export async function warmAudioWorker(): Promise<void> {
  if (warmed) return;
  if (typeof window === "undefined" || import.meta.env?.MODE === "test") return;

  try {
    await fetch(WARMUP_API_PATH, {
      method: "POST",
      headers: { "Content-Type": CONTENT_TYPE_JSON },
    });
    warmed = true;
    lastActivity = Date.now();
    logger.info("[Audio] Merlin warm-up triggered");
  } catch (error) {
    logger.warn("[Audio] Failed to warm up Merlin:", error);
  }
}

export function pingMerlinOnActivity(): void {
  if (typeof window === "undefined" || import.meta.env?.MODE === "test") return;

  const now = Date.now();
  if (now - lastActivity < ACTIVITY_THROTTLE) return;
  lastActivity = now;

  fetch(WARMUP_API_PATH, { method: "POST" }).catch(() => {});
}

let initialized = false;

// Initialize auto-ping on user activity (mouse, keyboard, touch)
export function initActivityListeners(): void {
  if (initialized) return;
  if (typeof window === "undefined" || import.meta.env?.MODE === "test") return;

  const events = ["mouseenter", "keydown", "touchstart", "scroll"];
  events.forEach((event) => {
    window.addEventListener(event, () => pingMerlinOnActivity(), {
      passive: true,
    });
  });
  initialized = true;
}
