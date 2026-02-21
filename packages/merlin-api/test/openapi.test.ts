// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { openApiDocument } from "../src/openapi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doc = openApiDocument as Record<string, any>;

describe("OpenAPI spec", () => {
  it("should have valid openapi version", () => {
    expect(doc.openapi).toBe("3.0.3");
  });

  it("should have correct info", () => {
    expect(doc.info.title).toContain("Merlin");
    expect(doc.info.version).toBeDefined();
  });

  it("should define all three endpoints", () => {
    const paths = Object.keys(doc.paths ?? {});
    expect(paths).toContain("/api/synthesize");
    expect(paths).toContain("/api/status/{cacheKey}");
    expect(paths).toContain("/api/health");
  });

  it("should define all component schemas", () => {
    const schemas = Object.keys(doc.components?.schemas ?? {});
    expect(schemas).toContain("SynthesizeRequest");
    expect(schemas).toContain("SynthesizeResponse");
    expect(schemas).toContain("StatusResponse");
    expect(schemas).toContain("HealthResponse");
    expect(schemas).toContain("ErrorResponse");
  });

  it("should have POST method for synthesize", () => {
    expect(doc.paths["/api/synthesize"]).toHaveProperty("post");
  });

  it("should have GET method for status", () => {
    expect(doc.paths["/api/status/{cacheKey}"]).toHaveProperty("get");
  });

  it("should have GET method for health", () => {
    expect(doc.paths["/api/health"]).toHaveProperty("get");
  });
});
