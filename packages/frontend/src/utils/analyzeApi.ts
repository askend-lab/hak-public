/**
 * Shared utility for calling the /api/analyze endpoint
 * Consolidates 5 duplicate fetch calls across:
 * - useVariantsPanel.ts (2 calls)
 * - useSynthesis.ts (2 calls)
 * - usePhoneticPanel.ts (1 call)
 */

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
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      return null;
    }

    const data: AnalyzeResponse = await response.json();
    return data.stressedText || null;
  } catch (error) {
    console.error('Failed to analyze text:', error);
    return null;
  }
}

/**
 * Analyzes text and throws on failure.
 * Use when you need to handle the error explicitly.
 */
export async function analyzeTextOrThrow(text: string): Promise<string> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  const data: AnalyzeResponse = await response.json();
  return data.stressedText || text;
}
