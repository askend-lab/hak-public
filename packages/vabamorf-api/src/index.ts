// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export { analyzeHandler, variantsHandler, healthHandler } from "./handler";
export { createResponse, parseJsonBody, getFieldError, validateField } from "./validation";
export const CORS_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};
export { formatPhoneticText } from "./parser-helpers";
export { buildDescription } from "./description-builder";
export { closeVmetajson, isInitialized } from "./vmetajson";
export type {
  AnalyzeRequest,
  AnalyzeResponse,
  VariantsRequest,
  VariantsResponse,
  Variant,
  MorphologyInfo,
  VmetajsonMrf,
  VmetajsonToken,
  VmetajsonResponse,
  VmetajsonInput,
  LambdaResponse,
} from "./types";
