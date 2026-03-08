// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/services";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { CloseIcon, ErrorIcon } from "@/components/ui/Icons";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useModalFocusTrap(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) {return;}
    previousFocusRef.current = document.activeElement as HTMLElement;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") {onCloseRef.current();} };
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) {return;}
      const els = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = els[0];
      const last = els[els.length - 1];
      if (!first || !last) {return;}
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onEsc);
    document.addEventListener("keydown", onTab);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => { modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus(); });
    return () => { document.removeEventListener("keydown", onEsc); document.removeEventListener("keydown", onTab); document.body.style.overflow = prev; previousFocusRef.current?.focus(); };
  }, [isOpen]);

  return modalRef;
}

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="login-modal__error" role="alert">
    <ErrorIcon size="md" />
    <p>{error}</p>
  </div>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const TaraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#0066CC" />
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">EE</text>
  </svg>
);

function LoginButtons({ isLoading, onTara, onGoogle }: { isLoading: boolean; onTara: () => void; onGoogle: () => void }) {
  return (
    <div className="login-modal__actions">
      <button type="button" onClick={onTara} className="button button--primary login-modal__tara-button" disabled={isLoading}>
        <TaraIcon />{isLoading ? "Suunan..." : "Logi sisse autentimisteenuse kaudu"}
      </button>
      <div className="login-modal__divider">
        <hr className="login-modal__divider-line" />
        <span className="login-modal__divider-text">või</span>
        <hr className="login-modal__divider-line" />
      </div>
      <button type="button" onClick={onGoogle} className="button button--secondary login-modal__google-button" disabled={isLoading}>
        <GoogleIcon />{isLoading ? "Suunan..." : "Jätka Google'iga"}
      </button>
    </div>
  );
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, loginWithTara } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleGoogle = async () => { setError(null); setIsLoading(true); try { await login(); } catch (err) { setError(getErrorMessage(err, "Sisselogimine ebaõnnestus")); setIsLoading(false); } };
  const handleTara = () => { setError(null); setIsLoading(true); loginWithTara(); };
  const handleClose = () => { if (!isLoading) { setError(null); onClose(); } };
  const modalRef = useModalFocusTrap(isOpen, handleClose);
  if (!isOpen) {return null;}
  const onBackdrop = (e: React.MouseEvent) => { if (e.target === e.currentTarget) {handleClose();} };
  return (
    <>
      <div className="base-modal__backdrop" onClick={onBackdrop} aria-hidden="true" />
      <div ref={modalRef} className="base-modal base-modal--medium login-modal" role="dialog" aria-modal="true" aria-label="Logi sisse">
        <div className="login-modal__header">
          <img src="/icons/logo.svg" alt="EKI Logo" className="login-modal__intro-logo" />
          <button onClick={handleClose} className="base-modal__close" aria-label="Sulge" type="button">
            <CloseIcon size="2xl" />
          </button>
        </div>
        <div className="login-modal__body">
          <h2 className="login-modal__title">Logi sisse</h2>
          <p className="login-modal__intro-description">
            Logi sisse, et luua ja hallata ülesandeid
          </p>
          {error && <ErrorDisplay error={error} />}
          <LoginButtons isLoading={isLoading} onTara={handleTara} onGoogle={() => { void handleGoogle(); }} />
          <p className="login-modal__privacy">Sisselogimisel nõustud meie kasutustingimustega</p>
        </div>
      </div>
    </>
  );
}
