import { VmetajsonResponse, Variant, MorphologyInfo } from './types';

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

export function extractStressedText(response: VmetajsonResponse, originalText: string): string {
  const stressedTokens: string[] = [];

  if (response.annotations?.tokens) {
    for (const tokenData of response.annotations.tokens) {
      if (tokenData.features?.mrf && tokenData.features.mrf.length > 0) {
        const firstVariant = tokenData.features.mrf[0];
        if (firstVariant.stem) {
          const stem = firstVariant.stem;
          const ending = firstVariant.ending || '';
          if (ending && ending !== '0') {
            stressedTokens.push(`${stem}+${ending}`);
          } else {
            stressedTokens.push(stem);
          }
        } else if (tokenData.features.token) {
          stressedTokens.push(tokenData.features.token);
        }
      } else if (tokenData.features?.token) {
        stressedTokens.push(tokenData.features.token);
      }
    }
  }

  return stressedTokens.length > 0 ? stressedTokens.join(' ') : originalText;
}

export function extractVariants(response: VmetajsonResponse, word: string): Variant[] {
  const variants: Variant[] = [];

  if (response.annotations?.tokens) {
    for (const tokenData of response.annotations.tokens) {
      if (tokenData.features?.mrf) {
        for (const mrfVariant of tokenData.features.mrf) {
          if (mrfVariant.stem) {
            const stem = mrfVariant.stem;
            const ending = mrfVariant.ending || '';
            const pos = mrfVariant.pos || '';
            const lemma = mrfVariant.lemma || '';
            const fs = mrfVariant.fs || '';

            const phoneticText = ending && ending !== '0' 
              ? `${stem}+${ending}` 
              : stem;

            const descriptionParts: string[] = [];

            if (lemma && lemma.toLowerCase() !== word.toLowerCase()) {
              descriptionParts.push(`lemma: ${lemma}`);
            }

            if (pos && POS_MAP[pos]) {
              descriptionParts.push(POS_MAP[pos]);
            }

            if (fs) {
              descriptionParts.push(fs);
            }

            const description = descriptionParts.length > 0 
              ? descriptionParts.join(', ') 
              : 'tavaline';

            const morphology: MorphologyInfo = {
              lemma,
              pos,
              fs,
              stem,
              ending
            };

            const isDuplicate = variants.some(
              v => v.text === phoneticText && v.description === description
            );

            if (!isDuplicate) {
              variants.push({
                text: phoneticText,
                description,
                morphology
              });
            }
          }
        }
      }
    }
  }

  return variants;
}
