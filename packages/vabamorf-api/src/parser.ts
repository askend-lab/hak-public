// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  extractTokenText,
  createVariantFromMrf,
  isDuplicateVariant,
} from "./parser-helpers";
import { VmetajsonResponse, Variant } from "./types";

export function extractStressedText(
  response: VmetajsonResponse,
  originalText: string,
): string {
  // Stryker disable next-line all: optional chaining is equivalent
  const tokens = response.annotations?.tokens ?? [];
  const stressedTokens = tokens
    .map(extractTokenText)
    .filter((t): t is string => t !== null);

  return stressedTokens.length > 0 ? stressedTokens.join(" ") : originalText;
}

export function extractVariants(
  response: VmetajsonResponse,
  word: string,
): Variant[] {
  // Stryker disable next-line all: optional chaining is equivalent
  const tokens = response.annotations?.tokens ?? [];
  const variants: Variant[] = [];

  for (const tokenData of tokens) {
    // Stryker disable next-line all: optional chaining is equivalent
    const mrfList = tokenData.features?.mrf ?? [];
    for (const mrfVariant of mrfList) {
      const variant = createVariantFromMrf(mrfVariant, word);
      if (variant && !isDuplicateVariant(variants, variant)) {
        variants.push(variant);
      }
    }
  }

  return variants;
}
