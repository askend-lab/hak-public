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

function isLemmaDifferent(lemma: string, word: string): boolean {
  return lemma !== "" && lemma.toLowerCase() !== word.toLowerCase();
}

function addLemmaPart(parts: string[], lemma: string, word: string): void {
  if (isLemmaDifferent(lemma, word)) parts.push(`lemma: ${lemma}`);
}

function addPosPart(parts: string[], pos: string): void {
  if (pos && POS_MAP[pos]) parts.push(POS_MAP[pos]);
}

export function buildDescription(
  lemma: string,
  pos: string,
  fs: string,
  word: string,
): string {
  const parts: string[] = [];
  addLemmaPart(parts, lemma, word);
  addPosPart(parts, pos);
  if (fs) parts.push(fs);
  return parts.length > 0 ? parts.join(", ") : "tavaline";
}
