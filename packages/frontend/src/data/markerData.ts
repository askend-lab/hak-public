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
  /** Detailed explanation of the marker */
  description: string;
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
    description:
      "Ühesilbilised sõnad on automaatselt kolmandas vältes. Kui sõnas on kaks või rohkem silpi, siis reeglipärastel juhtudel on sõnadel kolmandas vältes esimene silp pikem kui teine. Hääle kõrgus langeb järsult juba esimeses silbis.",
    examples: ["k`ätte", "par`ool"],
  },
  {
    symbol: "´",
    name: "ebareeglipärase rõhu märk",
    rule: "Kasutatakse ainult kui rõhk ei ole reeglipärane ehk esimesel silbil.",
    description:
      "Rõhutatakse silpi, millel on märgitud rõhukriips (nt rak´ett, baler´iin, dial´ektika). Reeglipäraselt on eesti keeles rõhk sõna esimesel silbil ja sellisel juhul seda eraldi ei märgita.",
    examples: ["selj´anka", "dial´ektika"],
  },
  {
    symbol: "'",
    name: "peenendus (palatalisatsioon)",
    rule: "Võib paikneda konsonantide d, l, n, s ja t järel.",
    description:
      "Apostroof (') d, l, n, s või t järel tähendab, et seda hääldatakse peenendatult. Sarnane vene keele pehmendusele.",
    examples: ["pad'ja", "p`an't"],
  },
  {
    symbol: "+",
    name: "liitsõnapiir",
    rule: "Märkida liitsõnas liitsõnapiirile.",
    description:
      "Kokku kirjutatud liitsõnade osiste piire märgitakse plussiga (jää+äär, kerge+jõustiku+maa+ilma+meister).",
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
