/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { useAuth } from '@/services/auth';
import BaseModal from './BaseModal';

interface LoginModalProps { isOpen: boolean; onClose: () => void; message?: string; }

const LoginIntro = () => (
  <div className="login-modal__intro">
    <img src="/icons/logo.svg" alt="Logo" className="login-modal__intro-logo" />
    <h2 className="login-modal__intro-title">Logi sisse</h2>
    <p className="login-modal__intro-description">Sisene oma Google kontoga, et luua ja hallata ülesandeid</p>
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="login-modal__error">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <p>{error}</p>
  </div>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sisselogimine ebaõnnestus');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} showCloseButton={true} size="medium" className="login-modal">
      <LoginIntro />
      <div className="login-modal__form">
        {error && <ErrorDisplay error={error} />}
        <div className="login-modal__actions">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="button button--primary login-modal__google-button"
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
          >
            <GoogleIcon />
            {isLoading ? 'Suunan...' : 'Jätka Google\'iga'}
          </button>
        </div>
        <p className="login-modal__privacy" style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          Sisselogimisel nõustud meie kasutustingimustega
        </p>
      </div>
    </BaseModal>
  );
}
