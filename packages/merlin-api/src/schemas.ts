// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const MAX_TEXT_LENGTH = 1000;
export const SPEED_RANGE = { min: 0.5, max: 2.0 } as const;
export const PITCH_RANGE = { min: -500, max: 500 } as const;

export const SynthesizeRequestSchema = z
  .object({
    text: z
      .string()
      .min(1, "Text must not be empty")
      .max(MAX_TEXT_LENGTH, `Text must be at most ${MAX_TEXT_LENGTH} characters`),
    voice: z.string().optional(),
    speed: z
      .number()
      .min(SPEED_RANGE.min, `Speed must be at least ${SPEED_RANGE.min}`)
      .max(SPEED_RANGE.max, `Speed must be at most ${SPEED_RANGE.max}`)
      .optional(),
    pitch: z
      .number()
      .int()
      .min(PITCH_RANGE.min, `Pitch must be at least ${PITCH_RANGE.min}`)
      .max(PITCH_RANGE.max, `Pitch must be at most ${PITCH_RANGE.max}`)
      .optional(),
  })
  .openapi("SynthesizeRequest");

export const CacheKeySchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "Must be a 64-character lowercase hex string (SHA-256)")
  .openapi("CacheKey");

export const SynthesizeResponseSchema = z
  .object({
    status: z.enum(["ready", "processing"]),
    cacheKey: z.string(),
    audioUrl: z.string(),
  })
  .openapi("SynthesizeResponse");

export const StatusResponseSchema = z
  .object({
    status: z.enum(["ready", "processing"]),
    cacheKey: z.string(),
    audioUrl: z.string().nullable(),
  })
  .openapi("StatusResponse");

export const HealthResponseSchema = z
  .object({
    status: z.literal("ok"),
    version: z.string(),
  })
  .openapi("HealthResponse");

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
  })
  .openapi("ErrorResponse");

export type SynthesizeRequest = z.infer<typeof SynthesizeRequestSchema>;
export type SynthesizeResponse = z.infer<typeof SynthesizeResponseSchema>;
export type StatusResponse = z.infer<typeof StatusResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
