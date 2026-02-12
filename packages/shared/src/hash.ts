// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * SHA-256 hash utility that works in both browser and Node.js
 */

interface SubtleCrypto {
  digest(algorithm: string, data: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer>;
}

declare const window: { crypto?: { subtle?: SubtleCrypto } } | undefined;

// #1 Hash algorithm as constant — single source of truth
const HASH_ALGORITHM = "sha256";
const BROWSER_HASH_ALGORITHM = "SHA-256";

// #5 Simplified — trim() handles empty string, null/undefined caught by type + falsy check
function validateHashInput(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }
}

function toHexString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  }
  return hex;
}

// #2 Extracted environment detection
function isBrowserEnv(): boolean {
  return typeof window !== "undefined" && window?.crypto?.subtle !== undefined;
}

// #3 Extracted Node.js hash — eliminates repeated crypto.createHash chain
function nodeHashHex(crypto: typeof import("node:crypto"), text: string): string {
  return crypto.createHash(HASH_ALGORITHM).update(text).digest("hex");
}

export async function calculateHash(text: string): Promise<string> {
  validateHashInput(text);

  if (isBrowserEnv()) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await window!.crypto!.subtle!.digest(BROWSER_HASH_ALGORITHM, data);
    return toHexString(hashBuffer);
  }

  const crypto = await import("node:crypto");
  return nodeHashHex(crypto, text);
}

/**
 * Synchronous hash for Node.js only (for backward compatibility)
 * @deprecated Use async calculateHash() instead for ESM compatibility
 */
export function calculateHashSync(text: string): string {
  validateHashInput(text);

  const crypto = require("node:crypto") as typeof import("node:crypto");
  return nodeHashHex(crypto, text);
}
