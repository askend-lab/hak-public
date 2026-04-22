// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { z } from "zod";

export const MAX_TEXT_LENGTH = 10_000;

export const AnalyzeRequestSchema = z
  .object({
    text: z
      .string()
      .transform((s) => s.trim())
      .pipe(z.string().min(1, "text must be a non-empty string"))
      .pipe(z.string().max(MAX_TEXT_LENGTH, `Text is too long (max ${MAX_TEXT_LENGTH} characters)`)),
  });

export const VariantsRequestSchema = z
  .object({
    word: z
      .string()
      .min(1, "word must be a non-empty string"),
  });

const MorphologyInfoSchema = z
  .object({
    lemma: z.string(),
    pos: z.string(),
    fs: z.string(),
    stem: z.string(),
    ending: z.string(),
  });

const VariantSchema = z
  .object({
    text: z.string(),
    description: z.string(),
    morphology: MorphologyInfoSchema,
  });

export const AnalyzeResponseSchema = z
  .object({
    stressedText: z.string(),
    originalText: z.string(),
  });

export const VariantsResponseSchema = z
  .object({
    word: z.string(),
    variants: z.array(VariantSchema),
  });

export const HealthResponseSchema = z
  .object({
    status: z.literal("ok"),
    version: z.string(),
  });

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
  });

