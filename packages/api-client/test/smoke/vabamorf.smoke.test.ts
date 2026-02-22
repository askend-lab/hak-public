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

  it("POST /api/analyze — returns stressed text", async () => {
    const result = await client.analyze({ text: "tere maailm" });
    expect(result.status).toBe(200);
    expect(result.data?.originalText).toBe("tere maailm");
    expect(typeof result.data?.stressedText).toBe("string");
    const analyzeData = result.data ?? { stressedText: "", originalText: "" };
    expect(analyzeData.stressedText.length).toBeGreaterThan(0);
  });

  it("POST /api/analyze — rejects empty body with 400", async () => {
    const result = await client.analyze({ text: "" });
    expect(result.status).toBe(400);
    expect(typeof result.error).toBe("string");
  });

  it("POST /api/variants — returns morphological variants", async () => {
    const result = await client.variants({ word: "koer" });
    expect(result.status).toBe(200);
    expect(result.data?.word).toBe("koer");
    expect(Array.isArray(result.data?.variants)).toBe(true);
    const varData = result.data ?? { word: "", variants: [] };
    expect(varData.variants.length).toBeGreaterThan(0);

    const first = varData.variants[0];
    expect(typeof first.text).toBe("string");
    expect(typeof first.description).toBe("string");
    expect(typeof first.morphology.pos).toBe("string");
    expect(typeof first.morphology.lemma).toBe("string");
  });

  it("POST /api/variants — rejects empty word with 400", async () => {
    const result = await client.variants({ word: "" });
    expect(result.status).toBe(400);
    expect(typeof result.error).toBe("string");
  });
});
