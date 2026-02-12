// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createHash } from "crypto";

import {
  createResponse,
  createInternalError,
  HTTP_STATUS,
  type LambdaResponse,
} from "./response";
import { VOICE_DEFAULTS } from "./env";
import { checkS3Cache, buildAudioUrl } from "./s3";
import { sendToQueue } from "./sqs";
import { describeService, scaleService, isEcsConfigured } from "./ecs";

const VERSION = "1.0.0";

export interface SynthesizeRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface SynthesizeEvent {
  body?: string;
}

export interface StatusEvent {
  pathParameters?: { cacheKey?: string };
}

interface SynthesizeParams {
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

export function parseRequestBody(body?: string): SynthesizeRequest {
  return JSON.parse(body ?? "{}") as SynthesizeRequest;
}

export function applySynthesizeDefaults(body: SynthesizeRequest): SynthesizeParams {
  return {
    text: body.text,
    voice: body.voice ?? VOICE_DEFAULTS.voice,
    speed: body.speed ?? VOICE_DEFAULTS.speed,
    pitch: body.pitch ?? VOICE_DEFAULTS.pitch,
  };
}

function createBadRequest(error: string): LambdaResponse {
  return createResponse(HTTP_STATUS.BAD_REQUEST, { error });
}

const WARMUP_COOLDOWN_MS = 60_000;
let lastWarmupTime = 0;

export function resetRateLimit(): void {
  lastWarmupTime = 0;
}

function checkRateLimit(): LambdaResponse | null {
  const now = Date.now();
  if (now - lastWarmupTime < WARMUP_COOLDOWN_MS) {
    return createResponse(HTTP_STATUS.TOO_MANY_REQUESTS, {
      error: "Rate limited. Try again later.",
      retryAfterMs: WARMUP_COOLDOWN_MS - (now - lastWarmupTime),
    });
  }
  lastWarmupTime = now;
  return null;
}

export async function synthesize(event: SynthesizeEvent): Promise<LambdaResponse> {
  try {
    const body = parseRequestBody(event.body);

    if (typeof body.text !== "string" || body.text === "") {
      return createBadRequest("Missing text field");
    }

    const { text, voice, speed, pitch } = applySynthesizeDefaults(body);
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
    const cacheKey = event.pathParameters?.cacheKey;

    if (!cacheKey) {
      return createBadRequest("Missing cacheKey");
    }

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

export async function warmup(): Promise<LambdaResponse> {
  const rateLimited = checkRateLimit();
  if (rateLimited) return rateLimited;

  if (!isEcsConfigured()) {
    return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: "Missing ECS config",
    });
  }

  try {
    const { desired: currentDesired, running } = await describeService();

    if (currentDesired >= 1) {
      return createResponse(HTTP_STATUS.OK, {
        status: "already_warm",
        running,
        desired: currentDesired,
      });
    }

    await scaleService(1);

    return createResponse(HTTP_STATUS.OK, {
      status: "warming",
      running: 0,
      desired: 1,
    });
  } catch (error) {
    return createInternalError("Warmup error", error);
  }
}
