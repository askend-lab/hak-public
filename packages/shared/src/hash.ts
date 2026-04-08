// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * SHA-256 hash utility that works in both browser and Node.js
 */

import { isEmpty } from "./utils";

const HASH_ALGORITHM = "sha256";
const CRYPTO_MODULE = "node:crypto";
const ERROR_EMPTY_TEXT = "Text cannot be empty";

function validateHashInput(text: string): void {
  if (isEmpty(text)) {
    throw new Error(ERROR_EMPTY_TEXT);
  }
}

function nodeHashHex(crypto: typeof import("node:crypto"), text: string): string {
  return crypto.createHash(HASH_ALGORITHM).update(text).digest("hex");
}

/**
 * Async SHA-256 hash.
 * Uses Node.js crypto (Lambda & backend) with dynamic import for ESM compat.
 */
export async function calculateHash(text: string): Promise<string> {
  validateHashInput(text);
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
