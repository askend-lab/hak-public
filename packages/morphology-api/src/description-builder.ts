// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

const DEFAULT_DESCRIPTION = "tavaline";
const PARTS_SEPARATOR = ", ";

const POS_MAP: Record<string, string> = {
  S: "nimisõna",
  V: "tegusõna",
  A: "omadussõna",
  D: "määrsõna",
  P: "asesõna",
  K: "sidesõna",
  J: "kaassõna",
  I: "hüüdsõna",
  Y: "lühend",
};

interface DescriptionInput {
  readonly lemma: string;
  readonly pos: string;
  readonly fs: string;
}

export function buildDescription(input: DescriptionInput, word: string): string {
  const parts: string[] = [];
  if (input.lemma && input.lemma.toLowerCase() !== word.toLowerCase()) {parts.push(`lemma: ${input.lemma}`);}
  const posLabel = input.pos ? POS_MAP[input.pos] : undefined;
  if (posLabel) {parts.push(posLabel);}
  if (input.fs) {parts.push(input.fs);}
  return parts.length > 0 ? parts.join(PARTS_SEPARATOR) : DEFAULT_DESCRIPTION;
}
