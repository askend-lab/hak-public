// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect } from "react";

const CONSENT_KEY = "hak_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="status">
      <div className="cookie-consent__content">
        <p className="cookie-consent__text">
          See rakendus kasutab küpsiseid ja kohalikku salvestusruumi
          kasutajakogemuse parandamiseks ning veahalduseks (Sentry).
          Jätkates nõustute nende kasutamisega.
        </p>
        <button
          className="cookie-consent__button"
          onClick={handleAccept}
          type="button"
        >
          Nõustun
        </button>
      </div>
    </div>
  );
}
