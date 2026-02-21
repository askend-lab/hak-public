// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
  SynthesizeRequestSchema,
  SynthesizeResponseSchema,
  StatusResponseSchema,
  HealthResponseSchema,
  ErrorResponseSchema,
} from "./schemas";

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "post",
  path: "/api/synthesize",
  summary: "Start text-to-speech synthesis",
  description:
    "Submit text for synthesis. Returns immediately with a cacheKey. If audio is already cached, returns status 'ready' with audioUrl. Otherwise returns status 'processing' and the client should poll /api/status/{cacheKey}.",
  request: {
    body: {
      content: {
        "application/json": { schema: SynthesizeRequestSchema },
      },
    },
  },
  responses: {
    "200": {
      description: "Audio already cached and ready",
      content: {
        "application/json": { schema: SynthesizeResponseSchema },
      },
    },
    "202": {
      description: "Synthesis started, poll for status",
      content: {
        "application/json": { schema: SynthesizeResponseSchema },
      },
    },
    "400": {
      description: "Invalid request",
      content: {
        "application/json": { schema: ErrorResponseSchema },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/status/{cacheKey}",
  summary: "Check synthesis status",
  description:
    "Poll this endpoint to check if audio synthesis is complete. Returns 'ready' with audioUrl when done, or 'processing' while still in progress.",
  request: {
    params: z.object({
      cacheKey: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .openapi({ description: "64-character SHA-256 hex cache key", example: "a".repeat(64) }),
    }),
  },
  responses: {
    "200": {
      description: "Current synthesis status",
      content: {
        "application/json": { schema: StatusResponseSchema },
      },
    },
    "400": {
      description: "Invalid cacheKey",
      content: {
        "application/json": { schema: ErrorResponseSchema },
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
        "application/json": { schema: HealthResponseSchema },
      },
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const openApiDocument: any = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "Merlin API — Text-to-Speech",
    version: "0.1.0",
    description:
      "Estonian text-to-speech synthesis API. Accepts text, queues synthesis via SQS to an ECS Fargate worker, and serves cached audio from S3.",
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
