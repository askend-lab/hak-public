// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { CONTENT_TYPE_JSON } from "./analyzeApi";
import { getVoiceModel } from "@/types/synthesis";

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 30;
const SYNTHESIZE_API_PATH = "/api/synthesize";
const STATUS_API_PATH = "/api/status";

interface SynthesizeResponse {
  status: "processing" | "ready" | "cached";
  cacheKey: string;
  audioUrl: string | null;
}

interface StatusResponse {
  status: "processing" | "ready" | "error";
  cacheKey: string;
  audioUrl: string | null;
  error?: string;
}

async function pollForAudio(cacheKey: string): Promise<string> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const response = await fetch(`${STATUS_API_PATH}/${cacheKey}`);
    if (!response.ok) throw new Error("Status check failed");
    const data: StatusResponse = await response.json();

    if (data.status === "ready" && data.audioUrl) {
      return data.audioUrl;
    }
    if (data.status === "error") {
      throw new Error(data.error ?? "Synthesis failed");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error("Synthesis timed out");
}

/**
 * Synthesize with automatic voice model selection.
 * Combines synthesizeWithPolling + getVoiceModel to avoid repeated pattern.
 */
export async function synthesizeAuto(text: string): Promise<string> {
  return synthesizeWithPolling(text, getVoiceModel(text));
}

export async function synthesizeWithPolling(
  text: string,
  voice: string,
): Promise<string> {
  const response = await fetch(SYNTHESIZE_API_PATH, {
    method: "POST",
    headers: { "Content-Type": CONTENT_TYPE_JSON },
    body: JSON.stringify({ text, voice }),
  });
  if (!response.ok) throw new Error("Synthesis request failed");

  const data: SynthesizeResponse = await response.json();

  if ((data.status === "cached" || data.status === "ready") && data.audioUrl) {
    return data.audioUrl;
  }

  return pollForAudio(data.cacheKey);
}
