// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { useState } from "react";
import { useAuth } from "@/services/auth";
import { getErrorMessage } from "@/utils/getErrorMessage";
import BaseModal from "./BaseModal";
import { ErrorIcon } from "./ui/Icons";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginIntro = () => (
  <div className="login-modal__intro">
    <img src="/icons/logo.png" alt="Logo" className="login-modal__intro-logo" />
    <h2 className="login-modal__intro-title">Logi sisse</h2>
    <p className="login-modal__intro-description">
      Sisene oma Google kontoga, et luua ja hallata ülesandeid
    </p>
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="login-modal__error" role="alert">
    <ErrorIcon size="md" />
    <p>{error}</p>
  </div>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const TaraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#0066CC" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="white"
      fontSize="10"
      fontWeight="bold"
    >
      EE
    </text>
  </svg>
);

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, loginWithTara } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login();
    } catch (err) {
      setError(
        getErrorMessage(err, "Sisselogimine ebaõnnestus"),
      );
      setIsLoading(false);
    }
  };

  const handleTaraLogin = () => {
    setError(null);
    setIsLoading(true);
    loginWithTara();
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={true}
      size="medium"
      className="login-modal"
    >
      <LoginIntro />
      <div className="login-modal__form">
        {error && <ErrorDisplay error={error} />}
        <div className="login-modal__actions">
          <button
            type="button"
            onClick={handleTaraLogin}
            className="button button--primary login-modal__tara-button"
            disabled={isLoading}
            style={{ marginBottom: "0.75rem" }}
          >
            <TaraIcon />
            {isLoading ? "Suunan..." : "Logi sisse TARA-ga"}
          </button>
          <div
            className="login-modal__divider"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              margin: "0.5rem 0",
            }}
          >
            <hr
              style={{
                flex: 1,
                border: "none",
                borderTop: "1px solid var(--color-border, #e0e0e0)",
              }}
            />
            <span
              style={{
                color: "var(--color-text-secondary, #666)",
                fontSize: "0.875rem",
              }}
            >
              või
            </span>
            <hr
              style={{
                flex: 1,
                border: "none",
                borderTop: "1px solid var(--color-border, #e0e0e0)",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="button button--secondary login-modal__google-button login-modal__google-button--flex"
            disabled={isLoading}
          >
            <GoogleIcon />
            {isLoading ? "Suunan..." : "Jätka Google'iga"}
          </button>
        </div>
        <p className="login-modal__privacy">
          Sisselogimisel nõustud meie kasutustingimustega
        </p>
      </div>
    </BaseModal>
  );
}
