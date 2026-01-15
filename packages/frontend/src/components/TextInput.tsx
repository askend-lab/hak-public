 
'use client';

import React from 'react';
import { CloseIcon, CheckCircleIcon, PlayIcon } from './ui/Icons';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAddToPlaylist?: () => void;
  isLoading: boolean;
  canAddToPlaylist?: boolean;
}

export default function TextInput({ value, onChange, onSubmit, onAddToPlaylist: _onAddToPlaylist, isLoading, canAddToPlaylist: _canAddToPlaylist }: TextInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !isLoading) {
      onSubmit();
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="eki-text-input">
      <div className="text-input-header">
        <h3 className="text-input-title">Teksti kõnesüntees</h3>
      </div>
      <div className="input-section">
        <div className="input-field">
          <input
            id="estonian-text"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            placeholder="Sisesta tekst või sõna..."
            className="eki-input-field"
          />
          {value.trim() && !isLoading && (
            <button
              onClick={handleClear}
              className="input-clear-button"
              title="Kustuta tekst"
              type="button"
            >
              <CloseIcon size="2xl" />
            </button>
          )}
        </div>
        <div className="input-guidance">
          <div className="input-example">
            <span className="example-label">Näiteks:</span>
            <span className="example-text">"Printsess eestlanna elab lossis"</span>
          </div>
          <div className="input-hint">
            <CheckCircleIcon size="md" />
            <span>Kuula hääldust ja uuri erinevaid variante</span>
          </div>
        </div>
      </div>
      
      <div className="button-section">
        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="button button--play-primary"
        >
          <PlayIcon size="md" />
          <span>{isLoading ? 'Sünteseerin...' : 'Kuula'}</span>
        </button>
      </div>
    </div>
  );
}
