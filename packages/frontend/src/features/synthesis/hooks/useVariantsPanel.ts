// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { SentenceState, convertTextToTags, stripPunctuationForLookup } from "@/types/synthesis";
import type { ShowNotificationOptions } from "@/contexts/NotificationContext";
import { analyzeText, authPostJSON, VARIANTS_API_PATH } from "@/features/synthesis/utils/analyzeApi";
import { checkApiErrorStatus } from "@/utils/apiErrorEvents";
import { VARIANTS_STRINGS } from "@/config/ui-strings";

const VARIANTS_API_TIMEOUT_MS = 10000;
const MIN_SPINNER_DISPLAY_MS = 500;

const mapStressed = (sentenceId: string, stressedWords: string[]) => (s: SentenceState) =>
  s.id !== sentenceId ? s : { ...s, stressedTags: stressedWords.length === s.tags.length ? stressedWords : undefined };

const mapPhonetic = (sentenceId: string, phoneticText: string) => (s: SentenceState) =>
  s.id !== sentenceId ? s : { ...s, phoneticText };

interface UseVariantsPanelReturn {
  variantsWord: string | null;
  variantsCustomPhonetic: string | null;
  setVariantsCustomPhonetic: React.Dispatch<React.SetStateAction<string | null>>;
  isVariantsPanelOpen: boolean;
  selectedSentenceId: string | null;
  selectedTagIndex: number | null;
  showSentencePhoneticPanel: boolean;
  sentencePhoneticId: string | null;
  loadingVariantsTag: { sentenceId: string; tagIndex: number } | null;
  handleTagClick: (sentenceId: string, tagIndex: number, word: string) => Promise<void>;
  handleCloseVariants: () => void;
  handleOpenVariantsFromMenu: (sentenceId: string, tagIndex: number, word: string) => Promise<void>;
  handleExplorePhonetic: (sentenceId: string) => void;
  handleCloseSentencePhonetic: () => void;
}

function useVariantsState() {
  const [variantsWord, setVariantsWord] = useState<string | null>(null);
  const [variantsCustomPhonetic, setVariantsCustomPhonetic] = useState<string | null>(null);
  const [isVariantsPanelOpen, setIsVariantsPanelOpen] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [loadingVariantsTag, setLoadingVariantsTag] = useState<{ sentenceId: string; tagIndex: number } | null>(null);

  const openPanel = useCallback((opts: { sentenceId: string; tagIndex: number; word: string; phonetic?: string | null | undefined }) => {
    setSelectedSentenceId(opts.sentenceId);
    setSelectedTagIndex(opts.tagIndex);
    setVariantsWord(stripPunctuationForLookup(opts.word));
    setVariantsCustomPhonetic(opts.phonetic || null);
    setIsVariantsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsVariantsPanelOpen(false); setVariantsWord(null); setVariantsCustomPhonetic(null); setSelectedSentenceId(null); setSelectedTagIndex(null);
  }, []);

  return { variantsWord, variantsCustomPhonetic, setVariantsCustomPhonetic, isVariantsPanelOpen, selectedSentenceId, selectedTagIndex, loadingVariantsTag, setLoadingVariantsTag, openPanel, closePanel };
}

function usePhoneticState(sentences: SentenceState[], setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>) {
  const [showPanel, setShowPanel] = useState(false);
  const [phoneticId, setPhoneticId] = useState<string | null>(null);

  const explore = useCallback(async (sentenceId: string) => {
    const sentence = sentences.find((s) => s.id === sentenceId);
    if (!sentence || !sentence.text.trim()) {return;}
    if (!sentence.phoneticText) {
      const stressed = await analyzeText(sentence.text);
      if (stressed) { setSentences((prev) => prev.map(mapPhonetic(sentenceId, stressed))); }
    }
    setPhoneticId(sentenceId);
    setShowPanel(true);
  }, [sentences, setSentences]);

  const close = useCallback(() => { setShowPanel(false); setPhoneticId(null); }, []);
  return { showPanel, phoneticId, explore, close };
}

async function fetchAndCheckVariants(word: string, signal: AbortSignal): Promise<boolean> {
  const response = await authPostJSON(VARIANTS_API_PATH, { word: stripPunctuationForLookup(word) }, { signal });
  checkApiErrorStatus(response.status);
  if (!response.ok) {throw new Error("API error");}
  const data = await response.json();
  return Boolean(data.variants?.length);
}

