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
    expect(doc.info.title).toContain("Vabamorf");
    expect(doc.info.version).toBeDefined();
  });

  it("should define all three endpoints", () => {
    const paths = Object.keys(doc.paths ?? {});
    expect(paths).toContain("/api/analyze");
    expect(paths).toContain("/api/variants");
    expect(paths).toContain("/api/health");
  });

  it("should define all component schemas", () => {
    const schemas = Object.keys(doc.components?.schemas ?? {});
    expect(schemas).toContain("AnalyzeRequest");
    expect(schemas).toContain("AnalyzeResponse");
    expect(schemas).toContain("VariantsRequest");
    expect(schemas).toContain("VariantsResponse");
    expect(schemas).toContain("HealthResponse");
    expect(schemas).toContain("ErrorResponse");
  });

  it("should have POST method for analyze", () => {
    expect(doc.paths["/api/analyze"]).toHaveProperty("post");
  });

  it("should have POST method for variants", () => {
    expect(doc.paths["/api/variants"]).toHaveProperty("post");
  });

  it("should have GET method for health", () => {
    expect(doc.paths["/api/health"]).toHaveProperty("get");
  });
});
