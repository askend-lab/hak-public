// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { postJSON } from "./analyzeApi";
import { getVoiceModel } from "@/types/synthesis";
import { AuthStorage } from "@/features/auth/services/storage";
import { reportApiError } from "@/utils/reportApiError";
import { checkApiErrorStatus, dispatchApiError } from "@/utils/apiErrorEvents";

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
    window.dispatchEvent(new CustomEvent("auth-required"));
  }
}

function requireAuth(): string {
  const token = AuthStorage.getAccessToken();
  if (!token) {throw new AuthRequiredError();}
  return token;
}

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

function buildStatusOpts(token: string, signal?: AbortSignal): RequestInit {
  return {
    ...(signal && { signal }),
    headers: { Authorization: `Bearer ${token}` },
  };
}

async function fetchStatus(cacheKey: string, token: string, signal?: AbortSignal): Promise<StatusResponse | null> {
  const response = await fetch(`${STATUS_API_PATH}/${cacheKey}`, buildStatusOpts(token, signal));
  if (response.status === 401) {throw new AuthRequiredError();}
  checkApiErrorStatus(response.status);
  if (!response.ok) {
    reportApiError({ context: "Status check failed", status: response.status, url: `${STATUS_API_PATH}/${cacheKey}` });
    throw new Error("Status check failed");
  }
  return response.json();
}

async function safeFetchStatus(cacheKey: string, token: string, signal?: AbortSignal): Promise<StatusResponse | null> {
  try { return await fetchStatus(cacheKey, token, signal); }
  catch (err) { if (err instanceof TypeError) {return null;} throw err; }
}

function checkAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {throw new DOMException("Aborted", "AbortError");}
}

function handlePollResult(data: StatusResponse): string | null {
  if (data.status === "ready" && data.audioUrl) {return data.audioUrl;}
  if (data.status === "error") {throw new Error(data.error ?? "Synthesis failed");}
  return null;
}

async function pollForAudio(cacheKey: string, token: string, signal?: AbortSignal): Promise<string> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    checkAborted(signal);
    const data = await safeFetchStatus(cacheKey, token, signal); // eslint-disable-line no-await-in-loop -- sequential polling
    const url = data ? handlePollResult(data) : null;
    if (url) {return url;}
    await wait(getPollingDelay(i)); // eslint-disable-line no-await-in-loop -- sequential polling delay
  }
  const err = new Error("Synthesis timed out");
  reportApiError({ context: "Synthesis timed out", status: 0, url: SYNTHESIZE_API_PATH, body: `cacheKey=${cacheKey}, attempts=${MAX_POLL_ATTEMPTS}` });
  throw err;
}

/**
 * Synthesize with automatic voice model selection.
 * Combines synthesizeWithPolling + getVoiceModel to avoid repeated pattern.
 */
export async function synthesizeAuto(text: string, signal?: AbortSignal): Promise<string> {
  return synthesizeWithPolling(text, getVoiceModel(text), signal);
}

function buildSynthOpts(signal?: AbortSignal): Record<string, unknown> {
  const token = AuthStorage.getAccessToken();
  return {
    ...(signal && { signal }),
    ...(token && { headers: { Authorization: `Bearer ${token}` } }),
  };
}

function isReady(data: SynthesizeResponse): data is SynthesizeResponse & { audioUrl: string } {
  return (data.status === "cached" || data.status === "ready") && data.audioUrl !== null;
}

function checkSynthResponse(response: Response): void {
  if (response.status === 401) {throw new AuthRequiredError();}
  checkApiErrorStatus(response.status);
  if (!response.ok) {
    reportApiError({ context: "Synthesis request failed", status: response.status, url: SYNTHESIZE_API_PATH });
    dispatchApiError("synthesis-failed");
    throw new Error("Synthesis request failed");
  }
}

export async function synthesizeWithPolling(text: string, voice: string, signal?: AbortSignal): Promise<string> {
  const token = requireAuth();
  const response = await postJSON(SYNTHESIZE_API_PATH, { text, voice }, buildSynthOpts(signal));
  checkSynthResponse(response);
  const data: SynthesizeResponse = await response.json();
  if (isReady(data)) {return data.audioUrl;}
  return pollForAudio(data.cacheKey, token, signal);
}
