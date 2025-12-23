import { buildDescription } from './description-builder';
import { Variant, MorphologyInfo } from './types';

export { buildDescription };

export function formatPhoneticText(stem: string, ending: string): string {
  return ending && ending !== '0' ? `${stem}+${ending}` : stem;
}

function getFirstMrfStem(mrf: { stem?: string; ending?: string }[] | undefined): { stem: string; ending: string } | null {
  if (!mrf || mrf.length === 0 || !mrf[0].stem) return null;
  return { stem: mrf[0].stem, ending: mrf[0].ending || '' };
}

export function extractTokenText(tokenData: { features?: { mrf?: { stem?: string; ending?: string }[]; token?: string } }): string | null {
  const first = getFirstMrfStem(tokenData.features?.mrf);
  if (first) return formatPhoneticText(first.stem, first.ending);
  return tokenData.features?.token || null;
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
