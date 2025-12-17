import { Variant, MorphologyInfo } from './types';

const POS_MAP: Record<string, string> = {
  'S': 'nimisõna',
  'V': 'tegusõna',
  'A': 'omadussõna',
  'D': 'määrsõna',
  'P': 'asesõna',
  'K': 'sidesõna',
  'J': 'kaassõna',
  'I': 'hüüdsõna',
  'Y': 'lühend'
};

export function formatPhoneticText(stem: string, ending: string): string {
  return ending && ending !== '0' ? `${stem}+${ending}` : stem;
}

export function extractTokenText(tokenData: { features?: { mrf?: Array<{ stem?: string; ending?: string }>; token?: string } }): string | null {
  const mrf = tokenData.features?.mrf;
  if (mrf && mrf.length > 0 && mrf[0].stem) {
    return formatPhoneticText(mrf[0].stem, mrf[0].ending || '');
  }
  return tokenData.features?.token || null;
}

export function buildDescription(lemma: string, pos: string, fs: string, word: string): string {
  const parts: string[] = [];
  if (lemma && lemma.toLowerCase() !== word.toLowerCase()) parts.push(`lemma: ${lemma}`);
  if (pos && POS_MAP[pos]) parts.push(POS_MAP[pos]);
  if (fs) parts.push(fs);
  return parts.length > 0 ? parts.join(', ') : 'tavaline';
}

export function createVariantFromMrf(mrfVariant: { stem?: string; ending?: string; pos?: string; lemma?: string; fs?: string }, word: string): Variant | null {
  if (!mrfVariant.stem) return null;
  
  const { stem, ending = '', pos = '', lemma = '', fs = '' } = mrfVariant;
  const text = formatPhoneticText(stem, ending);
  const description = buildDescription(lemma, pos, fs, word);
  
  return {
    text,
    description,
    morphology: { lemma, pos, fs, stem, ending } as MorphologyInfo
  };
}

export function isDuplicateVariant(variants: Variant[], candidate: Variant): boolean {
  return variants.some(v => v.text === candidate.text && v.description === candidate.description);
}
