// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { SentenceState, convertTextToTags, stripPunctuationForLookup } from "@/types/synthesis";
import { NotificationType } from "@/components/Notification";
import { analyzeText, postJSON, VARIANTS_API_PATH } from "@/utils/analyzeApi";
import { VARIANTS_STRINGS } from "@/constants/ui-strings";

const VARIANTS_API_TIMEOUT_MS = 10000;
const MIN_SPINNER_DISPLAY_MS = 500;

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

export function useVariantsPanel(
  sentences: SentenceState[],
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>,
  showNotification?: (
    type: NotificationType,
    message: string,
    description?: string,
  ) => void,
): UseVariantsPanelReturn {
  const [variantsWord, setVariantsWord] = useState<string | null>(null);
  const [variantsCustomPhonetic, setVariantsCustomPhonetic] = useState<
    string | null
  >(null);
  const [isVariantsPanelOpen, setIsVariantsPanelOpen] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(
    null,
  );
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [showSentencePhoneticPanel, setShowSentencePhoneticPanel] =
    useState(false);
  const [sentencePhoneticId, setSentencePhoneticId] = useState<string | null>(
    null,
  );
  const [loadingVariantsTag, setLoadingVariantsTag] = useState<{
    sentenceId: string;
    tagIndex: number;
  } | null>(null);

  const handleTagClick = useCallback(
    async (sentenceId: string, tagIndex: number, word: string) => {
      const sentence = sentences.find((s) => s.id === sentenceId);

      if (!sentence?.stressedTags) {
        const fullText = sentence?.tags.join(" ") || "";
        const stressedText = await analyzeText(fullText);
        if (stressedText) {
          const stressedWords = convertTextToTags(stressedText);
          setSentences((prev) =>
            prev.map((s) => {
              if (s.id !== sentenceId) return s;
              return {
                ...s,
                stressedTags:
                  stressedWords.length === s.tags.length
                    ? stressedWords
                    : undefined,
              };
            }),
          );

          const customPhoneticForm =
            stressedWords.length === sentence?.tags.length
              ? stressedWords[tagIndex]
              : null;
          setSelectedSentenceId(sentenceId);
          setSelectedTagIndex(tagIndex);
          setVariantsWord(stripPunctuationForLookup(word));
          setVariantsCustomPhonetic(customPhoneticForm || null);
          setIsVariantsPanelOpen(true);
          return;
        }
      }

      const customPhoneticForm = sentence?.stressedTags?.[tagIndex];
      setSelectedSentenceId(sentenceId);
      setSelectedTagIndex(tagIndex);
      setVariantsWord(stripPunctuationForLookup(word));
      setVariantsCustomPhonetic(customPhoneticForm || null);
      setIsVariantsPanelOpen(true);
    },
    [sentences, setSentences],
  );

  const handleCloseVariants = useCallback(() => {
    setIsVariantsPanelOpen(false);
    setVariantsWord(null);
    setVariantsCustomPhonetic(null);
    setSelectedSentenceId(null);
    setSelectedTagIndex(null);
  }, []);

  const handleOpenVariantsFromMenu = useCallback(
    async (sentenceId: string, tagIndex: number, word: string) => {
      setLoadingVariantsTag({ sentenceId, tagIndex });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), VARIANTS_API_TIMEOUT_MS);

      // Minimum spinner display time for better UX
      const minDisplayTime = new Promise((resolve) => setTimeout(resolve, MIN_SPINNER_DISPLAY_MS));

      // Strip punctuation for API lookup (preserve dashes for compound words)
      const lookupWord = stripPunctuationForLookup(word);

      try {
        const [response] = await Promise.all([
          postJSON(VARIANTS_API_PATH, { word: lookupWord }, { signal: controller.signal }),
          minDisplayTime,
        ]);
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("API error");

        const data = await response.json();

        if (!data.variants?.length) {
          showNotification?.(
            "warning",
            VARIANTS_STRINGS.NOT_FOUND,
            VARIANTS_STRINGS.NOT_FOUND_DESC,
          );
          return;
        }

        handleTagClick(sentenceId, tagIndex, word);
      } catch (error) {
        clearTimeout(timeoutId);
        // Ensure minimum display time even on error
        await minDisplayTime;
        if (error instanceof Error && error.name === "AbortError") {
          showNotification?.(
            "error",
            VARIANTS_STRINGS.TIMEOUT,
            VARIANTS_STRINGS.TIMEOUT_DESC,
          );
        } else {
          showNotification?.(
            "error",
            VARIANTS_STRINGS.LOAD_FAILED,
            VARIANTS_STRINGS.NOT_FOUND_DESC,
          );
        }
      } finally {
        setLoadingVariantsTag(null);
      }
    },
    [handleTagClick, showNotification],
  );

  const handleExplorePhonetic = useCallback(
    async (sentenceId: string) => {
      const sentence = sentences.find((s) => s.id === sentenceId);
      if (!sentence || !sentence.text.trim()) return;

      if (!sentence.phoneticText) {
        const stressedText = await analyzeText(sentence.text);
        if (stressedText) {
          setSentences((prev) =>
            prev.map((s) =>
              s.id === sentenceId ? { ...s, phoneticText: stressedText } : s,
            ),
          );
        }
      }

      setSentencePhoneticId(sentenceId);
      setShowSentencePhoneticPanel(true);
    },
    [sentences, setSentences],
  );

  const handleCloseSentencePhonetic = useCallback(() => {
    setShowSentencePhoneticPanel(false);
    setSentencePhoneticId(null);
  }, []);

  return {
    variantsWord,
    variantsCustomPhonetic,
    setVariantsCustomPhonetic,
    isVariantsPanelOpen,
    selectedSentenceId,
    selectedTagIndex,
    showSentencePhoneticPanel,
    sentencePhoneticId,
    loadingVariantsTag,
    handleTagClick,
    handleCloseVariants,
    handleOpenVariantsFromMenu,
    handleExplorePhonetic,
    handleCloseSentencePhonetic,
  };
}
