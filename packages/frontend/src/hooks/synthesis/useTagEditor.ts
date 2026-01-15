/* eslint-disable max-lines-per-function */
import { useCallback } from 'react';
import { SentenceState } from '@/types/synthesis';

export function useTagEditor(
  getSentence: (id: string) => SentenceState | undefined,
  updateSentence: (id: string, updates: Partial<SentenceState>) => void
): {
  handleInputBlur: (id: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: string, onSynthesize: (id: string, text?: string) => void) => void;
  addTagsToSentence: (id: string, currentInput: string) => string | null;
  removeLastTag: (id: string) => void;
} {
  const handleInputBlur = useCallback((id: string) => {
    const sentence = getSentence(id);
    if (!sentence || !sentence.currentInput.trim() || sentence.tags.length === 0) return;
    
    const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
    const allTags = [...sentence.tags, ...inputWords];
    const newText = allTags.join(' ');
    
    updateSentence(id, {
      tags: allTags,
      currentInput: '',
      text: newText,
      phoneticText: undefined,
      audioUrl: undefined
    });
  }, [getSentence, updateSentence]);

  const addTagsToSentence = useCallback((id: string, currentInput: string) => {
    const sentence = getSentence(id);
    if (!sentence) return null;

    const inputWords = currentInput.trim().split(/\s+/).filter(word => word.length > 0);
    const allTags = [...sentence.tags, ...inputWords];
    const newText = allTags.join(' ');
    const cacheInvalidated = newText !== sentence.text;

    const updates: Partial<SentenceState> = {
      tags: allTags,
      currentInput: '',
      text: newText
    };

    if (cacheInvalidated) {
      updates.phoneticText = undefined;
      updates.audioUrl = undefined;
    }

    updateSentence(id, updates);
    return newText;
  }, [getSentence, updateSentence]);

  const removeLastTag = useCallback((id: string) => {
    const sentence = getSentence(id);
    if (!sentence || sentence.tags.length === 0) return;

    const newTags = sentence.tags.slice(0, -1);
    const removedTag = sentence.tags[sentence.tags.length - 1] ?? '';

    updateSentence(id, {
      tags: newTags,
      currentInput: removedTag,
      text: newTags.join(' '),
      phoneticText: undefined,
      audioUrl: undefined
    });
  }, [getSentence, updateSentence]);

  const handleKeyDown = useCallback((
    e: React.KeyboardEvent,
    id: string,
    onSynthesize: (id: string, text?: string) => void
  ) => {
    const sentence = getSentence(id);
    if (!sentence) return;

    if (e.key === ' ' && sentence.currentInput.trim() && sentence.tags.length > 0) {
      e.preventDefault();
      addTagsToSentence(id, sentence.currentInput);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sentence.currentInput.trim()) {
        const fullText = addTagsToSentence(id, sentence.currentInput);
        if (fullText) {
          onSynthesize(id, fullText);
        }
      } else if (sentence.tags.length > 0) {
        onSynthesize(id);
      }
    } else if (e.key === 'Backspace' && !sentence.currentInput && sentence.tags.length > 0) {
      e.preventDefault();
      removeLastTag(id);
    }
  }, [getSentence, addTagsToSentence, removeLastTag]);

  return {
    handleInputBlur,
    handleKeyDown,
    addTagsToSentence,
    removeLastTag
  };
}
