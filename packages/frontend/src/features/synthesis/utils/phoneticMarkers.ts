// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Phonetic marker transformation utilities
 *
 * Transforms Vabamorf phonetic markers to simplified UI-friendly markers
 * while preserving the original text for synthesis
 */

/**
 * Mapping from Vabamorf markers to UI display markers
 * Only these markers will be shown in the UI, all others are omitted
 */
const MARKER_MAPPING: Record<string, string> = {
  "<": "`", // Vabamorf < becomes ` in UI
  "?": "´", // Vabamorf ? becomes ´ in UI
  "]": "'", // Vabamorf ] becomes ' in UI
  _: "+", // Vabamorf _ becomes + in UI
};

/**
 * Reverse mapping from UI markers back to Vabamorf markers
 */
const REVERSE_MARKER_MAPPING: Record<string, string> = {
  "`": "<",
  "´": "?",
  "'": "]",
  "+": "_",
};

/**
 * Set of Vabamorf markers that should be kept (those in the mapping)
 */
const VABAMORF_MARKERS_TO_KEEP = new Set(Object.keys(MARKER_MAPPING));

/**
 * Transforms Vabamorf phonetic text to UI-friendly display text
 *
 * Rules:
 * - Keeps only mapped markers and transforms them
 * - Omits all other Vabamorf markers
 *
 * @param vabamorfText - Text with Vabamorf phonetic markers
 * @returns Text with simplified UI markers
 *
 * @example
 * transformToUI('m<ee_s') // returns 'm`ee+s'
 * transformToUI('k?uu]l') // returns 'kuu´l'
 */
export function transformToUI(vabamorfText: string | null): string | null {
  if (!vabamorfText) return vabamorfText;

  let result = "";

  for (const char of vabamorfText) {
    if (VABAMORF_MARKERS_TO_KEEP.has(char)) {
      // Transform the marker to UI version
      result += MARKER_MAPPING[char];
    } else if (isVabamorfMarker(char)) {
      // Omit this Vabamorf marker (not in our mapping)
      continue;
    } else {
      // Keep regular characters
      result += char;
    }
  }

  return result;
}

/**
 * Transforms UI display text back to Vabamorf format
 * Used when user edits phonetic text in the UI
 *
 * @param uiText - Text with UI markers
 * @returns Text with Vabamorf markers
 *
 * @example
 * transformToVabamorf('m`ee+s') // returns 'm<ee_s'
 */
export function transformToVabamorf(uiText: string | null): string | null {
  if (!uiText) return uiText;

  let result = "";

  for (const char of uiText) {
    if (char in REVERSE_MARKER_MAPPING) {
      // Transform UI marker back to Vabamorf
      result += REVERSE_MARKER_MAPPING[char];
    } else {
      // Keep everything else as-is
      result += char;
    }
  }

  return result;
}

/**
 * Checks if a character is a Vabamorf phonetic marker
 *
 * Common Vabamorf markers (not exhaustive):
 * < - kolmas välde (third pitch accent)
 * ? - rõhuline silp (stressed syllable)
 * ] - palatalisatsioon (palatalization)
 * ~ - n-k eraldus (n-k separation)
 * + - morfeemi piir (morpheme boundary)
 * _ - liitsõna piir (compound word boundary)
 * = - tühik ühendites (space in compounds)
 * [ - käändelõpu eraldus (declension suffix separation)
 * ' - primary stress
 * . - syllable boundary
 *
 * @param char - Character to check
 * @returns true if the character is a known Vabamorf marker
 */
export function isVabamorfMarker(char: string): boolean {
  const vabamorfMarkers = [
    "<",
    "?",
    "]",
    "~",
    "+",
    "_",
    "=",
    "[",
    "'",
    ".",
    "´",
    "`",
  ];
  return vabamorfMarkers.includes(char);
}

/**
 * Removes all phonetic markers from text to get plain text
 * Useful when converting edited phonetic text back to display text
 *
 * @param phoneticText - Text with Vabamorf phonetic markers
 * @returns Plain text without any markers
 *
 * @example
 * stripPhoneticMarkers('m<ee_s k<au`p') // returns 'mees kaup'
 * stripPhoneticMarkers('tere maa`ilm') // returns 'tere maailm'
 */
export function stripPhoneticMarkers(
  phoneticText: string | null,
): string | null {
  if (!phoneticText) return phoneticText;

  let result = "";

  for (const char of phoneticText) {
    if (!isVabamorfMarker(char)) {
      // Keep only non-marker characters
      result += char;
    }
  }

  return result;
}

/**
 * Get the UI-friendly symbols for the symbol toolbar
 * Returns the symbols that users can insert when editing phonetic text
 */
export function getUISymbols(): Array<{
  symbol: string;
  label: string;
  description: string;
}> {
  return [
    { symbol: "`", label: "Kolmas välde", description: "Third pitch accent" },
    { symbol: "´", label: "Rõhuline silp", description: "Stressed syllable" },
    { symbol: "'", label: "Palatalisatsioon", description: "Palatalization" },
    {
      symbol: "+",
      label: "Liitsõna piir",
      description: "Compound word boundary",
    },
  ];
}
