// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export {
  synthesize,
  status,
  health,
  warmup,
  generateCacheKey,
  parseRequestBody,
  applySynthesizeDefaults,
  validateText,
  resetRateLimit,
  VERSION,
  WARMUP_COOLDOWN_MS,
} from "./handler";

export type {
  SynthesizeRequest,
  SynthesizeEvent,
  StatusEvent,
  SynthesizeParams,
} from "./handler";

export {
  createResponse,
  createBadRequest,
  createInternalError,
  HTTP_STATUS,
  CORS_HEADERS,
} from "./response";

export type { LambdaResponse } from "./response";

export {
  getAwsRegion,
  getS3Bucket,
  getSqsQueueUrl,
  getEcsCluster,
  getEcsService,
  VOICE_DEFAULTS,
} from "./env";

export { buildAudioUrl, buildCacheKey, checkS3Cache } from "./s3";
export { isNotFoundError } from "@hak/shared";
export { sendToQueue } from "./sqs";
export { describeService, scaleService, isEcsConfigured } from "./ecs";
export type { EcsServiceState } from "./ecs";
