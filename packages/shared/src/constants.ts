// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/** Maximum text length limits for various API endpoints */
export const TEXT_LIMITS = {
  MAX_AUDIO_TEXT_LENGTH: 1000,
  MAX_MORPHOLOGY_TEXT_LENGTH: 10000,
} as const;

// #10 Derived types for consumer use
export type TextLimitKey = keyof typeof TEXT_LIMITS;

/** Timing constants for polling, retries, and UI notifications */
export const TIMING = {
  POLL_INTERVAL_MS: 1000,
  ERROR_RETRY_DELAY_MS: 5000,
  NOTIFICATION_DURATION_MS: 5000,
} as const;

export type TimingKey = keyof typeof TIMING;
