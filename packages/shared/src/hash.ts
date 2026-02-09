// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * SHA-256 hash utility that works in both browser and Node.js
 */

// Define SubtleCrypto interface for environments without DOM types
interface SubtleCryptoLike {
  digest(
    algorithm: string,
    data: ArrayBuffer | ArrayBufferView,
  ): Promise<ArrayBuffer>;
}

declare const window: { crypto?: { subtle?: SubtleCryptoLike } } | undefined;

export async function calculateHash(text: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  // Browser environment
  if (typeof window !== "undefined" && window?.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Node.js environment
  const crypto = await import("node:crypto");
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * Synchronous hash for Node.js only (for backward compatibility)
 * @deprecated Use async calculateHash() instead for ESM compatibility
 */
export function calculateHashSync(text: string): string {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  const crypto = require("node:crypto") as typeof import("node:crypto");
  return crypto.createHash("sha256").update(text).digest("hex");
}
