// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { VabamorfClient } from "../../src/clients/vabamorf";
import { getUrls } from "../../src/config";

const urls = getUrls();
const client = new VabamorfClient(urls.vabamorf);

describe("Vabamorf API smoke tests", () => {
  it("GET /api/health — returns ok", async () => {
    const result = await client.health();
    expect(result.status).toBe(200);
    expect(result.data?.status).toBe("ok");
    expect(typeof result.data?.version).toBe("string");
  });

  it("POST /api/analyze — reachable (may require auth)", async () => {
    const result = await client.analyze({ text: "tere maailm" });
    // 401 = JWT required (CloudFront auth), 200 = analysis succeeded
    expect([200, 401]).toContain(result.status);
    if (result.status === 200) {
      expect(result.data?.originalText).toBe("tere maailm");
      expect(typeof result.data?.stressedText).toBe("string");
    }
  });

  it("POST /api/analyze — rejects empty body with 400 or requires auth", async () => {
    const result = await client.analyze({ text: "" });
    // 401 = JWT required, 400 = empty body validation
    expect([400, 401]).toContain(result.status);
  });

  it("POST /api/variants — reachable (may require auth)", async () => {
    const result = await client.variants({ word: "koer" });
    // 401 = JWT required (CloudFront auth), 200 = variants returned
    expect([200, 401]).toContain(result.status);
    if (result.status === 200) {
      expect(result.data?.word).toBe("koer");
      expect(Array.isArray(result.data?.variants)).toBe(true);
    }
  });

  it("POST /api/variants — rejects empty word with 400 or requires auth", async () => {
    const result = await client.variants({ word: "" });
    // 401 = JWT required, 400 = empty word validation
    expect([400, 401]).toContain(result.status);
  });
});
