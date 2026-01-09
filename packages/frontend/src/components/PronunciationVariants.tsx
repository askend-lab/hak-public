'use client';

import { useState, useEffect, useRef } from 'react';
import { transformToUI, transformToVabamorf } from '@/utils/phoneticMarkers';
import { synthesizeWithPolling } from '@/utils/synthesize';

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
  customPhoneticForm?: string | null; // Custom phonetic form if word has been modified
}

export default function PronunciationVariants({
  word,
  isOpen,
  onClose,
  onUseVariant,
  customPhoneticForm
}: PronunciationVariantsProps) {
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
      // Start with empty input
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

      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }

      const data = await response.json();
      
      // Filter to show only phonetically unique variants (by text only, ignore description)
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

      audio.onloadeddata = () => {
        setLoadingVariant(null);
        setPlayingVariant(variant.text);
      };

      audio.onended = () => {
        setPlayingVariant(null);
        setLoadingVariant(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingVariant(null);
        setLoadingVariant(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Failed to play variant:', error);
      setPlayingVariant(null);
      setLoadingVariant(null);
    }
  };

  const handleUseVariant = (variant: Variant) => {
    onUseVariant?.(variant.text);
  };

  const parsePhoneticMarkers = (text: string): Array<{tag: string, type: string}> => {
    const markers: Array<{tag: string, type: string}> = [];

    // Check for Vabamorf markers (text comes from API in Vabamorf format)
    // Only show markers that are kept in the UI transformation
    if (text.includes('<')) markers.push({tag: 'kolmas välde', type: 'phonetic'});
    if (text.includes('?')) markers.push({tag: 'ebareeglipärane rõhk', type: 'phonetic'});
    if (text.includes(']')) markers.push({tag: 'palatalisatsioon', type: 'phonetic'});
    if (text.includes('_')) markers.push({tag: 'liitsõna piir', type: 'boundary'});

    // These markers are omitted in UI, so we don't show them as tags
    // if (text.includes('~')) markers.push({tag: 'n-k eraldus', type: 'phonetic'});
    // if (text.includes('+')) markers.push({tag: 'morfeemi piir', type: 'boundary'});
    // if (text.includes('=')) markers.push({tag: 'tühik ühendites', type: 'boundary'});
    // if (text.includes('[')) markers.push({tag: 'käändelõpu eraldus', type: 'boundary'});

    // Auxiliary symbols (Abisümbolid) are not displayed as tags
    // if (text.includes("'")) markers.push({tag: 'apostroof', type: 'auxiliary'});
    // if (text.includes('()')) markers.push({tag: 'kahtlane vorm', type: 'auxiliary'});
    // if (text.includes('&')) markers.push({tag: 'paralleelne variant', type: 'auxiliary'});
    // if (text.includes('#')) markers.push({tag: 'semantiline põhivorm', type: 'auxiliary'});

    // Default tag when no markers are found
    if (markers.length === 0) {
      markers.push({tag: 'rõhk esimesel silbil', type: 'default'});
    }

    return markers;
  };

  const generatePronunciationExplanation = (uiText: string): string => {
    const explanations: string[] = [];
    
    // Find ` markers and the letter after (kolmas välde - long vowel)
    const longVowelRegex = /`([a-zõäöüšž])/gi;
    let match;
    while ((match = longVowelRegex.exec(uiText)) !== null) {
      // Capitalize for sentence start, wrap letter in quotes
      explanations.push(`"${(match[1] ?? '').toUpperCase()}" on pikk`);
    }
    
    // Find ´ markers and the letter after (stress)
    const stressRegex = /´([a-zõäöüšž])/gi;
    while ((match = stressRegex.exec(uiText)) !== null) {
      // Sentence starts with "Rõhk", letter in quotes
      explanations.push(`Rõhk on "${match[1] ?? ''}" peal`);
    }
    
    // Find ' markers and the letter before (palatalization - soft)
    const palatalRegex = /([a-zõäöüšž])'/gi;
    while ((match = palatalRegex.exec(uiText)) !== null) {
      // Capitalize for sentence start, wrap letter in quotes
      explanations.push(`"${(match[1] ?? '').toUpperCase()}" on pehme hääldusega`);
    }
    
    // Check for + marker (compound word boundary)
    if (uiText.includes('+')) {
      explanations.push(`Põhirõhk esimesel osal – häälda seda nagu eraldi sõna`);
    }
    
    // Default explanation when no markers are found
    if (explanations.length === 0) {
      return 'Häälda nii, nagu on kirjutatud – aga kuula pikkust ja pehmust';
    }
    
    return explanations.join('. ');
  };

  const handlePlayCustomVariant = async () => {
    if (!customVariant.trim()) return;

    setIsCustomLoading(true);
    setIsCustomPlaying(false);

    try {
      // Transform UI markers to Vabamorf format for synthesis
      const vabamorfText = transformToVabamorf(customVariant);

      const audioUrl = await synthesizeWithPolling(vabamorfText || '', 'efm_s');
      const audio = new Audio(audioUrl);

      audio.onloadeddata = () => {
        setIsCustomLoading(false);
        setIsCustomPlaying(true);
      };

      audio.onended = () => {
        setIsCustomPlaying(false);
        setIsCustomLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsCustomPlaying(false);
        setIsCustomLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Failed to play custom variant:', error);
      setIsCustomPlaying(false);
      setIsCustomLoading(false);
    }
  };

  const handleUseCustomVariant = () => {
    if (!customVariant.trim()) return;
    // Transform UI markers to Vabamorf format before passing to parent
    const vabamorfText = transformToVabamorf(customVariant);
    onUseVariant?.(vabamorfText || '');
  };

  const handleCloseCustomForm = () => {
    setShowCustomForm(false);
    setCustomVariant('');
  };

  const insertMarkerAtCursor = (marker: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = customVariant.substring(0, start) + marker + customVariant.substring(end);

    setCustomVariant(newValue);

    // Set cursor position after the inserted marker
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + marker.length, start + marker.length);
    }, 0);
  };


  if (!isOpen) return null;

  return (
    <>
      <div className="pronunciation-variants__panel">
        <div className="pronunciation-variants__header">
          <h3 className="pronunciation-variants__title">
            {word}
          </h3>
          <div className="pronunciation-variants__header-actions">
            <button onClick={onClose} className="pronunciation-variants__close" aria-label="Close">
              <img src="/icons/Close%20X.svg" alt="Close" />
            </button>
          </div>
        </div>

        <div className="pronunciation-variants__content">
          {showGuide ? (
            <div className="pronunciation-variants__guide-view">
              <div className="pronunciation-variants__guide-view-header">
                <button
                  onClick={() => setShowGuide(false)}
                  className="pronunciation-variants__back-button"
                  aria-label="Tagasi variantide juurde"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Tagasi
                </button>
                <h4>Foneetiliste märkide juhend</h4>
              </div>

              <div className="pronunciation-variants__guide-view-content">
                <div className="pronunciation-variants__guide-section-block">
                  <p>Foneetilised märgid aitavad täpsustada sõna hääldust. Klõpsa märgil, et lisada see kursori asukohta.</p>
                </div>

                <div className="pronunciation-variants__guide-section-block">
                  <div className="pronunciation-variants__marker-item">
                    <div className="pronunciation-variants__marker-symbol">
                      <code>`</code>
                      <span className="pronunciation-variants__marker-name">kolmas välde</span>
                    </div>
                    <div className="pronunciation-variants__marker-rule">
                      <strong>Reegel:</strong> Paikneb kolmandavältelise silbi esimese vokaali ees ainult täishääliku ees.
                    </div>
                    <div className="pronunciation-variants__marker-examples">
                      <strong>Näited:</strong>
                      <ul>
                        <li><code>k`ätte</code></li>
                        <li><code>par`ool</code></li>
                      </ul>
                    </div>
                  </div>

                  <div className="pronunciation-variants__marker-item">
                    <div className="pronunciation-variants__marker-symbol">
                      <code>´</code>
                      <span className="pronunciation-variants__marker-name">ebareeglipärase rõhu märk</span>
                    </div>
                    <div className="pronunciation-variants__marker-rule">
                      <strong>Reegel:</strong> Kasutatakse ainult kui rõhk ei ole reeglipärane ehk esimesel silbil. Paikneb pearõhulise silbi esimese vokaali ees.
                    </div>
                    <div className="pronunciation-variants__marker-examples">
                      <strong>Näited:</strong>
                      <ul>
                        <li><code>selj´anka</code></li>
                        <li><code>dial´ektika</code></li>
                      </ul>
                    </div>
                  </div>

                  <div className="pronunciation-variants__marker-item">
                    <div className="pronunciation-variants__marker-symbol">
                      <code>'</code>
                      <span className="pronunciation-variants__marker-name">palatalisatsioon</span>
                    </div>
                    <div className="pronunciation-variants__marker-rule">
                      <strong>Reegel:</strong> Võib paikneda konsonantide d, l, n, s ja t järel. Kahetähelise pika hääliku puhul on see märk vaid esimese tähe järel.
                    </div>
                    <div className="pronunciation-variants__marker-examples">
                      <strong>Näited:</strong>
                      <ul>
                        <li><code>pad'ja</code></li>
                        <li><code>p`an't</code></li>
                        <li><code>k`as't</code></li>
                        <li><code>s`al'l</code></li>
                        <li><code>kas'si</code></li>
                      </ul>
                    </div>
                  </div>

                  <div className="pronunciation-variants__marker-item">
                    <div className="pronunciation-variants__marker-symbol">
                      <code>+</code>
                      <span className="pronunciation-variants__marker-name">liitsõnapiir</span>
                    </div>
                    <div className="pronunciation-variants__marker-rule">
                      <strong>Reegel:</strong> Märgib liitsõna osade vahelist piiri.
                    </div>
                    <div className="pronunciation-variants__marker-examples">
                      <strong>Näited:</strong>
                      <ul>
                        <li><code>maja+uks</code></li>
                        <li><code>auto+juhт</code></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pronunciation-variants__guide-section-block pronunciation-variants__guide-section-block--tips">
                  <h5>Kasulikud näpunäited:</h5>
                  <ul>
                    <li>Märke saad sisestada nuppudega sisestusvälja all</li>
                    <li>Kuula oma varianti enne kasutamist, et kontrollida hääldust</li>
                    <li>Kui oled rahul, vajuta "Kasuta" et rakendada variant lausesse</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="pronunciation-variants__loading">
                  <p>Laen variante...</p>
                </div>
              )}

              {error && (
                <div className="pronunciation-variants__error">
                  <p>Viga: {error}</p>
                </div>
              )}

              {!isLoading && !error && variants.length > 0 && (
            <div className="pronunciation-variants__list">
              {/* Existing variants */}
              {variants.map((variant, index) => {
                const isSelected = customPhoneticForm === variant.text;
                return (
                <div key={index} className={`pronunciation-variants__item ${isSelected ? 'pronunciation-variants__item--selected' : ''}`}>
                  <div className="pronunciation-variants__item-header">
                    <div className="pronunciation-variants__item-info">
                      <div className="pronunciation-variants__item-text">{transformToUI(variant.text ?? '')}</div>
                      <div className="pronunciation-variants__item-tags">
                        {parsePhoneticMarkers(variant.text ?? '').map((tagObj, i) => (
                          <span
                            key={i}
                            className="pronunciation-variants__item-tag"
                          >
                            {tagObj.tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pronunciation-variants__item-actions">
                    <button
                      onClick={() => handlePlayVariant(variant)}
                      disabled={loadingVariant === variant.text}
                      className={`button button--primary button--icon-only button--circular ${loadingVariant === variant.text ? 'loading' : ''} ${playingVariant === variant.text ? 'playing' : ''}`}
                      title={loadingVariant === variant.text ? 'Laen...' : playingVariant === variant.text ? 'Mängib' : 'Mängi'}
                    >
                      {loadingVariant === variant.text ? (
                        <div className="loader-spinner"></div>
                      ) : playingVariant === variant.text ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16"/>
                          <rect x="14" y="4" width="4" height="16"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21"/>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleUseVariant(variant)}
                      className="button button--secondary"
                    >
                      Kasuta
                    </button>
                    </div>
                  </div>
                  {generatePronunciationExplanation(transformToUI(variant.text ?? '') ?? '') && (
                    <div className="pronunciation-variants__item-explanation">
                      <svg className="pronunciation-variants__explanation-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 6L8 10H4V14H8L12 18V6Z"/>
                        <path d="M16 9C16.5 9.5 17 10.5 17 12C17 13.5 16.5 14.5 16 15"/>
                        <path d="M19 6C20.5 7.5 21.5 9.5 21.5 12C21.5 14.5 20.5 16.5 19 18"/>
                      </svg>
                      <span>{generatePronunciationExplanation(transformToUI(variant.text ?? '') ?? '')}</span>
                    </div>
                  )}
                </div>
              );
              })}

              {/* Custom variant creation */}
              <div className="pronunciation-variants__custom-section">
                {!showCustomForm ? (
                  <button 
                    className="pronunciation-variants__toggle-link"
                    onClick={() => setShowCustomForm(true)}
                  >
                    Loo oma variant
                  </button>
                ) : (
                  <>
                    <div className="pronunciation-variants__form">
                      <h4 className="pronunciation-variants__form-title">Loo oma variant</h4>
                      <p className="pronunciation-variants__form-description">
                        Sisesta oma foneetilise tekst või sõna variant, et kasutada ja kuulata selle hääldust. Juhendid saab lugeda{' '}
                        <button 
                          className="pronunciation-variants__guide-link"
                          onClick={() => setShowGuide(true)}
                        >
                          siit
                        </button>.
                      </p>

                      <div className="pronunciation-variants__input-container">
                        <div className="input-wrapper">
                          <input
                            ref={inputRef}
                            type="text"
                            value={customVariant}
                            onChange={(e) => setCustomVariant(e.target.value)}
                            placeholder="Kirjuta oma foneetiline variant"
                            className="pronunciation-variants__input"
                          />
                          {customVariant && (
                            <button
                              onClick={() => setCustomVariant('')}
                              className="pronunciation-variants__input-clear"
                              aria-label="Clear input"
                            >
                              <img src="/icons/Close_SM.svg" alt="Clear" />
                            </button>
                          )}
                        </div>

                        <div className="pronunciation-variants__input-actions">
                          <button
                            onClick={handlePlayCustomVariant}
                            disabled={!customVariant.trim() || isCustomLoading}
                            className={`button button--primary button--icon-only button--circular ${isCustomLoading ? 'loading' : ''} ${isCustomPlaying ? 'playing' : ''}`}
                            title={isCustomLoading ? 'Laen...' : isCustomPlaying ? 'Mängib' : 'Kuula'}
                          >
                            {isCustomLoading ? (
                              <div className="loader-spinner"></div>
                            ) : isCustomPlaying ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16"/>
                                <rect x="14" y="4" width="4" height="16"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5,3 19,12 5,21"/>
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={handleUseCustomVariant}
                            disabled={!customVariant.trim()}
                            className="button button--secondary"
                          >
                            Kasuta
                          </button>
                        </div>
                      </div>

                      {/* Phonetic markers toolbar */}
                      <div className="pronunciation-variants__markers-toolbar">
                        <button
                          onClick={() => insertMarkerAtCursor('`')}
                          className="pronunciation-variants__marker-button"
                          title="Kolmas välde"
                        >
                          `
                        </button>
                        <button
                          onClick={() => insertMarkerAtCursor('´')}
                          className="pronunciation-variants__marker-button"
                          title="Rõhuline silp"
                        >
                          ´
                        </button>
                        <button
                          onClick={() => insertMarkerAtCursor("'")}
                          className="pronunciation-variants__marker-button"
                          title="Palatalisatsioon"
                        >
                          '
                        </button>
                        <button
                          onClick={() => insertMarkerAtCursor('+')}
                          className="pronunciation-variants__marker-button"
                          title="Liitsõna piir"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      className="pronunciation-variants__toggle-link"
                      onClick={handleCloseCustomForm}
                    >
                      Eemalda loodud variant
                    </button>
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