// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { useState, useEffect } from "react";
import { transformToVabamorf } from "@/utils/phoneticMarkers";
import { synthesizeAuto } from "@/utils/synthesize";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { createAudioPlayer } from "@/utils/audioPlayer";
import { CONTENT_TYPE_JSON, VARIANTS_API_PATH } from "@/utils/analyzeApi";
import { CloseIcon } from "../ui/Icons";
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
      const response = await fetch(VARIANTS_API_PATH, {
        method: "POST",
        headers: { "Content-Type": CONTENT_TYPE_JSON },
        body: JSON.stringify({ word: selectedWord }),
      });
      if (!response.ok) throw new Error("Failed to fetch variants");
      const data = await response.json();
      setVariants(deduplicateByText(data.variants || []));
    } catch (err) {
      setError(getErrorMessage(err, "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVariant = async (variant: Variant) => {
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
      const audioUrl = await synthesizeAuto(vabamorfText || "");
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
