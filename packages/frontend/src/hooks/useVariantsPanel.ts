import { useState, useCallback } from 'react';
import { SentenceState } from '@/types/synthesis';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function useVariantsPanel(
  sentences: SentenceState[],
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>
) {
  const [variantsWord, setVariantsWord] = useState<string | null>(null);
  const [variantsCustomPhonetic, setVariantsCustomPhonetic] = useState<string | null>(null);
  const [isVariantsPanelOpen, setIsVariantsPanelOpen] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [showSentencePhoneticPanel, setShowSentencePhoneticPanel] = useState(false);
  const [sentencePhoneticId, setSentencePhoneticId] = useState<string | null>(null);

  const handleTagClick = useCallback(async (sentenceId: string, tagIndex: number, word: string) => {
    const sentence = sentences.find(s => s.id === sentenceId);

    if (!sentence?.stressedTags) {
      try {
        const fullText = sentence?.tags.join(' ') || '';
        const analyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: fullText })
        });

        if (analyzeResponse.ok) {
          const { stressedText } = await analyzeResponse.json();
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
      } catch (error) {
        console.error('Failed to analyze sentence:', error);
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

  const handleOpenVariantsFromMenu = useCallback((sentenceId: string, tagIndex: number, word: string) => {
    handleTagClick(sentenceId, tagIndex, word);
  }, [handleTagClick]);

  const handleExplorePhonetic = useCallback(async (sentenceId: string) => {
    const sentence = sentences.find(s => s.id === sentenceId);
    if (!sentence || !sentence.text.trim()) return;

    if (!sentence.phoneticText) {
      try {
        const analyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sentence.text })
        });

        if (analyzeResponse.ok) {
          const { stressedText } = await analyzeResponse.json();
          if (stressedText) {
            setSentences(prev => prev.map(s => s.id === sentenceId ? { ...s, phoneticText: stressedText } : s));
          }
        }
      } catch (error) {
        console.error('Failed to analyze sentence:', error);
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
    handleTagClick,
    handleCloseVariants,
    handleOpenVariantsFromMenu,
    handleExplorePhonetic,
    handleCloseSentencePhonetic,
  };
}
