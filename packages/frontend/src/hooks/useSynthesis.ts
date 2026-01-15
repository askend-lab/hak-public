import { useState, useCallback, useRef } from 'react';
import { EditingTag, OpenTagMenu } from '@/types/synthesis';
import { stripPhoneticMarkers } from '@/utils/phoneticMarkers';
import { synthesizeWithPolling } from '@/utils/synthesize';
import { getVoiceModel } from '@/types/synthesis';
import { useSynthesisOrchestrator } from './synthesis/useSynthesisOrchestrator';
import { useTagEditor } from './synthesis/useTagEditor';
import { usePlaylistControl } from './synthesis/usePlaylistControl';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function useSynthesis() {
  const orchestrator = useSynthesisOrchestrator();
  const {
    sentences,
    setSentences,
    setDemoSentences,
    handleTextChange,
    handleClearSentence,
    handleAddSentence,
    handleRemoveSentence,
    updateSentence,
    updateAllSentences,
    getSentence,
    currentAudio,
    playSingleSentence,
    synthesizeAndPlay,
    synthesizeWithText
  } = orchestrator;

  const sentencesRef = useRef(sentences);
  sentencesRef.current = sentences;

  const tagEditor = useTagEditor(getSentence, updateSentence);
  const { handleInputBlur } = tagEditor;

  const playlist = usePlaylistControl(
    sentences,
    playSingleSentence,
    () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    },
    updateAllSentences
  );

  const [editingTag, setEditingTag] = useState<EditingTag>(null);
  const [openTagMenu, setOpenTagMenu] = useState<OpenTagMenu>(null);

  const handleKeyDown = (e: React.KeyboardEvent, id: string): void => {
    tagEditor.handleKeyDown(e, id, (id: string, text?: string): void => {
      if (text) {
        synthesizeWithText(id, text);
      } else {
        synthesizeAndPlay(id);
      }
    });
  };

  const handleRemoveSentenceWrapper = useCallback((id: string) => {
    handleRemoveSentence(id, true);
  }, [handleRemoveSentence]);

  const handlePlay = useCallback((id: string): void => {
    const sentence = getSentence(id);
    if (!sentence) return;
    if (sentence.currentInput.trim()) {
      const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
      const allTags = [...sentence.tags, ...inputWords];
      const fullText = allTags.join(' ');
      updateSentence(id, { tags: allTags, currentInput: '', text: fullText, phoneticText: undefined, audioUrl: undefined });
      synthesizeWithText(id, fullText);
    } else if (sentence.tags.length > 0) {
      synthesizeAndPlay(id);
    }
  }, [getSentence, updateSentence, synthesizeAndPlay, synthesizeWithText]);

  const handleDownload = useCallback(async (id: string) => {
    const sentence = getSentence(id);
    if (!sentence) return;
    let audioUrl = sentence.audioUrl;

    if (!audioUrl) {
      try {
        audioUrl = await synthesizeWithPolling(sentence.text, getVoiceModel(sentence.text));
        updateSentence(id, { audioUrl });
      } catch (error) {
        console.error('Failed to generate audio:', error);
        return;
      }
    }

    if (!audioUrl) return;

    try {
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      const blobUrl = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${sentence.text || 'audio'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download audio:', error);
    }
  }, [getSentence, updateSentence]);

  const handleDeleteTag = useCallback((sentenceId: string, tagIndex: number) => {
    setSentences(prev => prev.map(s => {
      if (s.id !== sentenceId) return s;
      const newTags = s.tags.filter((_, i) => i !== tagIndex);
      const newStressedTags = s.stressedTags?.filter((_, i) => i !== tagIndex);
      return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
    }));
    setOpenTagMenu(null);
  }, [setSentences]);

  const handleEditTag = useCallback((sentenceId: string, tagIndex: number) => {
    const sentence = getSentence(sentenceId);
    if (!sentence) return;
    const word = sentence.tags[tagIndex] ?? '';
    setEditingTag({ sentenceId, tagIndex, value: word });
    setOpenTagMenu(null);
  }, [getSentence]);

  const handleEditTagChange = useCallback((value: string) => {
    if (!editingTag) return;
    setEditingTag({ ...editingTag, value });
  }, [editingTag]);

  const handleEditTagCommit = useCallback(() => {
    if (!editingTag) return;
    const { sentenceId, tagIndex, value } = editingTag;
    const trimmedValue = value.trim();

    const newSentences = sentencesRef.current.map(s => {
      if (s.id !== sentenceId) return s;
      if (trimmedValue === '') {
        const newTags = s.tags.filter((_, i) => i !== tagIndex);
        const newStressedTags = s.stressedTags?.filter((_, i) => i !== tagIndex);
        return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
      } else {
        const newWords = trimmedValue.split(/\s+/).filter(w => w.length > 0);
        const newTags = [...s.tags.slice(0, tagIndex), ...newWords, ...s.tags.slice(tagIndex + 1)];
        const newStressedTags = s.stressedTags ? [...s.stressedTags.slice(0, tagIndex), ...newWords.map(() => undefined as unknown as string), ...s.stressedTags.slice(tagIndex + 1)].filter(t => t !== undefined) : undefined;
        return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
      }
    });
    
    sentencesRef.current = newSentences;
    setSentences(newSentences);
    setEditingTag(null);
  }, [editingTag, setSentences]);

  const handleEditTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingTag) {
        const sentenceId = editingTag.sentenceId;
        handleEditTagCommit();
        synthesizeAndPlay(sentenceId);
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      handleEditTagCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingTag(null);
    }
  }, [editingTag, handleEditTagCommit, synthesizeAndPlay]);

  const handleUseVariant = useCallback((variantText: string, selectedSentenceId: string | null, selectedTagIndex: number | null) => {
    if (selectedSentenceId !== null && selectedTagIndex !== null) {
      setSentences(prev => prev.map(s => {
        if (s.id === selectedSentenceId) {
          const newStressedTags = s.stressedTags ? [...s.stressedTags] : [...s.tags];
          newStressedTags[selectedTagIndex] = variantText;
          return { ...s, stressedTags: newStressedTags, phoneticText: newStressedTags.join(' '), audioUrl: undefined };
        }
        return s;
      }));
    }
  }, [setSentences]);

  const handleSentencePhoneticApply = useCallback((sentenceId: string, newPhoneticText: string) => {
    setSentences(prev => prev.map(s => {
      if (s.id !== sentenceId) return s;
      const newPlainText = stripPhoneticMarkers(newPhoneticText) || '';
      const newTags = newPlainText.trim().split(/\s+/).filter(w => w.length > 0);
      const newStressedTags = newPhoneticText.trim().split(/\s+/).filter(w => w.length > 0);
      return { ...s, text: newPlainText, tags: newTags, phoneticText: newPhoneticText, stressedTags: newStressedTags, audioUrl: undefined };
    }));
  }, [setSentences]);

  return {
    sentences,
    setSentences,
    isPlayingAll: playlist.isPlayingAll,
    isLoadingPlayAll: playlist.isLoadingPlayAll,
    editingTag,
    openTagMenu,
    setOpenTagMenu,
    setDemoSentences,
    handleTextChange,
    handleClearSentence,
    handleAddSentence,
    handleRemoveSentence: handleRemoveSentenceWrapper,
    handleInputBlur,
    handleKeyDown,
    handlePlay,
    handlePlayAll: playlist.handlePlayAll,
    handleDownload,
    handleDeleteTag,
    handleEditTag,
    handleEditTagChange,
    handleEditTagCommit,
    handleEditTagKeyDown,
    handleUseVariant,
    handleSentencePhoneticApply,
    synthesizeAndPlay
  };
}
