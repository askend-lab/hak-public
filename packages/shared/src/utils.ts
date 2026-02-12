// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Delays execution for the specified duration
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if a string is non-empty (not null, undefined, or whitespace-only)
 * @param value - String to check
 */
export function isNonEmpty(value: string | null | undefined): value is string {
  return value !== null && value !== undefined && value.trim() !== "";
}

/**
 * Checks if a string is empty (null, undefined, or whitespace-only)
 * @param value - String to check
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !isNonEmpty(value);
}
