// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export function toBase64Url(base64: string): string {
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return toBase64Url(btoa(String.fromCharCode(...array)));
}

export async function generateCodeChallenge(
  verifier: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toBase64Url(btoa(String.fromCharCode(...new Uint8Array(digest))));
}
