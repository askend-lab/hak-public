// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useState, useEffect, useRef } from "react";
import { transformToVabamorf } from "@/features/synthesis/utils/phoneticMarkers";
import { synthesizeAuto } from "@/features/synthesis/utils/synthesize";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { createAudioPlayer } from "@/features/synthesis/utils/audioPlayer";
import { logger } from "@hak/shared";
import { postJSON, VARIANTS_API_PATH } from "@/features/synthesis/utils/analyzeApi";
import { CloseIcon } from "@/components/ui/Icons";
import PhoneticGuide from "./PhoneticGuide";
import { VariantItem } from "./VariantItem";
import { CustomVariantForm } from "./CustomVariantForm";

function deduplicateByText(variants: Variant[]): Variant[] {
  const seen = new Set<string>();
  return variants.filter((v) => {
    if (seen.has(v.text)) return false;
    seen.add(v.text);
    return true;
  });
}

interface Variant {
  text: string;
  description: string;
  tags?: string[];
  audioUrl?: string;
}

interface PronunciationVariantsProps {
  word: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUseVariant?: (variant: string) => void;
  customPhoneticForm?: string | null;
}

export default function PronunciationVariants({
  word,
  isOpen,
  onClose,
  onUseVariant,
  customPhoneticForm,
}: PronunciationVariantsProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVariant, setPlayingVariant] = useState<string | null>(null);
  const [loadingVariant, setLoadingVariant] = useState<string | null>(null);
  const [customVariant, setCustomVariant] = useState("");
  const [isCustomPlaying, setIsCustomPlaying] = useState(false);
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (word && isOpen) {
      void fetchVariants(word);
      setCustomVariant("");
    }
  }, [word, isOpen]);

  const fetchVariants = async (selectedWord: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postJSON(VARIANTS_API_PATH, { word: selectedWord });
      if (!response.ok) throw new Error("Failed to fetch variants");
      const data = await response.json();
      setVariants(deduplicateByText(data.variants || []));
    } catch (err) {
      setError(getErrorMessage(err, "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
  };

  const handlePlayVariant = async (variant: Variant) => {
    // If this variant is already playing, pause it
    if (playingVariant === variant.text) {
      stopCurrentAudio();
      setPlayingVariant(null);
      return;
    }

    // Stop any currently playing audio (variant or custom)
    stopCurrentAudio();
    setIsCustomPlaying(false);

    setLoadingVariant(variant.text);
    setPlayingVariant(null);
    try {
      const audioUrl = await synthesizeAuto(variant.text);
      const { audio } = createAudioPlayer(audioUrl, {
        onLoaded: () => {
          setLoadingVariant(null);
          setPlayingVariant(variant.text);
        },
        onEnded: () => {
          currentAudioRef.current = null;
          setPlayingVariant(null);
          setLoadingVariant(null);
        },
        onError: () => {
          currentAudioRef.current = null;
          setPlayingVariant(null);
          setLoadingVariant(null);
        },
      });
      currentAudioRef.current = audio;
      await audio.play();
    } catch (error) {
      logger.error("Failed to play variant:", error);
      currentAudioRef.current = null;
      setPlayingVariant(null);
      setLoadingVariant(null);
    }
  };

  const handleUseVariant = (variant: Variant) => {
    onUseVariant?.(variant.text);
  };

  const handlePlayCustomVariant = async () => {
    if (!customVariant.trim()) return;

    // If custom variant is already playing, pause it
    if (isCustomPlaying) {
      stopCurrentAudio();
      setIsCustomPlaying(false);
      return;
    }

    // Stop any currently playing audio (variant or custom)
    stopCurrentAudio();
    setPlayingVariant(null);

    setIsCustomLoading(true);
    setIsCustomPlaying(false);
    try {
      const vabamorfText = transformToVabamorf(customVariant);
      const audioUrl = await synthesizeAuto(vabamorfText || "");
      const { audio } = createAudioPlayer(audioUrl, {
        onLoaded: () => {
          setIsCustomLoading(false);
          setIsCustomPlaying(true);
        },
        onEnded: () => {
          currentAudioRef.current = null;
          setIsCustomPlaying(false);
          setIsCustomLoading(false);
        },
        onError: () => {
          currentAudioRef.current = null;
          setIsCustomPlaying(false);
          setIsCustomLoading(false);
        },
      });
      currentAudioRef.current = audio;
      await audio.play();
    } catch (error) {
      logger.error("Failed to play custom variant:", error);
      currentAudioRef.current = null;
      setIsCustomPlaying(false);
      setIsCustomLoading(false);
    }
  };

  const handleUseCustomVariant = () => {
    if (!customVariant.trim()) return;
    const vabamorfText = transformToVabamorf(customVariant);
    onUseVariant?.(vabamorfText || "");
  };

  const handleCloseCustomForm = () => {
    setShowCustomForm(false);
    setCustomVariant("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="pronunciation-variants__panel">
        {!showGuide && (
          <div className="pronunciation-variants__header">
            <h3 className="pronunciation-variants__title">{word}</h3>
            <div className="pronunciation-variants__header-actions">
              <button
                onClick={onClose}
                className="pronunciation-variants__close"
                aria-label="Sulge"
              >
                <CloseIcon size="2xl" />
              </button>
            </div>
          </div>
        )}

        <div className="pronunciation-variants__content">
          {showGuide ? (
            <PhoneticGuide
              onBack={() => setShowGuide(false)}
              onClose={onClose}
            />
          ) : (
            <>
              {isLoading && (
                <div className="pronunciation-variants__loading">
                  <p>Laen variante...</p>
                </div>
              )}
              {error && (
                <div className="pronunciation-variants__error" role="alert">
                  <p>Viga: {error}</p>
                </div>
              )}
              {!isLoading && !error && variants.length > 0 && (
                <div className="pronunciation-variants__list">
                  {variants.map((variant) => (
                    <VariantItem
                      key={variant.text}
                      variant={variant}
                      isSelected={customPhoneticForm === variant.text}
                      isPlaying={playingVariant === variant.text}
                      isLoading={loadingVariant === variant.text}
                      onPlay={(...args: Parameters<typeof handlePlayVariant>) => { void handlePlayVariant(...args); }}
                      onUse={handleUseVariant}
                    />
                  ))}

                  <div className="pronunciation-variants__custom-section">
                    {!showCustomForm ? (
                      <button
                        className="pronunciation-variants__toggle-link"
                        onClick={() => setShowCustomForm(true)}
                      >
                        Loo oma variant
                      </button>
                    ) : (
                      <CustomVariantForm
                        value={customVariant}
                        onChange={setCustomVariant}
                        onPlay={() => { void handlePlayCustomVariant(); }}
                        onUse={handleUseCustomVariant}
                        onClose={handleCloseCustomForm}
                        onShowGuide={() => setShowGuide(true)}
                        isPlaying={isCustomPlaying}
                        isLoading={isCustomLoading}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
