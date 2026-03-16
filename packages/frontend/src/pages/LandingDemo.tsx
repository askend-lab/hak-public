// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect, useCallback, useRef } from "react";
import { PlayIcon } from "@/components/ui/Icons";

const DEMO_TEXT = "Tere, kuidas läheb?";
const DEMO_TAGS = ["Tere,", "kuidas", "läheb?"];
const VARIANT_TAG_INDEX = 2;
const DEMO_VARIANTS = ["läheb", "lä'heb", "läheb'"];

const enum Phase {
  TYPING = 0,
  TAGS_APPEAR = 1,
  PLAY_PULSE = 2,
  TAG_SELECT = 3,
  VARIANTS_SHOW = 4,
  PAUSE = 5,
  FADE_OUT = 6,
}

const PHASE_DURATIONS: Record<Phase, number> = {
  [Phase.TYPING]: 0,
  [Phase.TAGS_APPEAR]: 1800,
  [Phase.PLAY_PULSE]: 1500,
  [Phase.TAG_SELECT]: 1200,
  [Phase.VARIANTS_SHOW]: 2500,
  [Phase.PAUSE]: 1200,
  [Phase.FADE_OUT]: 800,
};

function useTypingEffect(active: boolean, text: string, speed: number): string {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      indexRef.current = 0;
      return;
    }

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [active, text, speed]);

  return displayed;
}

export default function LandingDemo() {
  const [phase, setPhase] = useState<Phase>(Phase.TYPING);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const typedText = useTypingEffect(phase === Phase.TYPING, DEMO_TEXT, 65);
  const typingComplete = typedText.length === DEMO_TEXT.length;

  const resetCycle = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setPhase(Phase.TYPING);
      setVisible(true);
    }, 600);
  }, []);

  // Advance from TYPING to TAGS_APPEAR once typing finishes
  useEffect(() => {
    if (phase === Phase.TYPING && typingComplete) {
      timeoutRef.current = setTimeout(() => setPhase(Phase.TAGS_APPEAR), 500);
      return () => clearTimeout(timeoutRef.current);
    }
    return undefined;
  }, [phase, typingComplete]);

  // Advance through remaining phases on timers
  useEffect(() => {
    if (phase === Phase.TYPING) return;

    const duration = PHASE_DURATIONS[phase];
    if (phase === Phase.FADE_OUT) {
      timeoutRef.current = setTimeout(resetCycle, duration);
    } else {
      timeoutRef.current = setTimeout(() => setPhase(phase + 1), duration);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [phase, resetCycle]);

  const showTags = phase >= Phase.TAGS_APPEAR;
  const showPlayPulse = phase >= Phase.PLAY_PULSE && phase <= Phase.VARIANTS_SHOW;
  const showTagSelected = phase >= Phase.TAG_SELECT;
  const showVariants = phase >= Phase.VARIANTS_SHOW;

  return (
    <div className={`landing-demo ${visible ? "landing-demo--visible" : "landing-demo--hidden"}`}>
      <div className="landing-demo__card">
        <div className="landing-demo__sentence">
          {!showTags && (
            <div className="landing-demo__input">
              <span className="landing-demo__typed-text">{typedText}</span>
              <span className="landing-demo__cursor" />
            </div>
          )}
          {showTags && (
            <div className="landing-demo__tags">
              {DEMO_TAGS.map((tag, i) => (
                <span
                  key={tag}
                  className={`landing-demo__tag ${
                    showTagSelected && i === VARIANT_TAG_INDEX ? "landing-demo__tag--selected" : ""
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className={`landing-demo__play-btn ${showPlayPulse ? "landing-demo__play-btn--pulse" : ""}`}>
            <PlayIcon size="2xl" />
          </div>
        </div>

        {showPlayPulse && !showVariants && (
          <div className="landing-demo__wave">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="landing-demo__wave-bar" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}

        {showVariants && (
          <div className="landing-demo__variants">
            <div className="landing-demo__variants-label">Hääldusvariandid:</div>
            <div className="landing-demo__variants-list">
              {DEMO_VARIANTS.map((v, i) => (
                <span
                  key={v}
                  className={`landing-demo__variant ${i === 0 ? "landing-demo__variant--active" : ""}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
