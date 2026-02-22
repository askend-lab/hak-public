// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { MerlinClient } from "../../src/clients/merlin";
import { getUrls } from "../../src/config";
import { randomBytes } from "node:crypto";

const urls = getUrls();
const client = new MerlinClient(urls.merlin);

describe("Merlin API smoke tests", () => {
  it("GET /health — returns ok", async () => {
    const result = await client.health();
    expect(result.status).toBe(200);
    expect(result.data?.status).toBe("ok");
    expect(typeof result.data?.version).toBe("string");
  });

  it("POST /synthesize — rejects empty body with 400", async () => {
    const result = await client.synthesize({ text: "" });
    expect(result.status).toBe(400);
    expect(typeof result.error).toBe("string");
  });

  it("POST /synthesize — starts synthesis with random text (no cache)", async () => {
    // Generate unique text so it's never cached
    const unique = randomBytes(8).toString("hex");
    const text = `Smoke test ${unique}`;

    const result = await client.synthesize({ text, voice: "efm_l" });
    expect([200, 202]).toContain(result.status);
    expect(result.data).toBeDefined();
    const data = result.data ?? { cacheKey: "", status: "" };
    expect(data.cacheKey).toBeDefined();
    expect(typeof data.cacheKey).toBe("string");
    expect(data.cacheKey).toHaveLength(64);
    expect(["ready", "processing"]).toContain(data.status);
  });

  it("POST /synthesize + GET /status — full round-trip with known text (cached)", async () => {
    // Use a known phrase that's likely already cached
    const text = "Tere";

    const synthResult = await client.synthesize({ text, voice: "efm_l" });
    expect([200, 202]).toContain(synthResult.status);
    expect(synthResult.data).toBeDefined();

    const synthData = synthResult.data ?? { cacheKey: "", status: "", audioUrl: "" };
    const cacheKey = synthData.cacheKey;

    // Poll status until ready (may already be ready if cached)
    const statusResult = await client.status(cacheKey);
    expect(statusResult.status).toBe(200);
    expect(statusResult.data).toBeDefined();
    const statusData = statusResult.data ?? { status: "", cacheKey: "", audioUrl: null };
    expect(["ready", "processing"]).toContain(statusData.status);
    expect(statusData.cacheKey).toBe(cacheKey);
  });

  it("POST /synthesize + wait — generates real audio with random text", async () => {
    const unique = randomBytes(8).toString("hex");
    const text = `Proov ${unique}`;

    const result = await client.synthesizeAndWait({ text, voice: "efm_l" });
    expect(result.data).toBeDefined();
    const waitData = result.data ?? { status: "", cacheKey: "", audioUrl: null };
    expect(waitData.status).toBe("ready");
    expect(waitData.audioUrl).toBeDefined();
    expect(waitData.audioUrl).toContain(".wav");

    // Verify the audio URL is accessible
    const audioRes = await fetch(waitData.audioUrl ?? "", { method: "HEAD" });
    expect(audioRes.ok).toBe(true);
    const contentType = audioRes.headers.get("content-type");
    expect(contentType).toMatch(/audio|wav|octet/);
  }, 90_000);

  it("GET /status/{cacheKey} — returns 400 for invalid cacheKey", async () => {
    const result = await client.status("invalid-key");
    expect(result.status).toBe(400);
    expect(typeof result.error).toBe("string");
  });
});
