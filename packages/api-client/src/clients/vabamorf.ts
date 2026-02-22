// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { components } from "../generated/vabamorf";

export type AnalyzeRequest = components["schemas"]["AnalyzeRequest"];
export type AnalyzeResponse = components["schemas"]["AnalyzeResponse"];
export type VariantsRequest = components["schemas"]["VariantsRequest"];
export type VariantsResponse = components["schemas"]["VariantsResponse"];
export type HealthResponse = components["schemas"]["HealthResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];

export interface ApiResult<T> {
  status: number;
  data?: T;
  error?: string;
}

export class VabamorfClient {
  constructor(private readonly baseUrl: string) {}

  async analyze(request: AnalyzeRequest): Promise<ApiResult<AnalyzeResponse>> {
    return this.post<AnalyzeResponse>("/api/analyze", request);
  }

  async variants(request: VariantsRequest): Promise<ApiResult<VariantsResponse>> {
    return this.post<VariantsResponse>("/api/variants", request);
  }

  async health(): Promise<ApiResult<HealthResponse>> {
    return this.get<HealthResponse>("/api/health");
  }

  private async get<T>(path: string): Promise<ApiResult<T>> {
    const res = await fetch(`${this.baseUrl}${path}`);
    const body = await res.json();
    if (!res.ok) return { status: res.status, error: body.error ?? "Unknown error" };
    return { status: res.status, data: body as T };
  }

  private async post<T>(path: string, payload: unknown): Promise<ApiResult<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) return { status: res.status, error: body.error ?? "Unknown error" };
    return { status: res.status, data: body as T };
  }
}
