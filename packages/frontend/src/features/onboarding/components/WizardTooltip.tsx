// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useEffect, useState, useRef, useCallback } from "react";
import { WizardStep } from "@/types/onboarding";
import { CloseIcon, BackIcon, ArrowForwardIcon } from "@/components/ui/Icons";

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
  arrowPosition: "top" | "bottom" | "left" | "right";
  arrowOffset?: number; // Percentage offset for arrow positioning
}

function computeArrowOffset(opts: { arrowPos: string; targetRect: DOMRect; tooltipRect: DOMRect; left: number; top: number }): number {
  const { arrowPos, targetRect, tooltipRect, left, top } = opts;
  if (arrowPos === "top" || arrowPos === "bottom") {
    const tc = targetRect.left + targetRect.width / 2;
    return Math.max(15, Math.min(85, ((tc - left) / tooltipRect.width) * 100));
  }
  if (arrowPos === "left" || arrowPos === "right") {
    const tc = targetRect.top + targetRect.height / 2;
    return Math.max(15, Math.min(85, ((tc - top) / tooltipRect.height) * 100));
  }
  return 50;
}

function clampToViewport(pos: { top: number; left: number }, tooltipRect: DOMRect, padding: number) {
  let { top, left } = pos;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (left < padding) {left = padding;}
  if (left + tooltipRect.width > vw - padding) { left = vw - tooltipRect.width - padding; }
  if (top < padding) {top = padding;}
  if (top + tooltipRect.height > vh - padding) { top = vh - tooltipRect.height - padding; }
  return { top, left };
}

function computeRawPosition(step: WizardStep, targetRect: DOMRect, tooltipRect: DOMRect) {
  const padding = 16; const arrowSize = 12;
  let top = 0; let left = 0; let arrowPosition = step.position;
  switch (step.position) {
    case "bottom": top = targetRect.bottom + padding + arrowSize; left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2; arrowPosition = "top"; break;
    case "top": top = targetRect.top - tooltipRect.height - padding - arrowSize; left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2; arrowPosition = "bottom"; break;
    case "left": top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2; left = targetRect.left - tooltipRect.width - padding - arrowSize; arrowPosition = "right"; break;
    case "right": top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2; left = targetRect.right + padding + arrowSize; arrowPosition = "left"; break;
  }
  const clamped = clampToViewport({ top, left }, tooltipRect, padding);
  const arrowOffset = computeArrowOffset({ arrowPos: arrowPosition, targetRect, tooltipRect, left: clamped.left, top: clamped.top });
  return { ...clamped, arrowPosition, arrowOffset };
}

/**
 * WizardTooltip - Individual tooltip for wizard steps
 *
 * Positions itself relative to the target element and highlights it.
 * Shows title, description, progress indicator, and navigation buttons.
 */
function useTooltipPosition(step: WizardStep, tooltipRef: React.RefObject<HTMLDivElement | null>) {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, arrowPosition: "top" });
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  const calculatePosition = useCallback(() => {
    const target = document.querySelector(step.targetSelector);
    if (!target || !tooltipRef.current) {return false;}
    setTargetElement(target);
    const pos = computeRawPosition(step, target.getBoundingClientRect(), tooltipRef.current.getBoundingClientRect());
    setPosition(pos);
    return true;
  }, [step, tooltipRef]);

  useEffect(() => {
    let retryCount = 0; let rafId: number;
    const tryCalc = () => { if (!calculatePosition() && retryCount < 10) { retryCount++; rafId = requestAnimationFrame(tryCalc); } };
    rafId = requestAnimationFrame(tryCalc);
    const onResize = () => calculatePosition();
    window.addEventListener("resize", onResize); window.addEventListener("scroll", onResize, true);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); window.removeEventListener("scroll", onResize, true); };
  }, [calculatePosition]);

  useEffect(() => {
    if (!targetElement) {return undefined;}
    targetElement.classList.add("wizard__highlight");
    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    return () => { targetElement.classList.remove("wizard__highlight"); };
  }, [targetElement]);

  return position;
}

export default function WizardTooltip({ step, currentIndex, totalSteps, onNext, onPrev, onSkip, isFirst, isLast }: WizardTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const position = useTooltipPosition(step, tooltipRef);
  const style = { top: position.top, left: position.left, opacity: position.top === 0 && position.left === 0 ? 0 : 1, "--arrow-offset": `${position.arrowOffset || 50}%` } as React.CSSProperties;

  return (
    <>
      <div className="wizard__overlay" onClick={onSkip} onKeyDown={(e) => { if (e.key === "Escape") {onSkip();} }} role="presentation" />
      <div ref={tooltipRef} className={`wizard__tooltip wizard__tooltip--arrow-${position.arrowPosition}`} style={style} role="dialog" aria-labelledby="wizard-title" aria-describedby="wizard-description">
        <button className="wizard__close" onClick={onSkip} aria-label="Sulge juhend"><CloseIcon size="2xl" /></button>
        <h3 id="wizard-title" className="wizard__title">{step.title}</h3>
        <p id="wizard-description" className="wizard__description">{step.description}</p>
        <div className="wizard__footer">
          <span className="wizard__progress">{currentIndex + 1} / {totalSteps}</span>
          <div className="wizard__nav">
            <button className="wizard__nav-button" onClick={onPrev} disabled={isFirst} aria-label="Eelmine samm"><BackIcon size="2xl" /></button>
            <button className="wizard__nav-button wizard__nav-button--primary" onClick={isLast ? onSkip : onNext}
              aria-label={isLast ? "Lõpeta juhend" : "Järgmine samm"}><ArrowForwardIcon size="2xl" /></button>
          </div>
        </div>
      </div>
    </>
  );
}
