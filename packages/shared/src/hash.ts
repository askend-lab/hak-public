// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * SHA-256 hash utility that works in both browser and Node.js
 */

interface SubtleCrypto {
  digest(algorithm: string, data: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer>;
}

declare const window: { crypto?: { subtle?: SubtleCrypto } } | undefined;

// #1 Extracted shared validation — eliminates duplicate guard in both functions
function validateHashInput(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }
}

// #2 Extracted hex conversion — reusable for browser path
function toHexString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  }
  return hex;
}

export async function calculateHash(text: string): Promise<string> {
  validateHashInput(text);

  // Browser environment
  if (typeof window !== "undefined" && window?.crypto?.subtle) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return toHexString(hashBuffer);
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
  validateHashInput(text);

  const crypto = require("node:crypto") as typeof import("node:crypto");
  return crypto.createHash("sha256").update(text).digest("hex");
}
