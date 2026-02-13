// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import React from "react";
import { transformToUI } from "@/features/synthesis/utils/phoneticMarkers";
import { PlayIcon, PauseIcon } from "@/components/ui/Icons";
import { parsePhoneticMarkers } from "./phoneticHelpers";

interface Variant {
  text: string;
  description: string;
  tags?: string[];
  audioUrl?: string;
}

interface VariantItemProps {
  variant: Variant;
  isSelected: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: (variant: Variant) => void;
  onUse: (variant: Variant) => void;
}

export function VariantItem({
  variant,
  isSelected,
  isPlaying,
  isLoading,
  onPlay,
  onUse,
}: VariantItemProps): React.ReactElement {
  const displayText = transformToUI(variant.text ?? "");
  const markers = parsePhoneticMarkers(variant.text ?? "");

  return (
    <div
      className={`pronunciation-variants__item ${isSelected ? "pronunciation-variants__item--selected" : ""}`}
    >
      <div className="pronunciation-variants__item-header">
        <div className="pronunciation-variants__item-info">
          <div className="pronunciation-variants__item-text">{displayText}</div>
          <div className="pronunciation-variants__item-tags">
            {markers.map((tagObj, i) => (
              <span key={i} className="pronunciation-variants__item-tag">
                {tagObj.tag}
              </span>
            ))}
          </div>
        </div>
        <div className="pronunciation-variants__item-actions">
          <button
            onClick={() => onPlay(variant)}
            disabled={isLoading}
            className={`button button--primary button--icon-only button--circular ${isLoading ? "loading" : ""} ${isPlaying ? "playing" : ""}`}
            title={isLoading ? "Laen..." : isPlaying ? "Mängib" : "Mängi"}
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
            onClick={() => onUse(variant)}
            className="button button--secondary"
          >
            Kasuta
          </button>
        </div>
      </div>
    </div>
  );
}
