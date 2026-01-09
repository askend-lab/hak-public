'use client';

import React from 'react';

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <div className="input-guidance">
          <div className="input-example">
            <span className="example-label">Näiteks:</span>
            <span className="example-text">"Printsess eestlanna elab lossis"</span>
          </div>
          <div className="input-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9,12 2,2 4,-4"/>
            </svg>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          <span>{isLoading ? 'Sünteseerin...' : 'Kuula'}</span>
        </button>
      </div>
    </div>
  );
}
