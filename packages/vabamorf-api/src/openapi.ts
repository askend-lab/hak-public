// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import {
  AnalyzeRequestSchema,
  AnalyzeResponseSchema,
  VariantsRequestSchema,
  VariantsResponseSchema,
  HealthResponseSchema,
  ErrorResponseSchema,
} from "./schemas";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "post",
  path: "/api/analyze",
  summary: "Morphological analysis with stress marks",
  description:
    "Analyze Estonian text and return it with stress marks added. Uses the vmetajson morphological analyzer.",
  request: {
    body: {
      content: {
        "application/json": { schema: AnalyzeRequestSchema.openapi("AnalyzeRequest") },
      },
    },
  },
  responses: {
    "200": {
      description: "Analyzed text with stress marks",
      content: {
        "application/json": { schema: AnalyzeResponseSchema.openapi("AnalyzeResponse") },
      },
    },
    "400": {
      description: "Invalid request",
      content: {
        "application/json": { schema: ErrorResponseSchema.openapi("ErrorResponse") },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/variants",
  summary: "Get phonetic variants for a word",
  description:
    "Returns all morphological variants (lemma, part of speech, form) for an Estonian word.",
  request: {
    body: {
      content: {
        "application/json": { schema: VariantsRequestSchema.openapi("VariantsRequest") },
      },
    },
  },
  responses: {
    "200": {
      description: "Word variants with morphological info",
      content: {
        "application/json": { schema: VariantsResponseSchema.openapi("VariantsResponse") },
      },
    },
    "400": {
      description: "Invalid request",
      content: {
        "application/json": { schema: ErrorResponseSchema.openapi("ErrorResponse") },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/health",
  summary: "Health check",
  description: "Returns API health status and version.",
  responses: {
    "200": {
      description: "API is healthy",
      content: {
        "application/json": { schema: HealthResponseSchema.openapi("HealthResponse") },
      },
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- OpenAPI doc is untyped JSON
export const openApiDocument: any = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "Vabamorf API — Morphological Analysis",
    version: "0.1.0",
    description:
      "Estonian morphological analysis API. Uses vmetajson binary for stress marking and word variant extraction.",
  },
  servers: [
    {
      url: "https://hak.example.com",
      description: "Production",
    },
  ],
});

if (require.main === module) {
  const yaml = require("js-yaml");
  process.stdout.write(yaml.dump(openApiDocument, { lineWidth: 120 }));
}
