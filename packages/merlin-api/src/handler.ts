// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  ECSClient,
  UpdateServiceCommand,
  DescribeServicesCommand,
} from "@aws-sdk/client-ecs";
import { createHash } from "crypto";

import {
  createResponse,
  createInternalError,
  HTTP_STATUS,
  type LambdaResponse,
} from "./response";
import { getAwsRegion, VOICE_DEFAULTS } from "./env";
import { checkS3Cache, buildAudioUrl } from "./s3";
import { sendToQueue } from "./sqs";

const ecsClient = new ECSClient({ region: getAwsRegion() });

interface SynthesizeRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
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

const WARMUP_COOLDOWN_MS = 60_000;
let lastWarmupTime = 0;

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

export async function synthesize(event: {
  body?: string;
}): Promise<LambdaResponse> {
  try {
    const body: SynthesizeRequest = JSON.parse(event.body ?? "{}");

    if (typeof body.text !== "string" || body.text === "") {
      return createResponse(HTTP_STATUS.BAD_REQUEST, {
        error: "Missing text field",
      });
    }

    const voice = body.voice ?? VOICE_DEFAULTS.voice;
    const speed = body.speed ?? VOICE_DEFAULTS.speed;
    const pitch = body.pitch ?? VOICE_DEFAULTS.pitch;
    const cacheKey = generateCacheKey(body.text, voice, speed, pitch);

    const cached = await checkS3Cache(cacheKey);
    if (cached) {
      return createResponse(HTTP_STATUS.OK, {
        status: "ready",
        cacheKey,
        audioUrl: buildAudioUrl(cacheKey),
      });
    }

    await sendToQueue({
      text: body.text,
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

export async function status(event: {
  pathParameters?: { cacheKey?: string };
}): Promise<LambdaResponse> {
  try {
    const cacheKey = event.pathParameters?.cacheKey;

    if (!cacheKey) {
      return createResponse(HTTP_STATUS.BAD_REQUEST, {
        error: "Missing cacheKey",
      });
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
  return createResponse(HTTP_STATUS.OK, { status: "ok", version: "1.0.0" });
}

export async function warmup(): Promise<LambdaResponse> {
  const rateLimited = checkRateLimit();
  if (rateLimited) return rateLimited;

  const cluster = process.env.ECS_CLUSTER ?? "";
  const service = process.env.ECS_SERVICE ?? "";

  if (!cluster || !service) {
    return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: "Missing ECS config",
    });
  }

  try {
    const describe = await ecsClient.send(
      new DescribeServicesCommand({
        cluster,
        services: [service],
      }),
    );

    const currentDesired = describe.services?.[0]?.desiredCount ?? 0;
    const running = describe.services?.[0]?.runningCount ?? 0;

    if (currentDesired >= 1) {
      return createResponse(HTTP_STATUS.OK, {
        status: "already_warm",
        running,
        desired: currentDesired,
      });
    }

    await ecsClient.send(
      new UpdateServiceCommand({
        cluster,
        service,
        desiredCount: 1,
      }),
    );

    return createResponse(HTTP_STATUS.OK, {
      status: "warming",
      running: 0,
      desired: 1,
    });
  } catch (error) {
    return createInternalError("Warmup error", error);
  }
}
