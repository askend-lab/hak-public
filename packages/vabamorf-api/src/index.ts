// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export { analyzeHandler, variantsHandler, healthHandler } from "./handler";
export { createResponse, parseJsonBody, getFieldError, validateField } from "./validation";
export { CORS_HEADERS } from "@hak/shared";
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
