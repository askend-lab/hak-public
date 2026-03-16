// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


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

function CustomPlayButton({ isLoading, isPlaying, disabled, onClick }: { isLoading: boolean; isPlaying: boolean; disabled: boolean; onClick: () => void }) {
  const cls = `button button--primary button--icon-only button--circular ${isLoading ? "loading" : ""} ${isPlaying ? "playing" : ""}`;
  const title = isLoading ? "Laen..." : isPlaying ? "Mängib" : "Kuula";
  const icon = isLoading ? <div className="loader-spinner"></div> : isPlaying ? <PauseIcon size="2xl" /> : <PlayIcon size="2xl" />;
  return <button onClick={onClick} disabled={disabled} className={cls} title={title}>{icon}</button>;
}

function useMarkerInserter(inputRef: React.RefObject<HTMLInputElement | null>, value: string, onChange: (v: string) => void) {
  return (marker: string): void => {
    const input = inputRef.current;
    if (!input) {return;}
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    onChange(value.substring(0, start) + marker + value.substring(end));
    setTimeout(() => { input.focus(); input.setSelectionRange(start + marker.length, start + marker.length); }, 0);
  };
}

export function CustomVariantForm({ value, onChange, onPlay, onUse, onClose, onShowGuide, isPlaying, isLoading }: CustomVariantFormProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const insertMarker = useMarkerInserter(inputRef, value, onChange);
  return (
    <>
      <div className="pronunciation-variants__form">
        <h4 className="pronunciation-variants__form-title">Loo oma variant</h4>
        <p className="pronunciation-variants__form-description">Sisesta oma tekst hääldusmärkidega ja kuula tulemust.</p>
        <div className="pronunciation-variants__input-container">
          <div className="input-wrapper">
            <input ref={inputRef} type="text" value={value} onChange={(e) => onChange(e.target.value)}
              placeholder="Kirjuta oma hääldusmärkidega variant" aria-label="Kohandatud hääldusvariant" className="pronunciation-variants__input" maxLength={200} />
            {value && <button onClick={() => onChange("")} className="pronunciation-variants__input-clear" aria-label="Tühjenda sisend"><CloseIcon size="sm" /></button>}
          </div>
          <div className="pronunciation-variants__input-actions">
            <CustomPlayButton isLoading={isLoading} isPlaying={isPlaying} disabled={!value.trim() || isLoading} onClick={onPlay} />
            <button onClick={onUse} disabled={!value.trim()} className="button button--secondary">Helinda</button>
          </div>
        </div>
        <MarkersGuideBox onInsertMarker={insertMarker} onShowGuide={onShowGuide} className="pronunciation-variants__markers-guide-box" />
      </div>
      <button className="pronunciation-variants__toggle-link" onClick={onClose}>Eemalda loodud variant</button>
    </>
  );
}
