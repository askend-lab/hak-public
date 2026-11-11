// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { healthHandler } from "../src/handler";
import { parseJsonBody } from "../src/validation";

describe("Vabamorf API Smoke Tests", () => {
  it("healthHandler returns 200 with status ok and version", () => {
    const result = healthHandler();
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe("ok");
    expect(body.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("parseJsonBody returns parsed object for valid JSON", () => {
    const result = parseJsonBody('{"text":"tere"}');
    expect(result).toStrictEqual({ text: "tere" });
  });

  it("parseJsonBody returns null for invalid JSON", () => {
    expect(parseJsonBody("not json")).toBeNull();
  });

  it("parseJsonBody returns null for null input", () => {
    expect(parseJsonBody(null)).toBeNull();
  });
});
