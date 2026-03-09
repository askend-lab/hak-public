// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { ERROR_STRINGS } from "@/config/ui-strings";

export type ApiErrorType = "rate-limit" | "service-busy" | "synthesis-failed";

interface ApiErrorDetail {
  type: ApiErrorType;
  message: string;
  description: string;
}

const ERROR_MAP: Record<ApiErrorType, { message: string; description: string }> = {
  "rate-limit": { message: ERROR_STRINGS.RATE_LIMIT, description: ERROR_STRINGS.RATE_LIMIT_DESC },
  "service-busy": { message: ERROR_STRINGS.SERVICE_BUSY, description: ERROR_STRINGS.SERVICE_BUSY_DESC },
  "synthesis-failed": { message: ERROR_STRINGS.SYNTHESIS_FAILED, description: ERROR_STRINGS.SYNTHESIS_FAILED_DESC },
};

export const API_ERROR_EVENT = "api-error" as const;

export function dispatchApiError(type: ApiErrorType): void {
  const info = ERROR_MAP[type];
  window.dispatchEvent(new CustomEvent<ApiErrorDetail>(API_ERROR_EVENT, {
    detail: { type, message: info.message, description: info.description },
  }));
}

export function getApiErrorDetail(event: Event): ApiErrorDetail | null {
  if (!(event instanceof CustomEvent)) {return null;}
  return (event as CustomEvent<ApiErrorDetail>).detail ?? null;
}

export function checkApiErrorStatus(status: number): void {
  if (status === 429) {dispatchApiError("rate-limit"); throw new Error("Rate limit exceeded");}
  if (status === 503) {dispatchApiError("service-busy"); throw new Error("Service unavailable");}
}
