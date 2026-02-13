// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { InfoIcon } from "./Icons";
import MarkerTooltip from "./MarkerTooltip";
import { markers } from "@/data/markerData";

interface MarkersGuideBoxProps {
  /** Callback when a marker button is clicked */
  onInsertMarker: (marker: string) => void;
  /** Callback when the info icon is clicked to show the full guide */
  onShowGuide: () => void;
  /** Optional additional class name */
  className?: string;
}

/**
 * MarkersGuideBox - A mini guide section for phonetic markers
 * Includes a header with title and info icon, intro text, and marker buttons with tooltips
 */
export default function MarkersGuideBox({
  onInsertMarker,
  onShowGuide,
  className = "",
}: MarkersGuideBoxProps) {
  return (
    <div className={`markers-guide-box ${className}`.trim()}>
      <div className="markers-guide-box__header">
        <h3 className="markers-guide-box__title">Hääldusmärgid</h3>
        <button
          type="button"
          className="markers-guide-box__info-button"
          onClick={onShowGuide}
          aria-label="Ava hääldusmärkide juhend"
          title="Ava täielik juhend"
        >
          <InfoIcon size="lg" />
        </button>
      </div>
      <p className="markers-guide-box__intro">
        Kasuta märke häälduse täpsustamiseks. Klõpsa märgil selle lisamiseks või
        hõlju kohal juhiste nägemiseks.
      </p>
      <div className="markers-guide-box__toolbar">
        {markers.map((marker) => (
          <MarkerTooltip key={marker.symbol} marker={marker} align="left">
            <button
              type="button"
              onClick={() => onInsertMarker(marker.symbol)}
              className="markers-guide-box__marker-button"
              aria-label={marker.name}
            >
              {marker.symbol}
            </button>
          </MarkerTooltip>
        ))}
      </div>
    </div>
  );
}
