/* eslint-disable max-lines-per-function, complexity, max-lines */
'use client';

import { useState, useEffect, useRef } from 'react';
import { transformToUI, transformToVabamorf } from '@/utils/phoneticMarkers';
import { synthesizeWithPolling } from '@/utils/synthesize';
import { CloseIcon, PlayIcon, PauseIcon, VolumeIcon } from '../ui/Icons';
import PhoneticGuide from './PhoneticGuide';
import { parsePhoneticMarkers, generatePronunciationExplanation } from './phoneticHelpers';

interface Variant { text: string; description: string; tags?: string[]; audioUrl?: string; }

interface PronunciationVariantsProps {
  word: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUseVariant?: (variant: string) => void;
  customPhoneticForm?: string | null;
}

export default function PronunciationVariants({ word, isOpen, onClose, onUseVariant, customPhoneticForm }: PronunciationVariantsProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVariant, setPlayingVariant] = useState<string | null>(null);
  const [loadingVariant, setLoadingVariant] = useState<string | null>(null);
  const [customVariant, setCustomVariant] = useState('');
  const [isCustomPlaying, setIsCustomPlaying] = useState(false);
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (word && isOpen) {
      fetchVariants(word);
      setCustomVariant('');
    }
  }, [word, isOpen]);

  const fetchVariants = async (selectedWord: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: selectedWord }),
      });
      if (!response.ok) throw new Error('Failed to fetch variants');
      const data = await response.json();
      const uniqueVariants: Variant[] = [];
      const seenTexts = new Set<string>();
      for (const variant of (data.variants || [])) {
        if (!seenTexts.has(variant.text)) {
          seenTexts.add(variant.text);
          uniqueVariants.push(variant);
        }
      }
      setVariants(uniqueVariants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVariant = async (variant: Variant) => {
    setLoadingVariant(variant.text);
    setPlayingVariant(null);
    try {
      const audioUrl = await synthesizeWithPolling(variant.text, 'efm_s');
      const audio = new Audio(audioUrl);
      audio.onloadeddata = () => { setLoadingVariant(null); setPlayingVariant(variant.text); };
      audio.onended = () => { setPlayingVariant(null); setLoadingVariant(null); URL.revokeObjectURL(audioUrl); };
      audio.onerror = () => { setPlayingVariant(null); setLoadingVariant(null); URL.revokeObjectURL(audioUrl); };
      await audio.play();
    } catch (error) {
      console.error('Failed to play variant:', error);
      setPlayingVariant(null);
      setLoadingVariant(null);
    }
  };

  const handleUseVariant = (variant: Variant) => { onUseVariant?.(variant.text); };

  const handlePlayCustomVariant = async () => {
    if (!customVariant.trim()) return;
    setIsCustomLoading(true);
    setIsCustomPlaying(false);
    try {
      const vabamorfText = transformToVabamorf(customVariant);
      const audioUrl = await synthesizeWithPolling(vabamorfText || '', 'efm_s');
      const audio = new Audio(audioUrl);
      audio.onloadeddata = () => { setIsCustomLoading(false); setIsCustomPlaying(true); };
      audio.onended = () => { setIsCustomPlaying(false); setIsCustomLoading(false); URL.revokeObjectURL(audioUrl); };
      audio.onerror = () => { setIsCustomPlaying(false); setIsCustomLoading(false); URL.revokeObjectURL(audioUrl); };
      await audio.play();
    } catch (error) {
      console.error('Failed to play custom variant:', error);
      setIsCustomPlaying(false);
      setIsCustomLoading(false);
    }
  };

  const handleUseCustomVariant = () => {
    if (!customVariant.trim()) return;
    const vabamorfText = transformToVabamorf(customVariant);
    onUseVariant?.(vabamorfText || '');
  };

  const handleCloseCustomForm = () => { setShowCustomForm(false); setCustomVariant(''); };

  const insertMarkerAtCursor = (marker: string) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = customVariant.substring(0, start) + marker + customVariant.substring(end);
    setCustomVariant(newValue);
    setTimeout(() => { input.focus(); input.setSelectionRange(start + marker.length, start + marker.length); }, 0);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="pronunciation-variants__panel">
        {!showGuide && (
          <div className="pronunciation-variants__header">
            <h3 className="pronunciation-variants__title">{word}</h3>
            <div className="pronunciation-variants__header-actions">
              <button onClick={onClose} className="pronunciation-variants__close" aria-label="Close"><CloseIcon size="2xl" /></button>
            </div>
          </div>
        )}

        <div className="pronunciation-variants__content">
          {showGuide ? (
            <PhoneticGuide onBack={() => setShowGuide(false)} onClose={onClose} />
          ) : (
            <>
              {isLoading && <div className="pronunciation-variants__loading"><p>Laen variante...</p></div>}
              {error && <div className="pronunciation-variants__error"><p>Viga: {error}</p></div>}
              {!isLoading && !error && variants.length > 0 && (
                <div className="pronunciation-variants__list">
                  {variants.map((variant, index) => {
                    const isSelected = customPhoneticForm === variant.text;
                    return (
                      <div key={index} className={`pronunciation-variants__item ${isSelected ? 'pronunciation-variants__item--selected' : ''}`}>
                        <div className="pronunciation-variants__item-header">
                          <div className="pronunciation-variants__item-info">
                            <div className="pronunciation-variants__item-text">{transformToUI(variant.text ?? '')}</div>
                            <div className="pronunciation-variants__item-tags">
                              {parsePhoneticMarkers(variant.text ?? '').map((tagObj, i) => (
                                <span key={i} className="pronunciation-variants__item-tag">{tagObj.tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="pronunciation-variants__item-actions">
                            <button onClick={() => handlePlayVariant(variant)} disabled={loadingVariant === variant.text}
                              className={`button button--primary button--icon-only button--circular ${loadingVariant === variant.text ? 'loading' : ''} ${playingVariant === variant.text ? 'playing' : ''}`}
                              title={loadingVariant === variant.text ? 'Laen...' : playingVariant === variant.text ? 'Mängib' : 'Mängi'}>
                              {loadingVariant === variant.text ? <div className="loader-spinner"></div> : playingVariant === variant.text ? <PauseIcon size="2xl" /> : <PlayIcon size="2xl" />}
                            </button>
                            <button onClick={() => handleUseVariant(variant)} className="button button--secondary">Kasuta</button>
                          </div>
                        </div>
                        {generatePronunciationExplanation(transformToUI(variant.text ?? '') ?? '') && (
                          <div className="pronunciation-variants__item-explanation">
                            <VolumeIcon size="md" className="pronunciation-variants__explanation-icon" />
                            <span>{generatePronunciationExplanation(transformToUI(variant.text ?? '') ?? '')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="pronunciation-variants__custom-section">
                    {!showCustomForm ? (
                      <button className="pronunciation-variants__toggle-link" onClick={() => setShowCustomForm(true)}>Loo oma variant</button>
                    ) : (
                      <>
                        <div className="pronunciation-variants__form">
                          <h4 className="pronunciation-variants__form-title">Loo oma variant</h4>
                          <p className="pronunciation-variants__form-description">
                            Sisesta oma foneetilise tekst või sõna variant, et kasutada ja kuulata selle hääldust. Juhendid saab lugeda{' '}
                            <button className="pronunciation-variants__guide-link" onClick={() => setShowGuide(true)}>siit</button>.
                          </p>
                          <div className="pronunciation-variants__input-container">
                            <div className="input-wrapper">
                              <input ref={inputRef} type="text" value={customVariant} onChange={(e) => setCustomVariant(e.target.value)}
                                placeholder="Kirjuta oma foneetiline variant" className="pronunciation-variants__input" />
                              {customVariant && (
                                <button onClick={() => setCustomVariant('')} className="pronunciation-variants__input-clear" aria-label="Clear input">
                                  <CloseIcon size="sm" />
                                </button>
                              )}
                            </div>
                            <div className="pronunciation-variants__input-actions">
                              <button onClick={handlePlayCustomVariant} disabled={!customVariant.trim() || isCustomLoading}
                                className={`button button--primary button--icon-only button--circular ${isCustomLoading ? 'loading' : ''} ${isCustomPlaying ? 'playing' : ''}`}
                                title={isCustomLoading ? 'Laen...' : isCustomPlaying ? 'Mängib' : 'Kuula'}>
                                {isCustomLoading ? <div className="loader-spinner"></div> : isCustomPlaying ? <PauseIcon size="2xl" /> : <PlayIcon size="2xl" />}
                              </button>
                              <button onClick={handleUseCustomVariant} disabled={!customVariant.trim()} className="button button--secondary">Kasuta</button>
                            </div>
                          </div>
                          <div className="pronunciation-variants__markers-toolbar">
                            <button onClick={() => insertMarkerAtCursor('`')} className="pronunciation-variants__marker-button" title="Kolmas välde">`</button>
                            <button onClick={() => insertMarkerAtCursor('´')} className="pronunciation-variants__marker-button" title="Rõhuline silp">´</button>
                            <button onClick={() => insertMarkerAtCursor("'")} className="pronunciation-variants__marker-button" title="Palatalisatsioon">'</button>
                            <button onClick={() => insertMarkerAtCursor('+')} className="pronunciation-variants__marker-button" title="Liitsõna piir">+</button>
                          </div>
                        </div>
                        <button className="pronunciation-variants__toggle-link" onClick={handleCloseCustomForm}>Eemalda loodud variant</button>
                      </>
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
