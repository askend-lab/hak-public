// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Shared utility for calling the /api/analyze endpoint
 * Consolidates 5 duplicate fetch calls across:
 * - useVariantsPanel.ts (2 calls)
 * - useSynthesis.ts (2 calls)
 * - usePhoneticPanel.ts (1 call)
 */
import { logger } from "@hak/shared";
import { CONTENT_TYPE_JSON } from "@/config/constants";

export { CONTENT_TYPE_JSON };
export const ANALYZE_API_PATH = "/api/analyze";
export const VARIANTS_API_PATH = "/api/variants";

/**
 * Sends a POST request with a JSON body.
 * Reduces repeated fetch + Content-Type + JSON.stringify boilerplate.
 */
export function postJSON(
  url: string,
  body: Record<string, unknown>,
  options?: RequestInit,
): Promise<Response> {
  const { headers: extraHeaders, ...rest } = options ?? {};
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": CONTENT_TYPE_JSON, ...extraHeaders as Record<string, string> },
    body: JSON.stringify(body),
    ...rest,
  });
}

export interface AnalyzeResponse {
  stressedText: string;
}

/**
 * Analyzes text and returns the stressed/phonetic version.
 * @param text - The text to analyze
 * @returns The stressed text, or null if analysis fails
 */
export async function analyzeText(text: string): Promise<string | null> {
  try {
    const response = await postJSON(ANALYZE_API_PATH, { text });

    if (!response.ok) {
      logger.error(`[Analyze] HTTP ${response.status} for text: "${text.slice(0, 50)}"`);
      return null;
    }

    const data: AnalyzeResponse = await response.json();
    return data.stressedText || null;
  } catch (error) {
    logger.error("[Analyze] Network error:", error);
    return null;
  }
}

/**
 * Analyzes text and throws on failure.
 * Use when you need to handle the error explicitly.
 */
export async function analyzeTextOrThrow(text: string): Promise<string> {
  const response = await postJSON(ANALYZE_API_PATH, { text });

  if (!response.ok) {
    throw new Error("Analysis failed");
  }

  const data: AnalyzeResponse = await response.json();
  return data.stressedText || text;
}
