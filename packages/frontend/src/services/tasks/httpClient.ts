import { API_CONFIG } from '../config';

import type { ApiResponse } from './types';

let authTokenGetter: (() => string | null) | null = null;

/**
 * Sets the function used to retrieve authentication tokens for API requests
 * @param getter - Function that returns the current auth token or null
 */
export function setAuthTokenGetter(getter: () => string | null): void {
  authTokenGetter = getter;
}

function buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
  const token = authTokenGetter?.();
  return {
    'Content-Type': 'application/json',
    ...(token !== null && token !== '' ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
}

/**
 * Makes an authenticated API request to the backend
 * @param endpoint - API endpoint path (e.g., '/save', '/get')
 * @param options - Fetch request options
 * @returns ApiResponse with success/error status and data
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = buildHeaders(options.headers as Record<string, string> | undefined);

  const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    return { success: false, error: `API error: ${String(response.status)}` };
  }

  const data = await response.json() as T;
  return { success: true, data };
}

export function unwrapResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
  if (!response.success || response.data === undefined) {
    return { success: false, error: response.error ?? 'Unknown error' };
  }
  return response;
}
