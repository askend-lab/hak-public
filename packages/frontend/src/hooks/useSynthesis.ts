/**
 * useSynthesis - Facade hook combining synthesis modules
 * Split into modules for SOLID compliance (Single Responsibility)
 * 
 * Modules:
 * - useSynthesisState: Core state and sentence CRUD
 * - useSynthesisPlayback: Audio playback logic
 * - useSynthesisTagEdit: Tag editing and keyboard handling
 */
import { useSynthesisState } from './synthesis/useSynthesisState';
import { useSynthesisPlayback } from './synthesis/useSynthesisPlayback';
import { useSynthesisTagEdit } from './synthesis/useSynthesisTagEdit';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function useSynthesis() {
  // State module
  const state = useSynthesisState();
  const { sentences, setSentences, sentencesRef, setDemoSentences, handleTextChange, handleClearSentence, handleAddSentence, handleRemoveSentence, handleInputBlur } = state;

  // Playback module
  const playback = useSynthesisPlayback(sentences, setSentences, sentencesRef);
  const { isPlayingAll, isLoadingPlayAll, synthesizeAndPlay, synthesizeWithText, handlePlayAll, handlePlay, handleDownload } = playback;

  // Tag editing module
  const tagEdit = useSynthesisTagEdit(sentences, setSentences, sentencesRef, synthesizeAndPlay, synthesizeWithText);
  const { editingTag, openTagMenu, setOpenTagMenu, handleDeleteTag, handleEditTag, handleEditTagChange, handleEditTagCommit, handleEditTagKeyDown, handleKeyDown, handleUseVariant, handleSentencePhoneticApply } = tagEdit;

  return {
    sentences, setSentences, isPlayingAll, isLoadingPlayAll, editingTag, openTagMenu, setOpenTagMenu,
    setDemoSentences, handleTextChange, handleClearSentence, handleAddSentence, handleRemoveSentence, handleInputBlur,
    handleKeyDown, handlePlay, handlePlayAll, handleDownload, handleDeleteTag, handleEditTag,
    handleEditTagChange, handleEditTagCommit, handleEditTagKeyDown, handleUseVariant, handleSentencePhoneticApply, synthesizeAndPlay,
  };
}
