import { useCallback } from 'react';
import { SentenceState } from '@/types/synthesis';

type SentenceSetter = React.Dispatch<React.SetStateAction<SentenceState[]>>;
type TagTransformer = (sentence: SentenceState) => Partial<SentenceState>;

/**
 * Helper hook for updating sentence tags
 * Consolidates duplicate tag manipulation patterns in useSynthesis
 */
export function useTagUpdater(setSentences: SentenceSetter): {
  updateSentenceTags: (sentenceId: string, transformer: TagTransformer) => void;
  deleteTag: (sentenceId: string, tagIndex: number) => void;
  replaceTag: (sentenceId: string, tagIndex: number, newWords: string[]) => void;
  updateStressedTag: (sentenceId: string, tagIndex: number, variantText: string) => void;
} {
  /**
   * Update a single sentence's tags using a transformer function
   */
  const updateSentenceTags = useCallback((
    sentenceId: string,
    transformer: TagTransformer
  ) => {
    setSentences(prev => prev.map(s => {
      if (s.id !== sentenceId) return s;
      const updates = transformer(s);
      return { ...s, ...updates };
    }));
  }, [setSentences]);

  /**
   * Delete a tag at a specific index
   */
  const deleteTag = useCallback((sentenceId: string, tagIndex: number) => {
    updateSentenceTags(sentenceId, (s) => {
      const newTags = s.tags.filter((_, i) => i !== tagIndex);
      const newStressedTags = s.stressedTags?.filter((_, i) => i !== tagIndex);
      return {
        tags: newTags,
        text: newTags.join(' '),
        stressedTags: newStressedTags,
        phoneticText: undefined,
        audioUrl: undefined
      };
    });
  }, [updateSentenceTags]);

  /**
   * Replace a tag at a specific index with new words
   */
  const replaceTag = useCallback((
    sentenceId: string,
    tagIndex: number,
    newWords: string[]
  ) => {
    updateSentenceTags(sentenceId, (s) => {
      const newTags = [...s.tags.slice(0, tagIndex), ...newWords, ...s.tags.slice(tagIndex + 1)];
      const newStressedTags = s.stressedTags
        ? [...s.stressedTags.slice(0, tagIndex), ...newWords.map(() => undefined as unknown as string), ...s.stressedTags.slice(tagIndex + 1)].filter(t => t !== undefined)
        : undefined;
      return {
        tags: newTags,
        text: newTags.join(' '),
        stressedTags: newStressedTags,
        phoneticText: undefined,
        audioUrl: undefined
      };
    });
  }, [updateSentenceTags]);

  /**
   * Update stressed tag at a specific index (for phonetic variants)
   */
  const updateStressedTag = useCallback((
    sentenceId: string,
    tagIndex: number,
    variantText: string
  ) => {
    updateSentenceTags(sentenceId, (s) => {
      const newStressedTags = s.stressedTags ? [...s.stressedTags] : [...s.tags];
      newStressedTags[tagIndex] = variantText;
      return {
        stressedTags: newStressedTags,
        phoneticText: newStressedTags.join(' '),
        audioUrl: undefined
      };
    });
  }, [updateSentenceTags]);

  return {
    updateSentenceTags,
    deleteTag,
    replaceTag,
    updateStressedTag
  };
}
