// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Shared phonetic marker definitions used across the application.
 * Used by MarkerTooltip and marker toolbars in CustomVariantForm and SentencePhoneticPanel.
 */

export interface MarkerDefinition {
  /** The phonetic symbol character */
  symbol: string;
  /** Full descriptive name */
  name: string;
  /** Usage rule/description */
  rule: string;
  /** Example words demonstrating usage */
  examples: string[];
}

/**
 * All phonetic markers available in the application.
 */
export const markers: MarkerDefinition[] = [
  {
    symbol: "`",
    name: "kolmas välde",
    rule: "Paikneb kolmandavältelise silbi esimese täishääliku ees.",
    examples: ["k`ätte", "par`ool"],
  },
  {
    symbol: "´",
    name: "ebareeglipärase rõhu märk",
    rule: "Kasutatakse ainult kui rõhk ei ole reeglipärane ehk esimesel silbil.",
    examples: ["selj´anka", "dial´ektika"],
  },
  {
    symbol: "'",
    name: "peenendus",
    rule: "Võib paikneda konsonantide d, l, n, s ja t järel.",
    examples: ["pad'ja", "p`an't"],
  },
  {
    symbol: "+",
    name: "liitsõnapiir",
    rule: "Märgib liitsõna osade vahelist piiri.",
    examples: ["maja+uks", "auto+juht"],
  },
];

/**
 * Get a marker by its symbol
 */
export function getMarkerBySymbol(
  symbol: string,
): MarkerDefinition | undefined {
  return markers.find((m) => m.symbol === symbol);
}
