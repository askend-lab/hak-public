import { useState, useCallback } from 'react';
import { SentenceState, EditingTag, OpenTagMenu } from '@/types/synthesis';
import { stripPhoneticMarkers } from '@/utils/phoneticMarkers';

export interface UseSynthesisTagEditReturn {
  editingTag: EditingTag;
  openTagMenu: OpenTagMenu;
  setOpenTagMenu: React.Dispatch<React.SetStateAction<OpenTagMenu>>;
  handleDeleteTag: (sentenceId: string, tagIndex: number) => void;
  handleEditTag: (sentenceId: string, tagIndex: number) => void;
  handleEditTagChange: (value: string) => void;
  handleEditTagCommit: () => void;
  handleEditTagKeyDown: (e: React.KeyboardEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: string) => void;
  handleUseVariant: (variantText: string, selectedSentenceId: string | null, selectedTagIndex: number | null) => void;
  handleSentencePhoneticApply: (sentenceId: string, newPhoneticText: string) => void;
}

// eslint-disable-next-line max-lines-per-function
export function useSynthesisTagEdit(
  sentences: SentenceState[],
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>,
  sentencesRef: React.MutableRefObject<SentenceState[]>,
  synthesizeAndPlay: (id: string) => Promise<void>,
  synthesizeWithText: (id: string, text: string) => Promise<void>
): UseSynthesisTagEditReturn {
  const [editingTag, setEditingTag] = useState<EditingTag>(null);
  const [openTagMenu, setOpenTagMenu] = useState<OpenTagMenu>(null);

  const handleDeleteTag = useCallback((sentenceId: string, tagIndex: number): void => {
    setSentences(prev => prev.map(s => {
      if (s.id !== sentenceId) return s;
      const newTags = s.tags.filter((_, i) => i !== tagIndex);
      const newStressedTags = s.stressedTags?.filter((_, i) => i !== tagIndex);
      return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
    }));
    setOpenTagMenu(null);
  }, [setSentences]);

  const handleEditTag = useCallback((sentenceId: string, tagIndex: number): void => {
    const sentence = sentences.find(s => s.id === sentenceId);
    if (!sentence) return;
    setEditingTag({ sentenceId, tagIndex, value: sentence.tags[tagIndex] ?? '' });
    setOpenTagMenu(null);
  }, [sentences]);

  const handleEditTagChange = useCallback((value: string): void => {
    if (editingTag) setEditingTag({ ...editingTag, value });
  }, [editingTag]);

  const handleEditTagCommit = useCallback((): void => {
    if (!editingTag) return;
    const { sentenceId, tagIndex, value } = editingTag;
    const trimmedValue = value.trim();
    const newSentences = sentencesRef.current.map(s => {
      if (s.id !== sentenceId) return s;
      if (trimmedValue === '') {
        const newTags = s.tags.filter((_, i) => i !== tagIndex);
        const newStressedTags = s.stressedTags?.filter((_, i) => i !== tagIndex);
        return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
      }
      const newWords = trimmedValue.split(/\s+/).filter(w => w.length > 0);
      const newTags = [...s.tags.slice(0, tagIndex), ...newWords, ...s.tags.slice(tagIndex + 1)];
      const newStressedTags = s.stressedTags ? [...s.stressedTags.slice(0, tagIndex), ...newWords.map(() => undefined as unknown as string), ...s.stressedTags.slice(tagIndex + 1)].filter(t => t !== undefined) : undefined;
      return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
    });
    sentencesRef.current = newSentences;
    setSentences(newSentences);
    setEditingTag(null);
  }, [editingTag, sentencesRef, setSentences]);

  const handleEditTagKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingTag) { const sentenceId = editingTag.sentenceId; handleEditTagCommit(); synthesizeAndPlay(sentenceId); }
    } else if (e.key === ' ') { e.preventDefault(); handleEditTagCommit(); }
    else if (e.key === 'Escape') { e.preventDefault(); setEditingTag(null); }
  }, [editingTag, handleEditTagCommit, synthesizeAndPlay]);

   
  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string): void => {
    const sentence = sentences.find(s => s.id === id);
    if (!sentence) return;
    if (e.key === ' ' && sentence.currentInput.trim() && sentence.tags.length > 0) {
      e.preventDefault();
      const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
      const allTags = [...sentence.tags, ...inputWords];
      const newText = allTags.join(' ');
      const cacheInvalidated = newText !== sentence.text;
      setSentences(prev => prev.map(s => s.id === id ? { ...s, tags: allTags, currentInput: '', text: newText, ...(cacheInvalidated && { phoneticText: undefined, audioUrl: undefined }) } : s));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sentence.currentInput.trim()) {
        const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
        const allTags = [...sentence.tags, ...inputWords];
        const fullText = allTags.join(' ');
        setSentences(prev => prev.map(s => s.id === id ? { ...s, tags: allTags, currentInput: '', text: fullText, phoneticText: undefined, audioUrl: undefined } : s));
        synthesizeWithText(id, fullText);
      } else if (sentence.tags.length > 0) { synthesizeAndPlay(id); }
    } else if (e.key === 'Backspace' && !sentence.currentInput && sentence.tags.length > 0) {
      e.preventDefault();
      setSentences(prev => prev.map(s => {
        if (s.id !== id) return s;
        const newTags = s.tags.slice(0, -1);
        return { ...s, tags: newTags, currentInput: s.tags[s.tags.length - 1] ?? '', text: newTags.join(' '), phoneticText: undefined, audioUrl: undefined };
      }));
    }
  }, [sentences, synthesizeAndPlay, synthesizeWithText, setSentences]);

  const handleUseVariant = useCallback((variantText: string, selectedSentenceId: string | null, selectedTagIndex: number | null): void => {
    if (selectedSentenceId !== null && selectedTagIndex !== null) {
      setSentences(prev => prev.map(s => {
        if (s.id !== selectedSentenceId) return s;
        const newStressedTags = s.stressedTags ? [...s.stressedTags] : [...s.tags];
        newStressedTags[selectedTagIndex] = variantText;
        return { ...s, stressedTags: newStressedTags, phoneticText: newStressedTags.join(' '), audioUrl: undefined };
      }));
    }
  }, [setSentences]);

  const handleSentencePhoneticApply = useCallback((sentenceId: string, newPhoneticText: string): void => {
    setSentences(prev => prev.map(s => {
      if (s.id !== sentenceId) return s;
      const newPlainText = stripPhoneticMarkers(newPhoneticText) || '';
      const newTags = newPlainText.trim().split(/\s+/).filter(w => w.length > 0);
      const newStressedTags = newPhoneticText.trim().split(/\s+/).filter(w => w.length > 0);
      return { ...s, text: newPlainText, tags: newTags, phoneticText: newPhoneticText, stressedTags: newStressedTags, audioUrl: undefined };
    }));
  }, [setSentences]);

  return { editingTag, openTagMenu, setOpenTagMenu, handleDeleteTag, handleEditTag, handleEditTagChange, handleEditTagCommit, handleEditTagKeyDown, handleKeyDown, handleUseVariant, handleSentencePhoneticApply };
}