function notifyVariantsError(error: unknown, notify?: (o: ShowNotificationOptions) => void): void {
  const isTimeout = error instanceof Error && error.name === "AbortError";
  notify?.({ type: "error", message: isTimeout ? VARIANTS_STRINGS.TIMEOUT : VARIANTS_STRINGS.LOAD_FAILED, description: isTimeout ? VARIANTS_STRINGS.TIMEOUT_DESC : VARIANTS_STRINGS.NOT_FOUND_DESC });
}

export function useVariantsPanel(
  sentences: SentenceState[],
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>,
  showNotification?: (options: ShowNotificationOptions) => void,
): UseVariantsPanelReturn {
  const vs = useVariantsState();
  const ps = usePhoneticState(sentences, setSentences);

  const handleTagClick = useCallback(async (sentenceId: string, tagIndex: number, word: string) => {
    ps.close();
    const sentence = sentences.find((s) => s.id === sentenceId);
    // #region agent log
    const _p={sessionId:'48623f',location:'useVariantsPanel.ts:handleTagClick',message:'Opening variants panel',data:{sentenceId,tagIndex,word,hasStressedTags:!!sentence?.stressedTags,stressedTags:sentence?.stressedTags,phoneticText:sentence?.phoneticText,tags:sentence?.tags,phoneticWillShow:sentence?.stressedTags?sentence.stressedTags[tagIndex]:null},timestamp:Date.now(),hypothesisId:'B,E'};console.warn('[DBG]',_p.message,_p.data);fetch('/debug-log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(_p)}).catch(()=>{});
    // #endregion
    if (sentence?.stressedTags) { vs.openPanel({ sentenceId, tagIndex, word, phonetic: sentence.stressedTags[tagIndex] }); return; }
    const stressed = await analyzeText(sentence?.tags.join(" ") || "");
    if (!stressed) { vs.openPanel({ sentenceId, tagIndex, word }); return; }
    const words = convertTextToTags(stressed);
    setSentences((prev) => prev.map(mapStressed(sentenceId, words)));
    vs.openPanel({ sentenceId, tagIndex, word, phonetic: words.length === sentence?.tags.length ? words[tagIndex] : null });
  }, [sentences, setSentences, vs.openPanel, ps.close]);

  const handleOpenVariantsFromMenu = useCallback(async (sentenceId: string, tagIndex: number, word: string) => {
    vs.setLoadingVariantsTag({ sentenceId, tagIndex });
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), VARIANTS_API_TIMEOUT_MS);
    const minWait = new Promise((resolve) => { setTimeout(resolve, MIN_SPINNER_DISPLAY_MS); });
    try {
      const [has] = await Promise.all([fetchAndCheckVariants(word, ctrl.signal), minWait]);
      clearTimeout(tid);
      if (!has) { showNotification?.({ type: "warning", message: VARIANTS_STRINGS.NOT_FOUND, description: VARIANTS_STRINGS.NOT_FOUND_DESC }); return; }
      void handleTagClick(sentenceId, tagIndex, word);
    } catch (error) { clearTimeout(tid); await minWait; notifyVariantsError(error, showNotification); }
    finally { vs.setLoadingVariantsTag(null); }
  }, [handleTagClick, showNotification, vs.setLoadingVariantsTag]);

  return {
    variantsWord: vs.variantsWord, variantsCustomPhonetic: vs.variantsCustomPhonetic, setVariantsCustomPhonetic: vs.setVariantsCustomPhonetic,
    isVariantsPanelOpen: vs.isVariantsPanelOpen, selectedSentenceId: vs.selectedSentenceId, selectedTagIndex: vs.selectedTagIndex,
    showSentencePhoneticPanel: ps.showPanel, sentencePhoneticId: ps.phoneticId, loadingVariantsTag: vs.loadingVariantsTag,
    handleTagClick, handleCloseVariants: vs.closePanel, handleOpenVariantsFromMenu,
    handleExplorePhonetic: (...args: Parameters<typeof ps.explore>) => { vs.closePanel(); void ps.explore(...args); },
    handleCloseSentencePhonetic: ps.close,
  };
}
