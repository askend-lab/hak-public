import { useState, useCallback } from 'react';
import { SentenceState } from '@/types/synthesis';
import { NotificationType } from '@/components/Notification';
import { analyzeText } from '@/utils/analyzeApi';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function useVariantsPanel(
  sentences: SentenceState[],
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>,
  showNotification?: (type: NotificationType, message: string, description?: string) => void
) {
  const [variantsWord, setVariantsWord] = useState<string | null>(null);
  const [variantsCustomPhonetic, setVariantsCustomPhonetic] = useState<string | null>(null);
  const [isVariantsPanelOpen, setIsVariantsPanelOpen] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [showSentencePhoneticPanel, setShowSentencePhoneticPanel] = useState(false);
  const [sentencePhoneticId, setSentencePhoneticId] = useState<string | null>(null);
  const [loadingVariantsTag, setLoadingVariantsTag] = useState<{
    sentenceId: string;
    tagIndex: number;
  } | null>(null);

  const handleTagClick = useCallback(async (sentenceId: string, tagIndex: number, word: string) => {
    const sentence = sentences.find(s => s.id === sentenceId);

    if (!sentence?.stressedTags) {
      const fullText = sentence?.tags.join(' ') || '';
      const stressedText = await analyzeText(fullText);
      if (stressedText) {
        const stressedWords = stressedText.trim().split(/\s+/).filter((w: string) => w.length > 0);
        setSentences(prev => prev.map(s => {
          if (s.id !== sentenceId) return s;
          return { ...s, stressedTags: stressedWords.length === s.tags.length ? stressedWords : undefined };
        }));

        const customPhoneticForm = stressedWords.length === sentence?.tags.length ? stressedWords[tagIndex] : null;
        setSelectedSentenceId(sentenceId);
        setSelectedTagIndex(tagIndex);
        setVariantsWord(word);
        setVariantsCustomPhonetic(customPhoneticForm || null);
        setIsVariantsPanelOpen(true);
        return;
      }
    }

    const customPhoneticForm = sentence?.stressedTags?.[tagIndex];
    setSelectedSentenceId(sentenceId);
    setSelectedTagIndex(tagIndex);
    setVariantsWord(word);
    setVariantsCustomPhonetic(customPhoneticForm || null);
    setIsVariantsPanelOpen(true);
  }, [sentences, setSentences]);

  const handleCloseVariants = useCallback(() => {
    setIsVariantsPanelOpen(false);
    setVariantsWord(null);
    setVariantsCustomPhonetic(null);
    setSelectedSentenceId(null);
    setSelectedTagIndex(null);
  }, []);

  const handleOpenVariantsFromMenu = useCallback(async (sentenceId: string, tagIndex: number, word: string) => {
    setLoadingVariantsTag({ sentenceId, tagIndex });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Minimum spinner display time for better UX
    const minDisplayTime = new Promise(resolve => setTimeout(resolve, 500));

    try {
      const [response] = await Promise.all([
        fetch('/api/variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word }),
          signal: controller.signal
        }),
        minDisplayTime
      ]);
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('API error');

      const data = await response.json();

      if (!data.variants?.length) {
        showNotification?.('warning', 'Variante ei leitud', 'Sõna ei leidu eesti keeles või on valesti kirjutatud.');
        return;
      }

      handleTagClick(sentenceId, tagIndex, word);
    } catch (error) {
      clearTimeout(timeoutId);
      // Ensure minimum display time even on error
      await minDisplayTime;
      if (error instanceof Error && error.name === 'AbortError') {
        showNotification?.('error', 'Päring aegus', 'Variantide laadimine võttis liiga kaua.');
      } else {
        showNotification?.('error', 'Viga', 'Variantide laadimine ebaõnnestus.');
      }
    } finally {
      setLoadingVariantsTag(null);
    }
  }, [handleTagClick, showNotification]);

  const handleExplorePhonetic = useCallback(async (sentenceId: string) => {
    const sentence = sentences.find(s => s.id === sentenceId);
    if (!sentence || !sentence.text.trim()) return;

    if (!sentence.phoneticText) {
      const stressedText = await analyzeText(sentence.text);
      if (stressedText) {
        setSentences(prev => prev.map(s => s.id === sentenceId ? { ...s, phoneticText: stressedText } : s));
      }
    }

    setSentencePhoneticId(sentenceId);
    setShowSentencePhoneticPanel(true);
  }, [sentences, setSentences]);

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
