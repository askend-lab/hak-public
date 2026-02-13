// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import React, { useRef } from "react";
import { CloseIcon, PlayIcon, PauseIcon } from "@/components/ui/Icons";
import MarkersGuideBox from "@/components/ui/MarkersGuideBox";

interface CustomVariantFormProps {
  value: string;
  onChange: (value: string) => void;
  onPlay: () => void;
  onUse: () => void;
  onClose: () => void;
  onShowGuide: () => void;
  isPlaying: boolean;
  isLoading: boolean;
}

export function CustomVariantForm({
  value,
  onChange,
  onPlay,
  onUse,
  onClose,
  onShowGuide,
  isPlaying,
  isLoading,
}: CustomVariantFormProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertMarkerAtCursor = (marker: string): void => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = value.substring(0, start) + marker + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + marker.length, start + marker.length);
    }, 0);
  };

  return (
    <>
      <div className="pronunciation-variants__form">
        <h4 className="pronunciation-variants__form-title">Loo oma variant</h4>
        <p className="pronunciation-variants__form-description">
          Sisesta oma tekst hääldusmärkidega ja kuula tulemust.
        </p>
        <div className="pronunciation-variants__input-container">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Kirjuta oma hääldusmärkidega variant"
              aria-label="Kohandatud hääldusvariant"
              className="pronunciation-variants__input"
            />
            {value && (
              <button
                onClick={() => onChange("")}
                className="pronunciation-variants__input-clear"
                aria-label="Tühjenda sisend"
              >
                <CloseIcon size="sm" />
              </button>
            )}
          </div>
          <div className="pronunciation-variants__input-actions">
            <button
              onClick={onPlay}
              disabled={!value.trim() || isLoading}
              className={`button button--primary button--icon-only button--circular ${isLoading ? "loading" : ""} ${isPlaying ? "playing" : ""}`}
              title={isLoading ? "Laen..." : isPlaying ? "Mängib" : "Kuula"}
            >
              {isLoading ? (
                <div className="loader-spinner"></div>
              ) : isPlaying ? (
                <PauseIcon size="2xl" />
              ) : (
                <PlayIcon size="2xl" />
              )}
            </button>
            <button
              onClick={onUse}
              disabled={!value.trim()}
              className="button button--secondary"
            >
              Helinda
            </button>
          </div>
        </div>
        <MarkersGuideBox
          onInsertMarker={insertMarkerAtCursor}
          onShowGuide={onShowGuide}
          className="pronunciation-variants__markers-guide-box"
        />
      </div>
      <button className="pronunciation-variants__toggle-link" onClick={onClose}>
        Eemalda loodud variant
      </button>
    </>
  );
}
