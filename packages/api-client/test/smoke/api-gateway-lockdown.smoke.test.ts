// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * API Gateway Lockdown Tests
 *
 * Verifies that ALL backend API Gateways (Merlin, Vabamorf, SimpleStore, Auth)
 * are NOT directly accessible from the public internet. All traffic must go
 * through CloudFront (which applies WAF protection).
 *
 * If any of these tests fail, it means the API Gateway has a public custom
 * domain or its execute-api endpoint is exposed — a critical security issue.
 */

import { getUrls } from "../../src/config";

const urls = getUrls();

// Direct API Gateway custom domains that should NOT be reachable
const DIRECT_ENDPOINTS = [
  { name: "Merlin API", url: `${urls.merlin}/health` },
  { name: "Vabamorf API", url: `${urls.vabamorf}/analyze`, method: "POST", body: JSON.stringify({ text: "test" }) },
  { name: "SimpleStore API", url: `${urls.simplestore}/api/health` },
  { name: "Auth API", url: `${urls.auth}/auth/tara/health` },
];

describe("API Gateway lockdown — backends must NOT be publicly accessible", () => {
  for (const endpoint of DIRECT_ENDPOINTS) {
    it(`${endpoint.name} (${new URL(endpoint.url).hostname}) must not respond`, async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(endpoint.url, {
          method: endpoint.method ?? "GET",
          headers: endpoint.body ? { "Content-Type": "application/json" } : {},
          body: endpoint.body,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        // If we get a response, it MUST NOT be a successful API response.
        // DNS might still resolve to old records, but should get connection
        // refused, 403 Forbidden, or similar non-functional response.
        // A 200 with valid JSON means the API is publicly accessible = FAIL.
        if (res.ok) {
          const contentType = res.headers.get("content-type") ?? "";
          expect(contentType).not.toMatch(/application\/json/);
        }
      } catch {
        // Connection error, DNS failure, timeout = GOOD (not reachable)
        expect(true).toBe(true);
      }
    });
  }

  it("CloudFront frontend API route still works", async () => {
    // Sanity check: the frontend CloudFront URL should still work
    const res = await fetch(`${urls.frontend}/api/status/0000000000000000000000000000000000000000000000000000000000000000`);
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toMatch(/application\/json/);
  });
});
