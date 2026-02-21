// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createHash } from "crypto";

import {
  createResponse,
  createBadRequest,
  createInternalError,
  HTTP_STATUS,
  type LambdaResponse,
} from "./response";
import { VOICE_DEFAULTS } from "./env";
import { checkS3Cache, buildAudioUrl } from "./s3";
import { sendToQueue } from "./sqs";
import {
  SynthesizeRequestSchema,
  CacheKeySchema,
  type SynthesizeRequest,
} from "./schemas";

// Read version from package.json (same pattern as vabamorf-api)
function loadVersion(): string {
  try {
    return require("./package.json").version;
  } catch {
    try {
      return require("../package.json").version;
    } catch {
      return "0.0.0";
    }
  }
}
export const VERSION = loadVersion();

export type { SynthesizeRequest } from "./schemas";
export { MAX_TEXT_LENGTH, SPEED_RANGE, PITCH_RANGE } from "./schemas";
export { SynthesizeRequestSchema, CacheKeySchema } from "./schemas";

export interface SynthesizeEvent {
  body?: string;
}

export interface StatusEvent {
  pathParameters?: { cacheKey?: string };
}

export interface SynthesizeParams {
  text: string;
  voice: string;
  speed: number;
  pitch: number;
}

export function generateCacheKey(
  text: string,
  voice: string,
  speed: number,
  pitch: number,
): string {
  const input = `${text}|${voice}|${speed}|${pitch}`;
  return createHash("sha256").update(input).digest("hex");
}

export const MAX_BODY_SIZE = 10_240; // 10KB

export type ParseBodyResult =
  | { ok: true; data: SynthesizeRequest }
  | { ok: false; error: string };

export function parseRequestBody(body?: string): ParseBodyResult {
  if (body && body.length > MAX_BODY_SIZE) {
    return { ok: false, error: "Request body too large" };
  }
  try {
    return { ok: true, data: JSON.parse(body ?? "{}") as SynthesizeRequest };
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }
}

export function applySynthesizeDefaults(body: SynthesizeRequest): SynthesizeParams {
  return {
    text: body.text,
    voice: body.voice ?? VOICE_DEFAULTS.voice,
    speed: body.speed ?? VOICE_DEFAULTS.speed,
    pitch: body.pitch ?? VOICE_DEFAULTS.pitch,
  };
}

export async function synthesize(event: SynthesizeEvent): Promise<LambdaResponse> {
  try {
    const parsed = parseRequestBody(event.body);
    if (!parsed.ok) {
      return createBadRequest(parsed.error);
    }

    const validated = SynthesizeRequestSchema.safeParse(parsed.data);
    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return createBadRequest(firstError?.message ?? "Invalid request");
    }

    const text = validated.data.text;
    const voice = validated.data.voice ?? VOICE_DEFAULTS.voice;
    const speed = validated.data.speed ?? VOICE_DEFAULTS.speed;
    const pitch = validated.data.pitch ?? VOICE_DEFAULTS.pitch;
    const cacheKey = generateCacheKey(text, voice, speed, pitch);

    const cached = await checkS3Cache(cacheKey);
    if (cached) {
      return createResponse(HTTP_STATUS.OK, {
        status: "ready",
        cacheKey,
        audioUrl: buildAudioUrl(cacheKey),
      });
    }

    await sendToQueue({
      text,
      voice,
      speed,
      pitch,
      cacheKey,
    });

    return createResponse(HTTP_STATUS.ACCEPTED, {
      status: "processing",
      cacheKey,
      audioUrl: buildAudioUrl(cacheKey),
    });
  } catch (error) {
    return createInternalError("Synthesize error", error);
  }
}

export async function status(event: StatusEvent): Promise<LambdaResponse> {
  try {
    const rawCacheKey = event.pathParameters?.cacheKey;
    const cacheKeyResult = CacheKeySchema.safeParse(rawCacheKey);

    if (!cacheKeyResult.success) {
      return createBadRequest("Missing or invalid cacheKey");
    }
    const cacheKey = cacheKeyResult.data;

    const ready = await checkS3Cache(cacheKey);

    return createResponse(HTTP_STATUS.OK, {
      status: ready ? "ready" : "processing",
      cacheKey,
      audioUrl: ready ? buildAudioUrl(cacheKey) : null,
    });
  } catch (error) {
    return createInternalError("Status error", error);
  }
}

export async function health(): Promise<LambdaResponse> {
  return createResponse(HTTP_STATUS.OK, { status: "ok", version: VERSION });
}

