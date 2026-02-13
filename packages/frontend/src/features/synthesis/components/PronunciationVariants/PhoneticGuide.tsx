// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { CloseIcon, BackIcon } from "@/components/ui/Icons";
import { markers } from "@/data/markerData";

interface PhoneticGuideProps {
  onBack: () => void;
  onClose: () => void;
}

const MarkerItem = ({
  symbol,
  name,
  rule,
  examples,
}: {
  symbol: string;
  name: string;
  rule: string;
  examples: string[];
}) => (
  <div className="pronunciation-variants__marker-item">
    <div className="pronunciation-variants__marker-symbol">
      <code>{symbol}</code>
      <span className="pronunciation-variants__marker-name">{name}</span>
    </div>
    <div className="pronunciation-variants__marker-rule">{rule}</div>
    <div className="pronunciation-variants__marker-examples">
      {examples.map((ex, i) => (
        <span key={i} className="pronunciation-variants__item-tag">
          {ex}
        </span>
      ))}
    </div>
  </div>
);

export default function PhoneticGuide({ onBack, onClose }: PhoneticGuideProps) {
  return (
    <div className="pronunciation-variants__guide-view">
      <div className="pronunciation-variants__guide-view-header">
        <button
          onClick={onBack}
          className="pronunciation-variants__back-button--icon-only"
          aria-label="Tagasi variantide juurde"
          type="button"
        >
          <BackIcon size="2xl" />
        </button>
        <h4>Hääldusmärkide juhend</h4>
        <button
          onClick={onClose}
          className="pronunciation-variants__close"
          aria-label="Sulge"
          type="button"
        >
          <CloseIcon size="2xl" />
        </button>
      </div>
      <div className="pronunciation-variants__guide-view-content">
        <p className="pronunciation-variants__guide-intro">
          Hääldusmärgid aitavad täpsustada sõna hääldust. Klõpsa märgil, et
          lisada see kursori asukohta.
        </p>
        {markers.map((m) => (
          <MarkerItem key={m.symbol} {...m} />
        ))}
      </div>
    </div>
  );
}
