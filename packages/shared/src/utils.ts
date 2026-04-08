// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/** Nullable string — common parameter type for text validation */
export type NullableString = string | null | undefined;

/**
 * Delays execution for the specified duration
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/**
 * Checks if a string is non-empty (not null, undefined, or whitespace-only)
 * @param value - String to check
 */
export function isNonEmpty(value: NullableString): value is string {
  return value != null && value.trim() !== "";
}

/**
 * Checks if a string is empty (null, undefined, or whitespace-only)
 * @param value - String to check
 */
export function isEmpty(value: NullableString): boolean {
  return !isNonEmpty(value);
}
