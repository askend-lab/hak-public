// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { postJSON } from "./analyzeApi";
import { getVoiceModel } from "@/types/synthesis";
import { AuthStorage } from "@/features/auth/services/storage";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30;
const SYNTHESIZE_API_PATH = "/api/synthesize";
const STATUS_API_PATH = "/api/status";

type SynthesisStatus = "processing" | "ready" | "cached" | "error";

interface SynthesizeResponse {
  status: SynthesisStatus;
  cacheKey: string;
  audioUrl: string | null;
}

interface StatusResponse {
  status: SynthesisStatus;
  cacheKey: string;
  audioUrl: string | null;
  error?: string;
}

function getPollingDelay(attempt: number): number {
  return Math.min(POLL_INTERVAL_MS * Math.pow(2, Math.min(attempt, 3)), 8000);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

async function fetchStatus(cacheKey: string, signal?: AbortSignal): Promise<StatusResponse | null> {
  const response = await fetch(`${STATUS_API_PATH}/${cacheKey}`, signal ? { signal } : {});
  if (!response.ok) {throw new Error("Status check failed");}
  return response.json();
}

async function safeFetchStatus(cacheKey: string, signal?: AbortSignal): Promise<StatusResponse | null> {
  try { return await fetchStatus(cacheKey, signal); }
  catch (err) { if (err instanceof TypeError) {return null;} throw err; }
}

async function pollForAudio(cacheKey: string, signal?: AbortSignal): Promise<string> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    if (signal?.aborted) {throw new DOMException("Aborted", "AbortError");}
    const data = await safeFetchStatus(cacheKey, signal); // eslint-disable-line no-await-in-loop -- sequential polling
    if (!data) { await wait(getPollingDelay(i)); continue; } // eslint-disable-line no-await-in-loop -- transient error retry
    if (data.status === "ready" && data.audioUrl) {return data.audioUrl;}
    if (data.status === "error") {throw new Error(data.error ?? "Synthesis failed");}
    await wait(getPollingDelay(i)); // eslint-disable-line no-await-in-loop -- sequential polling delay
  }
  throw new Error("Synthesis timed out");
}

/**
 * Synthesize with automatic voice model selection.
 * Combines synthesizeWithPolling + getVoiceModel to avoid repeated pattern.
 */
export async function synthesizeAuto(text: string, signal?: AbortSignal): Promise<string> {
  return synthesizeWithPolling(text, getVoiceModel(text), signal);
}

export async function synthesizeWithPolling(
  text: string,
  voice: string,
  signal?: AbortSignal,
): Promise<string> {
  const token = AuthStorage.getAccessToken();
  const response = await postJSON(SYNTHESIZE_API_PATH, { text, voice }, {
    ...(signal && { signal }),
    ...(token && { headers: { Authorization: `Bearer ${token}` } }),
  });
  if (!response.ok) {throw new Error("Synthesis request failed");}

  const data: SynthesizeResponse = await response.json();

  if ((data.status === "cached" || data.status === "ready") && data.audioUrl) {
    return data.audioUrl;
  }

  return pollForAudio(data.cacheKey, signal);
}
