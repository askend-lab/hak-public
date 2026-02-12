// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  extractTokenText,
  createVariantFromMrf,
  isDuplicateVariant,
} from "./parser-helpers";
import { VmetajsonResponse, VmetajsonToken, VmetajsonMrf, Variant } from "./types";

function getTokens(response: VmetajsonResponse): VmetajsonToken[] {
  // Stryker disable next-line all: optional chaining is equivalent
  return response.annotations?.tokens ?? [];
}

function getMrfList(token: VmetajsonToken): VmetajsonMrf[] {
  // Stryker disable next-line all: optional chaining is equivalent
  return token.features?.mrf ?? [];
}

export function extractStressedText(
  response: VmetajsonResponse,
  originalText: string,
): string {
  const tokens = getTokens(response);
  const stressedTokens = tokens
    .map(extractTokenText)
    .filter((t): t is string => t !== null);

  return stressedTokens.length > 0 ? stressedTokens.join(" ") : originalText;
}

export function extractVariants(
  response: VmetajsonResponse,
  word: string,
): Variant[] {
  const tokens = getTokens(response);
  const variants: Variant[] = [];

  for (const tokenData of tokens) {
    const mrfList = getMrfList(tokenData);
    for (const mrfVariant of mrfList) {
      const variant = createVariantFromMrf(mrfVariant, word);
      if (variant && !isDuplicateVariant(variants, variant)) {
        variants.push(variant);
      }
    }
  }

  return variants;
}
