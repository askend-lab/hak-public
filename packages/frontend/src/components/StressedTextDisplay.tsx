'use client';

import { useState, useRef, useEffect } from 'react';
import PhoneticGuideModal from './PhoneticGuideModal';
import { transformToUI, transformToVabamorf } from '@/utils/phoneticMarkers';

interface StressedTextDisplayProps {
  stressedText: string | null;
  originalText: string;
  onWordClick?: (word: string, index: number) => void;
  onPlayStressed?: () => void;
  onAddStressedToPlaylist?: () => void;
  onAddStressedToTask?: () => void;
  isStressedLoading?: boolean;
  canAddStressedToPlaylist?: boolean;
  canAddStressedToTask?: boolean;
  onPhoneticTextChange?: (newText: string) => void;
  selectedWord?: string | null;
  isPronunciationPanelOpen?: boolean;
}

export default function StressedTextDisplay({
  stressedText,
  originalText,
  onWordClick,
  onPlayStressed,
  onAddStressedToPlaylist,
  onAddStressedToTask,
  isStressedLoading,
  canAddStressedToPlaylist,
  canAddStressedToTask,
  onPhoneticTextChange,
  selectedWord,
  isPronunciationPanelOpen
}: StressedTextDisplayProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  // editedText stores the UI-friendly version with transformed markers
  const [editedText, setEditedText] = useState(transformToUI(stressedText) || '');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Split original text into words
  const originalWords = originalText.trim().split(/\s+/);

  // Update edited text when stressedText changes (transform to UI format)
  useEffect(() => {
    if (stressedText) {
      setEditedText(transformToUI(stressedText) || '');
    }
  }, [stressedText]);

  // Focus input when entering edit mode (without selecting all text)
  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
      // Position cursor at the end instead of selecting all text
      const textLength = inputRef.current.value.length;
      inputRef.current.setSelectionRange(textLength, textLength);
    }
  }, [isEditMode]);

  if (!stressedText) {
    return null;
  }


  const handleEdit = () => {
    setIsEditMode(true);
    // When entering edit mode, ensure we have the UI-transformed version
    setEditedText(transformToUI(stressedText) || '');
  };

  const handleSave = () => {
    setIsEditMode(false);
    if (onPhoneticTextChange) {
      // Convert UI markers back to Vabamorf format before saving
      const vabamorfText = transformToVabamorf(editedText);
      onPhoneticTextChange(vabamorfText || '');
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset to the UI-transformed version of the original
    setEditedText(transformToUI(stressedText) || '');
  };

  const insertSymbol = (symbol: string) => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = editedText.substring(0, start) + symbol + editedText.substring(end);
      setEditedText(newText);
      
      // Restore cursor position after the inserted symbol
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
  };


  return (
    <div className="synthesis-phonetic-section">
      <div className="phonetic-content">
        <div className="text-comparison">
          <div className="original-text">
            <div className="original-text-header">
              <span className="text-label">Uuri sõna variandid:</span>
              {onWordClick && !isEditMode && (
                <span className="interaction-hint">Klõpsa sõnale variante vaatamiseks</span>
              )}
            </div>
            <div className="text-words">
              {originalWords.map((word, index) => {
                const isSelected = isPronunciationPanelOpen && selectedWord === word;
                return (
                  <span
                    key={`orig-${index}`}
                    className={`word-element ${onWordClick && !isEditMode ? 'clickable' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => !isEditMode && onWordClick?.(word, index)}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
          {/* Redesigned Phonetic Section with Better Information Hierarchy */}
          <div className="phonetic-section-redesigned">
            <div className="phonetic-header">
              <span className="text-label">Foneetiline kuju:</span>
              
              {/* Edit controls transition smoothly in the same position */}
              <div className="edit-controls-area">
                {!isEditMode ? (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="edit-button-inline"
                    title="Muuda foneetilist teksti"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Muuda</span>
                  </button>
                ) : (
                  <div className="edit-actions-inline">
                    <button
                      onClick={handleSave}
                      className="edit-save-button"
                      title="Salvesta muudatused"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                      <span>Salvesta</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="edit-cancel-button"
                      title="Tühista muudatused"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      <span>Tühista</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditMode ? (
              <div className="phonetic-edit-mode">

                <div className="phonetic-edit-area">
                  <textarea
                    ref={inputRef}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="phonetic-edit-input"
                    placeholder="Sisesta foneetiline tekst märgenditega..."
                    rows={3}
                  />
                  
                  <div className="phonetic-symbol-toolbar">
                    <div className="symbol-toolbar-section">
                      <span className="toolbar-label">Foneetilised märgendid:</span>
                      <div className="symbol-buttons">
                        <button
                          type="button"
                          onClick={() => insertSymbol('`')}
                          className="symbol-btn"
                          title="Kolmas välde"
                        >
                          `
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSymbol('´')}
                          className="symbol-btn"
                          title="Rõhuline silp"
                        >
                          ´
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSymbol("'")}
                          className="symbol-btn"
                          title="Palatalisatsioon"
                        >
                          '
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSymbol('+')}
                          className="symbol-btn"
                          title="Liitsõna piir"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="symbol-toolbar-section">
                      <span className="toolbar-label">Juhend:</span>
                      <div className="symbol-buttons">
                        <button
                          type="button"
                          onClick={() => setShowGuideModal(true)}
                          className="guide-toolbar-button"
                          title="Ava täielik juhend"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="phonetic-content-card">
                <div className="phonetic-text-container">
                  <span className="phonetic-value">{editedText}</span>
                </div>
                
                <div className="phonetic-actions-integrated">
                  {onPlayStressed && (
                    <button
                      onClick={onPlayStressed}
                      disabled={isStressedLoading}
                      className="button button--play-primary"
                      title={isStressedLoading ? 'Töötleb...' : 'Kuula foneetilist versiooni'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"/>
                      </svg>
                      <span>Kuula</span>
                    </button>
                  )}
                  
                  {onAddStressedToPlaylist && canAddStressedToPlaylist && (
                    <button
                      onClick={onAddStressedToPlaylist}
                      disabled={!canAddStressedToPlaylist}
                      className="phonetic-add-button-secondary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      <span>Lisa kõnevooru</span>
                    </button>
                  )}
                  
                  {onAddStressedToTask && canAddStressedToTask && (
                    <button
                      onClick={onAddStressedToTask}
                      disabled={!canAddStressedToTask}
                      className="phonetic-add-button-secondary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                      <span>Lisa ülesandesse</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <PhoneticGuideModal 
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}