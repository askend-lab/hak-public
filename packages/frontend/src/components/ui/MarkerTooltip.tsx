'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { type MarkerDefinition } from '@/data/markerData';

type TooltipAlign = 'left' | 'center' | 'right';

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
export default function MarkerTooltip({ marker, children, align = 'center' }: MarkerTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Handle click outside for touch devices
  useEffect(() => {
    if (!isTouchDevice || !isVisible) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isTouchDevice, isVisible]);

  const showTooltip = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    // Small delay before hiding to allow moving to the tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  }, []);

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      hideTooltip();
    }
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hideTooltip();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTouchDevice) {
      e.preventDefault();
      setIsVisible((prev) => !prev);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      setIsVisible(false);
    }
  };

  const tooltipClassName = `marker-tooltip marker-tooltip--align-${align}`;

  return (
    <div
      ref={wrapperRef}
      className="marker-tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
    >
      {children}
      {isVisible && (
        <div
          className={tooltipClassName}
          role="tooltip"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="marker-tooltip__arrow" />
          <div className="marker-tooltip__content">
            <div className="marker-tooltip__header">
              <span className="marker-tooltip__symbol">{marker.symbol}</span>
              <span className="marker-tooltip__name">{marker.name}</span>
            </div>
            <p className="marker-tooltip__rule">{marker.rule}</p>
            <div className="marker-tooltip__examples">
              {marker.examples.map((ex, i) => (
                <span key={i} className="marker-tooltip__example-tag">{ex}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
