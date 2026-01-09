'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { WizardStep } from '@/types/onboarding';

interface WizardTooltipProps {
  step: WizardStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface Position {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
  arrowOffset?: number; // Percentage offset for arrow positioning
}

/**
 * WizardTooltip - Individual tooltip for wizard steps
 * 
 * Positions itself relative to the target element and highlights it.
 * Shows title, description, progress indicator, and navigation buttons.
 */
export default function WizardTooltip({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast
}: WizardTooltipProps) {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, arrowPosition: 'top' });
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    const target = document.querySelector(step.targetSelector);
    if (!target || !tooltipRef.current) return false; // Return false if can't calculate

    setTargetElement(target);

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 16;
    const arrowSize = 12;

    let top = 0;
    let left = 0;
    let arrowPosition = step.position;

    switch (step.position) {
      case 'bottom':
        top = targetRect.bottom + padding + arrowSize;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        arrowPosition = 'top';
        break;
      case 'top':
        top = targetRect.top - tooltipRect.height - padding - arrowSize;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        arrowPosition = 'bottom';
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - padding - arrowSize;
        arrowPosition = 'right';
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + padding + arrowSize;
        arrowPosition = 'left';
        break;
    }

    // Keep tooltip within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    // Calculate arrow offset to point at target element center
    let arrowOffset = 50; // Default to center (50%)
    
    if (arrowPosition === 'top' || arrowPosition === 'bottom') {
      // For top/bottom arrows, calculate horizontal offset
      const targetCenter = targetRect.left + (targetRect.width / 2);
      const tooltipLeft = left;
      arrowOffset = ((targetCenter - tooltipLeft) / tooltipRect.width) * 100;
      // Clamp between 15% and 85% to keep arrow visible
      arrowOffset = Math.max(15, Math.min(85, arrowOffset));
    } else if (arrowPosition === 'left' || arrowPosition === 'right') {
      // For left/right arrows, calculate vertical offset
      const targetCenter = targetRect.top + (targetRect.height / 2);
      const tooltipTop = top;
      arrowOffset = ((targetCenter - tooltipTop) / tooltipRect.height) * 100;
      // Clamp between 15% and 85% to keep arrow visible
      arrowOffset = Math.max(15, Math.min(85, arrowOffset));
    }

    setPosition({ top, left, arrowPosition, arrowOffset });
    return true; // Return true on success
  }, [step.targetSelector, step.position]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    let rafId: number;

    // Retry mechanism to handle timing issues with DOM rendering
    const tryCalculatePosition = () => {
      const success = calculatePosition();
      if (!success && retryCount < maxRetries) {
        retryCount++;
        // Use requestAnimationFrame to wait for next paint cycle
        rafId = requestAnimationFrame(tryCalculatePosition);
      }
    };

    // Start with a small delay to ensure DOM is ready
    rafId = requestAnimationFrame(tryCalculatePosition);

    // Recalculate on resize/scroll
    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [calculatePosition]);

  // Add highlight class to target element
  useEffect(() => {
    if (targetElement) {
      targetElement.classList.add('wizard__highlight');
      
      // Scroll target into view if needed
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      return () => {
        targetElement.classList.remove('wizard__highlight');
      };
    }
    return undefined;
  }, [targetElement]);

  return (
    <>
      {/* Overlay that dims the rest of the page */}
      <div className="wizard__overlay" onClick={onSkip} />
      
      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className={`wizard__tooltip wizard__tooltip--arrow-${position.arrowPosition}`}
        style={{
          top: position.top, 
          left: position.left,
          opacity: position.top === 0 && position.left === 0 ? 0 : 1,
          // @ts-ignore - CSS custom property
          '--arrow-offset': `${position.arrowOffset || 50}%`
        }}
        role="dialog"
        aria-labelledby="wizard-title"
        aria-describedby="wizard-description"
      >
        {/* Close button */}
        <button 
          className="wizard__close" 
          onClick={onSkip} 
          aria-label="Sulge juhend"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        
        <h3 id="wizard-title" className="wizard__title">
          {step.title}
        </h3>
        
        <p id="wizard-description" className="wizard__description">
          {step.description}
        </p>
        
        <div className="wizard__footer">
          <span className="wizard__progress">
            {currentIndex + 1} / {totalSteps}
          </span>
          
          <div className="wizard__nav">
            <button 
              className="wizard__nav-button"
              onClick={onPrev}
              disabled={isFirst}
              aria-label="Eelmine samm"
            >
              <img 
                src="/icons/arrow_backward.svg" 
                alt="" 
                width="24" 
                height="24"
              />
            </button>
            <button 
              className="wizard__nav-button wizard__nav-button--primary"
              onClick={isLast ? onSkip : onNext}
              aria-label={isLast ? "Lõpeta juhend" : "Järgmine samm"}
            >
              <img 
                src="/icons/arrow_forward.svg" 
                alt="" 
                width="24" 
                height="24"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
