// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * CloudFront API Routing Tests
 *
 * Verifies that CloudFront correctly routes /api/* requests to backend
 * API origins (Merlin, Vabamorf) instead of falling through to S3 (SPA HTML).
 *
 * These tests catch a critical failure mode: if CloudFront ordered_cache_behaviors
 * are missing or misconfigured, all /api/* requests return index.html (HTTP 200)
 * instead of actual API responses. A naive HTTP status check would pass.
 */

import { getUrls } from "../../src/config";

const urls = getUrls();
const FRONTEND_URL = urls.frontend;

describe("CloudFront API routing", () => {
  it("POST /api/synthesize — returns JSON, not HTML", async () => {
    const res = await fetch(`${FRONTEND_URL}/api/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Tere", voice: "efm_l" }),
    });

    // 401 (no JWT) or 200/202 (authenticated) — both prove CloudFront routes to API, not S3
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toMatch(/application\/json/);
    expect(contentType).not.toMatch(/text\/html/);
  });

  it("POST /api/analyze — returns JSON, not HTML", async () => {
    const res = await fetch(`${FRONTEND_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Tere" }),
    });

    // 401 (no JWT) or 200 (authenticated) — both prove CloudFront routes to API, not S3
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toMatch(/application\/json/);
    expect(contentType).not.toMatch(/text\/html/);
  });

  it("GET /api/status/{cacheKey} — returns JSON, not HTML", async () => {
    // Use a dummy cacheKey — should get 400 JSON error, not 200 HTML
    const res = await fetch(`${FRONTEND_URL}/api/status/0000000000000000000000000000000000000000000000000000000000000000`);

    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toMatch(/application\/json/);
    expect(contentType).not.toMatch(/text\/html/);

    const body = await res.json();
    expect(body).toHaveProperty("status");
  });

  it("POST /api/variants — returns JSON, not HTML", async () => {
    const res = await fetch(`${FRONTEND_URL}/api/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: "koer" }),
    });

    // 401 (no JWT) or 200 (authenticated) — both prove CloudFront routes to API, not S3
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toMatch(/application\/json/);
    expect(contentType).not.toMatch(/text\/html/);
  });

  it("no API route returns text/html from S3", async () => {
    // Meta-check: verify that the response server header is NOT AmazonS3
    const res = await fetch(`${FRONTEND_URL}/api/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Tere", voice: "efm_l" }),
    });

    const server = res.headers.get("server") ?? "";
    expect(server.toLowerCase()).not.toContain("amazons3");
  });
});
