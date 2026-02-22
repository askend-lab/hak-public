// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { components } from "../generated/merlin";

export type SynthesizeRequest = components["schemas"]["SynthesizeRequest"];
export type SynthesizeResponse = components["schemas"]["SynthesizeResponse"];
export type StatusResponse = components["schemas"]["StatusResponse"];
export type HealthResponse = components["schemas"]["HealthResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];

export interface ApiResult<T> {
  status: number;
  data?: T;
  error?: string;
}

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 30;

export class MerlinClient {
  constructor(private readonly baseUrl: string) {}

  async synthesize(request: SynthesizeRequest): Promise<ApiResult<SynthesizeResponse>> {
    return this.post<SynthesizeResponse>("/synthesize", request);
  }

  async status(cacheKey: string): Promise<ApiResult<StatusResponse>> {
    return this.get<StatusResponse>(`/status/${cacheKey}`);
  }

  async health(): Promise<ApiResult<HealthResponse>> {
    return this.get<HealthResponse>("/health");
  }

  /**
   * Synthesize text and poll until audio is ready.
   * Returns the final status response with audioUrl.
   */
  async synthesizeAndWait(
    request: SynthesizeRequest,
    maxAttempts = MAX_POLL_ATTEMPTS,
  ): Promise<ApiResult<StatusResponse>> {
    const synthResult = await this.synthesize(request);
    if (!synthResult.data) {return { status: synthResult.status, error: synthResult.error };}

    if (synthResult.data.status === "ready") {
      return {
        status: synthResult.status,
        data: {
          status: "ready",
          cacheKey: synthResult.data.cacheKey,
          audioUrl: synthResult.data.audioUrl,
        },
      };
    }

    const cacheKey = synthResult.data.cacheKey;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => { setTimeout(resolve, POLL_INTERVAL_MS); }); // eslint-disable-line no-await-in-loop -- sequential polling is intentional
      const statusResult = await this.status(cacheKey); // eslint-disable-line no-await-in-loop -- sequential polling
      if (!statusResult.data) {continue;}
      if (statusResult.data.status === "ready") {return statusResult;}
    }

    return { status: 408, error: "Synthesis timed out" };
  }

  private async get<T>(path: string): Promise<ApiResult<T>> {
    const res = await fetch(`${this.baseUrl}${path}`);
    const body = await res.json();
    if (!res.ok) {return { status: res.status, error: body.error ?? "Unknown error" };}
    return { status: res.status, data: body as T };
  }

  private async post<T>(path: string, payload: unknown): Promise<ApiResult<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) {return { status: res.status, error: body.error ?? "Unknown error" };}
    return { status: res.status, data: body as T };
  }
}
