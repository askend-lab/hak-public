// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback, useMemo } from "react";
import { SentenceState, convertTextToTags } from "@/types/synthesis";
import { stripPhoneticMarkers } from "@/features/synthesis/utils/phoneticMarkers";
import { useSynthesisOrchestrator } from "./synthesis/useSynthesisOrchestrator";
import { useTagEditor } from "./synthesis/useTagEditor";
import { usePlaylistControl } from "./synthesis/usePlaylistControl";
import { useTagUpdater } from "./synthesis/useTagUpdater";
import { useInlineTagEditor } from "./synthesis/useInlineTagEditor";
import { useSentenceActions } from "./synthesis/useSentenceActions";

const mapPhoneticApply = (id: string, phonetic: string) => (s: SentenceState) => {
  if (s.id !== id) {return s;}
  const plain = stripPhoneticMarkers(phonetic) || "";
  return { ...s, text: plain, tags: convertTextToTags(plain), phoneticText: phonetic, stressedTags: convertTextToTags(phonetic), audioUrl: undefined };
};

function useSynthesisSetup() {
  const o = useSynthesisOrchestrator();
  const tagEditor = useTagEditor(o.getSentence, o.updateSentence);
  const tagUpdater = useTagUpdater(o.setSentences);
  const stopAudio = useCallback(() => { if (o.currentAudio) { o.currentAudio.pause(); o.currentAudio.src = ""; } }, [o.currentAudio]);
  const playlist = usePlaylistControl({ sentences: o.sentences, playSingle: o.playSingleSentence, stopAudio, updateAllSentences: o.updateAllSentences });
  const synth = (...args: Parameters<typeof o.synthesizeWithText>) => { void o.synthesizeWithText(...args); };
  const inlineEditor = useInlineTagEditor({ sentences: o.sentences, getSentence: o.getSentence, tagUpdater, synthesizeWithText: synth });
  const actions = useSentenceActions({
    getSentence: o.getSentence, updateSentence: o.updateSentence,
    synthesizeAndPlay: (...args: Parameters<typeof o.synthesizeAndPlay>) => { void o.synthesizeAndPlay(...args); },
    synthesizeWithText: synth, handleRemoveSentence: o.handleRemoveSentence, currentAudio: o.currentAudio, playlist,
  });
  const handleKeyDown = (e: React.KeyboardEvent, id: string): void => {
    tagEditor.handleKeyDown(e, id, (sid: string, text?: string): void => { if (text) { void o.synthesizeWithText(sid, text); } else { void o.synthesizeAndPlay(sid); } });
  };
  const handleUseVariant = useCallback((v: string, sid: string | null, idx: number | null) => {
    if (sid !== null && idx !== null) { tagUpdater.updateStressedTag(sid, idx, v); }
  }, [tagUpdater]);
  const handleSentencePhoneticApply = useCallback((sid: string, phonetic: string) => {
    o.setSentences((prev) => prev.map(mapPhoneticApply(sid, phonetic)));
  }, [o.setSentences]);
  return { o, playlist, inlineEditor, actions, tagEditor, handleKeyDown, handleUseVariant, handleSentencePhoneticApply };
}

export function useSynthesis() {
  const { o, playlist, inlineEditor, actions, tagEditor, handleKeyDown, handleUseVariant, handleSentencePhoneticApply } = useSynthesisSetup();
  return useMemo(() => ({
    sentences: o.sentences, setSentences: o.setSentences, isPlayingAll: playlist.isPlayingAll, isLoadingPlayAll: playlist.isLoadingPlayAll,
    editingTag: inlineEditor.editingTag, openTagMenu: inlineEditor.openTagMenu, setOpenTagMenu: inlineEditor.setOpenTagMenu,
    setDemoSentences: o.setDemoSentences, handleTextChange: o.handleTextChange, handleClearSentence: o.handleClearSentence,
    handleAddSentence: o.handleAddSentence, handleRemoveSentence: actions.handleRemoveSentence, handleInputBlur: tagEditor.handleInputBlur,
    handleKeyDown, handlePlay: actions.handlePlay, handlePlayAll: playlist.handlePlayAll, handleDownload: actions.handleDownload,
    handleCopyText: actions.handleCopyText, handleDeleteTag: inlineEditor.handleDeleteTag, handleEditTag: inlineEditor.handleEditTag,
    handleEditTagChange: inlineEditor.handleEditTagChange, handleEditTagCommit: inlineEditor.handleEditTagCommit,
    handleEditTagKeyDown: inlineEditor.handleEditTagKeyDown, handleUseVariant, handleSentencePhoneticApply, synthesizeAndPlay: o.synthesizeAndPlay,
  }), [o, playlist, inlineEditor, actions, tagEditor, handleKeyDown, handleUseVariant, handleSentencePhoneticApply]);
}
