"use client";

import { useState, useEffect } from "react";
import { transformToVabamorf } from "@/utils/phoneticMarkers";
import { synthesizeWithPolling } from "@/utils/synthesize";
import { createAudioPlayer } from "@/utils/audioPlayer";
import { CloseIcon } from "../ui/Icons";
import PhoneticGuide from "./PhoneticGuide";
import { VariantItem } from "./VariantItem";
import { CustomVariantForm } from "./CustomVariantForm";

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

  useEffect(() => {
    if (word && isOpen) {
      fetchVariants(word);
      setCustomVariant("");
    }
  }, [word, isOpen]);

  const fetchVariants = async (selectedWord: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: selectedWord }),
      });
      if (!response.ok) throw new Error("Failed to fetch variants");
      const data = await response.json();
      const uniqueVariants: Variant[] = [];
      const seenTexts = new Set<string>();
      for (const variant of data.variants || []) {
        if (!seenTexts.has(variant.text)) {
          seenTexts.add(variant.text);
          uniqueVariants.push(variant);
        }
      }
      setVariants(uniqueVariants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVariant = async (variant: Variant) => {
    setLoadingVariant(variant.text);
    setPlayingVariant(null);
    try {
      const audioUrl = await synthesizeWithPolling(variant.text, "efm_s");
      const { audio } = createAudioPlayer(audioUrl, {
        onLoaded: () => {
          setLoadingVariant(null);
          setPlayingVariant(variant.text);
        },
        onEnded: () => {
          setPlayingVariant(null);
          setLoadingVariant(null);
        },
        onError: () => {
          setPlayingVariant(null);
          setLoadingVariant(null);
        },
      });
      await audio.play();
    } catch (error) {
      console.error("Failed to play variant:", error);
      setPlayingVariant(null);
      setLoadingVariant(null);
    }
  };

  const handleUseVariant = (variant: Variant) => {
    onUseVariant?.(variant.text);
  };

  const handlePlayCustomVariant = async () => {
    if (!customVariant.trim()) return;
    setIsCustomLoading(true);
    setIsCustomPlaying(false);
    try {
      const vabamorfText = transformToVabamorf(customVariant);
      const audioUrl = await synthesizeWithPolling(vabamorfText || "", "efm_s");
      const { audio } = createAudioPlayer(audioUrl, {
        onLoaded: () => {
          setIsCustomLoading(false);
          setIsCustomPlaying(true);
        },
        onEnded: () => {
          setIsCustomPlaying(false);
          setIsCustomLoading(false);
        },
        onError: () => {
          setIsCustomPlaying(false);
          setIsCustomLoading(false);
        },
      });
      await audio.play();
    } catch (error) {
      console.error("Failed to play custom variant:", error);
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
                aria-label="Close"
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
                  {variants.map((variant, index) => (
                    <VariantItem
                      key={index}
                      variant={variant}
                      isSelected={customPhoneticForm === variant.text}
                      isPlaying={playingVariant === variant.text}
                      isLoading={loadingVariant === variant.text}
                      onPlay={handlePlayVariant}
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
                        onPlay={handlePlayCustomVariant}
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
