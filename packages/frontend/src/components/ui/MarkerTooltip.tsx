// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useState, useRef, useEffect, useCallback } from "react";
import { type MarkerDefinition } from "@/data/markerData";

type TooltipAlign = "left" | "center" | "right";

interface MarkerTooltipProps {
  /** The marker definition to display in the tooltip */
  marker: MarkerDefinition;
  /** The button/element to wrap with the tooltip */
  children: React.ReactNode;
  /** Horizontal alignment of the tooltip relative to the button */
  align?: TooltipAlign;
}

/**
 * MarkerTooltip - Rich tooltip for phonetic marker buttons
 * Shows marker name, rule, and examples on hover/tap
 * Positioned below button to avoid covering input fields
 * Alignment adjusts based on button position to stay within panel
 */
function useTooltipVisibility() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0); }, []);
  useEffect(() => () => { if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); } }, []);
  useEffect(() => {
    if (!isTouchDevice || !isVisible) {return;}
    const handler = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) { setIsVisible(false); }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
  }, [isTouchDevice, isVisible]);

  const showTooltip = useCallback(() => {
    if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
    setIsVisible(true);
  }, []);
  const hideTooltip = useCallback(() => { hideTimeoutRef.current = setTimeout(() => { setIsVisible(false); }, 100); }, []);

  return { isVisible, setIsVisible, isTouchDevice, wrapperRef, hideTimeoutRef, showTooltip, hideTooltip };
}

export default function MarkerTooltip({
  marker,
  children,
  align = "center",
}: MarkerTooltipProps) {
  const { isVisible, setIsVisible, isTouchDevice, wrapperRef, hideTimeoutRef, showTooltip, hideTooltip } = useTooltipVisibility();

  const handleMouseEnter = isTouchDevice ? undefined : showTooltip;
  const handleMouseLeave = isTouchDevice ? undefined : hideTooltip;
  const handleTooltipMouseEnter = () => { if (hideTimeoutRef.current) {clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null;} };
  const handleTouchStart = (e: React.TouchEvent) => { if (isTouchDevice) {e.preventDefault(); setIsVisible((prev) => !prev);} };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Escape" && isVisible) {setIsVisible(false);} };
  const tooltipClassName = `marker-tooltip marker-tooltip--align-${align}`;

  return (
    <div
      ref={wrapperRef}
      className="marker-tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      role="toolbar"
      tabIndex={0}
    >
      {children}
      {isVisible && (
        <div
          className={tooltipClassName}
          role="tooltip"
        >
          <div
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={hideTooltip}
          >
          <div className="marker-tooltip__arrow" />
          <div className="marker-tooltip__content">
            <div className="marker-tooltip__header">
              <span className="marker-tooltip__symbol">{marker.symbol}</span>
              <span className="marker-tooltip__name">{marker.name}</span>
            </div>
            <p className="marker-tooltip__rule">{marker.rule}</p>
            <div className="marker-tooltip__examples">
              {marker.examples.map((ex) => (
                <span key={ex} className="marker-tooltip__example-tag">
                  {ex}
                </span>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
