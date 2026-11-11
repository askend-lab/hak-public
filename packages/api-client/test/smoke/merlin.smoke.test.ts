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

  it("POST /synthesize — returns 401 without auth or 400 for empty body", async () => {
    const result = await client.synthesize({ text: "" });
    // 401 = JWT required (CloudFront auth), 400 = empty body validation
    expect([400, 401]).toContain(result.status);
    expect(typeof result.error).toBe("string");
  });

  it("POST /synthesize — reachable with valid request (may require auth)", async () => {
    const unique = randomBytes(8).toString("hex");
    const text = `Smoke test ${unique}`;

    const result = await client.synthesize({ text, voice: "efm_l" });
    // 401 = JWT required (CloudFront auth), 200/202 = synthesis started
    expect([200, 202, 401]).toContain(result.status);
  });

  it("GET /status/{cacheKey} — returns 400 for invalid cacheKey", async () => {
    const result = await client.status("invalid-key");
    expect(result.status).toBe(400);
    expect(typeof result.error).toBe("string");
  });
});
