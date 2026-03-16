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

export function buildDescription(
  lemma: string,
  pos: string,
  fs: string,
  word: string,
): string {
  const parts: string[] = [];
  if (lemma && lemma.toLowerCase() !== word.toLowerCase()) parts.push(`lemma: ${lemma}`);
  if (pos && POS_MAP[pos]) parts.push(POS_MAP[pos]);
  if (fs) parts.push(fs);
  return parts.length > 0 ? parts.join(PARTS_SEPARATOR) : DEFAULT_DESCRIPTION;
}
