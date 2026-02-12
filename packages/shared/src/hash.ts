// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * SHA-256 hash utility that works in both browser and Node.js
 */

import { isEmpty } from "./utils";

interface BrowserSubtleCrypto {
  digest(algorithm: string, data: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer>;
}

declare const window: { crypto?: { subtle?: BrowserSubtleCrypto } } | undefined;

const HASH_ALGORITHM = "sha256";
const BROWSER_HASH_ALGORITHM = "SHA-256";
const CRYPTO_MODULE = "node:crypto";
const ERROR_EMPTY_TEXT = "Text cannot be empty";

function validateHashInput(text: string): void {
  if (isEmpty(text)) {
    throw new Error(ERROR_EMPTY_TEXT);
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

function getSubtleCrypto(): BrowserSubtleCrypto | undefined {
  return typeof window !== "undefined" ? window?.crypto?.subtle : undefined;
}

function nodeHashHex(crypto: typeof import("node:crypto"), text: string): string {
  return crypto.createHash(HASH_ALGORITHM).update(text).digest("hex");
}

export async function calculateHash(text: string): Promise<string> {
  validateHashInput(text);

  const subtle = getSubtleCrypto();
  if (subtle) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await subtle.digest(BROWSER_HASH_ALGORITHM, data);
    return toHexString(hashBuffer);
  }

  const crypto = await import(/* @vite-ignore */ CRYPTO_MODULE);
  return nodeHashHex(crypto, text);
}

/**
 * Synchronous hash for Node.js only (for backward compatibility)
 * @deprecated Use async calculateHash() instead for ESM compatibility
 */
export function calculateHashSync(text: string): string {
  validateHashInput(text);

  const crypto = require(CRYPTO_MODULE) as typeof import("node:crypto");
  return nodeHashHex(crypto, text);
}
