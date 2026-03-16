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

function DemoSentence({ typedText, showTags, showTagSelected, showPlayPulse }: {
  typedText: string; showTags: boolean; showTagSelected: boolean; showPlayPulse: boolean;
}) {
  return (
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
            <span key={tag}
              className={`landing-demo__tag ${showTagSelected && i === VARIANT_TAG_INDEX ? "landing-demo__tag--selected" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}>{tag}</span>
          ))}
        </div>
      )}
      <div className={`landing-demo__play-btn ${showPlayPulse ? "landing-demo__play-btn--pulse" : ""}`}>
        <PlayIcon size="2xl" />
      </div>
    </div>
  );
}

function DemoWave() {
  return (
    <div className="landing-demo__wave">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={`wave-${i}`} className="landing-demo__wave-bar" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}

function DemoVariants() {
  return (
    <div className="landing-demo__variants">
      <div className="landing-demo__variants-label">Hääldusvariandid:</div>
      <div className="landing-demo__variants-list">
        {DEMO_VARIANTS.map((v, i) => (
          <span key={v}
            className={`landing-demo__variant ${i === 0 ? "landing-demo__variant--active" : ""}`}
            style={{ animationDelay: `${i * 100}ms` }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

function useDemoPhase() {
  const [phase, setPhase] = useState<Phase>(Phase.TYPING);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const typedText = useTypingEffect(phase === Phase.TYPING, DEMO_TEXT, 65);
  const typingComplete = typedText.length === DEMO_TEXT.length;

  const resetCycle = useCallback(() => {
    setVisible(false);
    setTimeout(() => { setPhase(Phase.TYPING); setVisible(true); }, 600);
  }, []);

  useEffect(() => {
    if (phase === Phase.TYPING && typingComplete) {
      timeoutRef.current = setTimeout(() => setPhase(Phase.TAGS_APPEAR), 500);
      return () => clearTimeout(timeoutRef.current);
    }
    return undefined;
  }, [phase, typingComplete]);

  useEffect(() => {
    if (phase === Phase.TYPING) { return; }
    const duration = PHASE_DURATIONS[phase];
    timeoutRef.current = setTimeout(
      phase === Phase.FADE_OUT ? resetCycle : () => setPhase(phase + 1), duration,
    );
    return () => clearTimeout(timeoutRef.current);
  }, [phase, resetCycle]);

  return { phase, visible, typedText };
}

export default function LandingDemo() {
  const { phase, visible, typedText } = useDemoPhase();
  const showTags = phase >= Phase.TAGS_APPEAR;
  const showPlayPulse = phase >= Phase.PLAY_PULSE && phase <= Phase.VARIANTS_SHOW;

  return (
    <div className={`landing-demo ${visible ? "landing-demo--visible" : "landing-demo--hidden"}`}>
      <div className="landing-demo__card">
        <DemoSentence typedText={typedText} showTags={showTags} showTagSelected={phase >= Phase.TAG_SELECT} showPlayPulse={showPlayPulse} />
        {showPlayPulse && phase < Phase.VARIANTS_SHOW && <DemoWave />}
        {phase >= Phase.VARIANTS_SHOW && <DemoVariants />}
      </div>
    </div>
  );
}
