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
    if (seen.has(v.text)) {return false;}
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

function useVariantAudio() {
  const [playingVariant, setPlayingVariant] = useState<string | null>(null);
  const [loadingVariant, setLoadingVariant] = useState<string | null>(null);
  const [isCustomPlaying, setIsCustomPlaying] = useState(false);
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current.src = ""; currentAudioRef.current = null; }
  };

  const resetVariant = () => { currentAudioRef.current = null; setPlayingVariant(null); setLoadingVariant(null); };
  const resetCustom = () => { currentAudioRef.current = null; setIsCustomPlaying(false); setIsCustomLoading(false); };

  const playVariant = async (variant: Variant) => {
    if (playingVariant === variant.text) { stopCurrentAudio(); setPlayingVariant(null); return; }
    stopCurrentAudio(); setIsCustomPlaying(false); setLoadingVariant(variant.text); setPlayingVariant(null);
    try {
      const audioUrl = await synthesizeAuto(variant.text);
      const { audio } = createAudioPlayer(audioUrl, {
        onLoaded: () => { setLoadingVariant(null); setPlayingVariant(variant.text); },
        onEnded: resetVariant, onError: resetVariant,
      });
      currentAudioRef.current = audio;
      await audio.play();
    } catch (err) { logger.error("Failed to play variant:", err); resetVariant(); }
  };

  const playCustom = async (customVariant: string) => {
    if (!customVariant.trim()) {return;}
    if (isCustomPlaying) { stopCurrentAudio(); setIsCustomPlaying(false); return; }
    stopCurrentAudio(); setPlayingVariant(null); setIsCustomLoading(true); setIsCustomPlaying(false);
    try {
      const audioUrl = await synthesizeAuto(transformToVabamorf(customVariant) || "");
      const { audio } = createAudioPlayer(audioUrl, {
        onLoaded: () => { setIsCustomLoading(false); setIsCustomPlaying(true); },
        onEnded: resetCustom, onError: resetCustom,
      });
      currentAudioRef.current = audio;
      await audio.play();
    } catch (err) { logger.error("Failed to play custom variant:", err); resetCustom(); }
  };

  return { playingVariant, loadingVariant, isCustomPlaying, isCustomLoading, playVariant, playCustom };
}

function useVariantsFetch(word: string | null, isOpen: boolean) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!word || !isOpen) {return;}
    setIsLoading(true); setError(null);
    postJSON(VARIANTS_API_PATH, { word })
      .then(async (response) => {
        if (!response.ok) {throw new Error("Failed to fetch variants");}
        const data = await response.json();
        return setVariants(deduplicateByText(data.variants || []));
      })
      .catch((err) => setError(getErrorMessage(err, "An error occurred")))
      .finally(() => setIsLoading(false));
  }, [word, isOpen]);

  return { variants, isLoading, error };
}

export default function PronunciationVariants({
  word,
  isOpen,
  onClose,
  onUseVariant,
  customPhoneticForm,
}: PronunciationVariantsProps) {
  const { variants, isLoading, error } = useVariantsFetch(word, isOpen);
  const audio = useVariantAudio();
  const [customVariant, setCustomVariant] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => { if (word && isOpen) {setCustomVariant("");} }, [word, isOpen]);

  const handleUseVariant = (variant: Variant) => { onUseVariant?.(variant.text); };
  const handleUseCustomVariant = () => { if (customVariant.trim()) { onUseVariant?.(transformToVabamorf(customVariant) || ""); } };
  const handleCloseCustomForm = () => { setShowCustomForm(false); setCustomVariant(""); };

  if (!isOpen) {return null;}

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
                      isPlaying={audio.playingVariant === variant.text}
                      isLoading={audio.loadingVariant === variant.text}
                      onPlay={(...args: Parameters<typeof audio.playVariant>) => { void audio.playVariant(...args); }}
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
                        onPlay={() => { void audio.playCustom(customVariant); }}
                        onUse={handleUseCustomVariant}
                        onClose={handleCloseCustomForm}
                        onShowGuide={() => setShowGuide(true)}
                        isPlaying={audio.isCustomPlaying}
                        isLoading={audio.isCustomLoading}
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
