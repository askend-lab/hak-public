// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

interface MarkerTag {
  tag: string;
  type: string;
}

const MARKER_RULES: Array<{ char: string; tag: string; type: string }> = [
  { char: "<", tag: "kolmas välde", type: "phonetic" },
  { char: "?", tag: "ebareeglipärane rõhk", type: "phonetic" },
  { char: "]", tag: "peenendus", type: "phonetic" },
  { char: "_", tag: "liitsõna piir", type: "boundary" },
];

export const parsePhoneticMarkers = (text: string): MarkerTag[] => {
  const found = MARKER_RULES.filter((r) => text.includes(r.char)).map((r) => ({ tag: r.tag, type: r.type }));
  return found.length > 0 ? found : [{ tag: "rõhk esimesel silbil", type: "default" }];
};

const EXPLANATION_PATTERNS: Array<{ regex: RegExp; fmt: (m: string) => string }> = [
  { regex: /`([a-zõäöüšž])/gi, fmt: (m) => `"${m.toUpperCase()}" on pikk` },
  { regex: /´([a-zõäöüšž])/gi, fmt: (m) => `Rõhk on "${m}" peal` },
  { regex: /([a-zõäöüšž])'/gi, fmt: (m) => `"${m.toUpperCase()}" on pehme hääldusega` },
];

function collectRegexMatches(text: string): string[] {
  const results: string[] = [];
  for (const { regex, fmt } of EXPLANATION_PATTERNS) {
    let match;
    while ((match = regex.exec(text)) !== null) { results.push(fmt(match[1] ?? "")); }
  }
  if (text.includes("+")) { results.push("Põhirõhk esimesel osal – häälda seda nagu eraldi sõna"); }
  return results;
}

export const generatePronunciationExplanation = (uiText: string): string => {
  const explanations = collectRegexMatches(uiText);
  return explanations.length > 0 ? explanations.join(". ") : "Häälda nii, nagu on kirjutatud – aga kuula pikkust ja pehmust";
};
