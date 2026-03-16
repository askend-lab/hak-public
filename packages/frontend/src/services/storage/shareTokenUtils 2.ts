// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

const SHARE_TOKEN_BYTES = 16;

export function generateShareToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(SHARE_TOKEN_BYTES)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, SHARE_TOKEN_BYTES);
}
