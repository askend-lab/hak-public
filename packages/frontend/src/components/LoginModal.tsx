'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateIsikukood } from '@/utils/isikukood';
import BaseModal from './BaseModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [isikukood, setIsikukood] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'smartid' | 'mobileid' | 'idcard'>('smartid');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!isikukood.trim()) {
      setError('Palun sisesta isikukood');
      return;
    }

    if (!validateIsikukood(isikukood)) {
      setError('Vigane isikukood. Palun kontrolli ja proovi uuesti');
      return;
    }

    setIsLoading(true);

    try {
      await login(isikukood);
      setIsikukood('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sisselogimine ebaõnnestus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsikukood('');
      setError(null);
      onClose();
    }
  };

  // Demo isikukood examples for testing
  const demoIsikukoodid = [
    { code: '38001085718', name: 'Margus Tamm' },
    { code: '49203156512', name: 'Jana Sepp' },
    { code: '47012093717', name: 'Pille Kukk' },
    { code: '48506124519', name: 'Liina Rebane' }
  ];

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={true}
      size="medium"
      className="login-modal"
    >
      <div className="login-modal__intro">
        <img src="/icons/logo.svg" alt="Logo" className="login-modal__intro-logo" />
        <h2 className="login-modal__intro-title">Logi sisse siseveebi</h2>
        <p className="login-modal__intro-description">
          Sisene, et luua ja hallata ülesandeid
        </p>
      </div>

      <div className="login-modal__auth-methods">
        <button
          onClick={() => setAuthMethod('smartid')}
          className={`login-modal__auth-tab ${authMethod === 'smartid' ? 'login-modal__auth-tab--active' : ''}`}
          disabled={isLoading}
        >
          Smart-ID
        </button>
        <button
          onClick={() => setAuthMethod('mobileid')}
          className={`login-modal__auth-tab ${authMethod === 'mobileid' ? 'login-modal__auth-tab--active' : ''}`}
          disabled={isLoading}
        >
          Mobiil-ID
        </button>
        <button
          onClick={() => setAuthMethod('idcard')}
          className={`login-modal__auth-tab ${authMethod === 'idcard' ? 'login-modal__auth-tab--active' : ''}`}
          disabled={isLoading}
        >
          ID-kaart
        </button>
      </div>

      <form onSubmit={handleSubmit} className="login-modal__form">
        <div className="login-modal__field">
          <label htmlFor="isikukood" className="login-modal__label">
            Isikukood
          </label>
          <input
            id="isikukood"
            type="text"
            value={isikukood}
            onChange={(e) => {
              setIsikukood(e.target.value.replace(/\D/g, '').slice(0, 11));
              setError(null);
            }}
            className="login-modal__input"
            placeholder="Sisesta 11-kohaline isikukood"
            maxLength={11}
            disabled={isLoading}
            autoFocus
          />
          <div className="login-modal__field-help">
            11-kohaline number (nt: 38001085718)
          </div>
        </div>

        {error && (
          <div className="login-modal__error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="login-modal__loading">
            <div className="login-modal__loading-spinner"></div>
            <p className="login-modal__loading-text">
              {authMethod === 'smartid' && 'Ootan Smart-ID kinnitust...'}
              {authMethod === 'mobileid' && 'Ootan Mobiil-ID kinnitust...'}
              {authMethod === 'idcard' && 'Kontrollin ID-kaarti...'}
            </p>
            <p className="login-modal__loading-subtext">
              Palun kinnita sisselogimine oma seadmes
            </p>
          </div>
        )}

        <div className="login-modal__actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={isLoading || !isikukood || isikukood.length !== 11}
          >
            {isLoading ? 'Sisenen...' : 'Sisene'}
          </button>
        </div>
      </form>

      {/* Demo helpers */}
      <div className="login-modal__demo-helper">
        <p className="login-modal__demo-title">Demo isikukoodid:</p>
        <div className="login-modal__demo-codes">
          {demoIsikukoodid.map(demo => (
            <button
              key={demo.code}
              onClick={() => setIsikukood(demo.code)}
              className="login-modal__demo-code"
              disabled={isLoading}
              type="button"
            >
              <span className="login-modal__demo-code-number">{demo.code}</span>
              <span className="login-modal__demo-code-name">({demo.name})</span>
            </button>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}
