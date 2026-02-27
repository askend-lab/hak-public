// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useState, useEffect, useRef } from "react";
import { transformToUI, transformToVabamorf } from "@/features/synthesis/utils/phoneticMarkers";
import { synthesizeAuto } from "@/features/synthesis/utils/synthesize";
import { createAudioPlayer } from "@/features/synthesis/utils/audioPlayer";
import { logger } from "@hak/shared";
import { BackIcon, PlayIcon, PauseIcon, CloseIcon } from "@/components/ui/Icons";
import MarkersGuideBox from "@/components/ui/MarkersGuideBox";
import { markers } from "@/data/markerData";

interface SentencePhoneticPanelProps {
  sentenceText: string;
  phoneticText: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (newPhoneticText: string) => void;
}

const MarkerItem = ({ m }: { m: (typeof markers)[0] }) => (
  <div className="sentence-phonetic-panel__marker-item">
    <div className="sentence-phonetic-panel__marker-symbol">
      <code>{m.symbol}</code>
      <span className="sentence-phonetic-panel__marker-name">{m.name}</span>
    </div>
    <div className="sentence-phonetic-panel__marker-rule">
      <strong>Hääldusmärgi kasutus: </strong>
      {m.rule}
    </div>
    <div className="sentence-phonetic-panel__marker-description">
      <strong>Selgitus: </strong>
      {m.description}
    </div>
    <div className="sentence-phonetic-panel__marker-examples">
      {m.examples.map((ex) => (
        <span key={ex} className="sentence-phonetic-panel__marker-tag">
          {ex}
        </span>
      ))}
    </div>
  </div>
);

const GuideView = ({
  onBack,
  onClose,
}: {
  onBack: () => void;
  onClose: () => void;
}) => (
  <div className="sentence-phonetic-panel__guide-view">
    <div className="sentence-phonetic-panel__guide-header">
      <button
        onClick={onBack}
        className="sentence-phonetic-panel__back-button--icon-only"
        aria-label="Tagasi"
        type="button"
      >
        <BackIcon size="2xl" />
      </button>
      <h4>Hääldusmärkide juhend</h4>
      <button
        onClick={onClose}
        className="sentence-phonetic-panel__close"
        aria-label="Sulge"
        type="button"
      >
        <CloseIcon size="2xl" />
      </button>
    </div>
    <div className="sentence-phonetic-panel__guide-content">
      <p className="sentence-phonetic-panel__guide-intro">
        Hääldusmärgid aitavad täpsustada lause hääldust. Klõpsa märgil, et
        lisada see kursori asukohta.
      </p>
      {markers.map((m) => (
        <MarkerItem key={m.symbol} m={m} />
      ))}
    </div>
  </div>
);

function usePhoneticAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
  };
  const reset = () => { audioRef.current = null; setIsPlaying(false); setIsLoading(false); };

  useEffect(() => () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }, []);

  const play = async (text: string) => {
    if (!text.trim()) {return;}
    if (isPlaying) { stopAudio(); setIsPlaying(false); return; }
    stopAudio(); setIsLoading(true); setIsPlaying(false);
    try {
      const url = await synthesizeAuto(transformToVabamorf(text) || "");
      const { audio } = createAudioPlayer(url, {
        onLoaded: () => { setIsLoading(false); setIsPlaying(true); },
        onEnded: reset, onError: reset,
      });
      audioRef.current = audio;
      await audio.play();
    } catch (e) { logger.error("Failed to play:", e); reset(); }
  };

  return { isPlaying, isLoading, play, stopAudio: reset };
}

export default function SentencePhoneticPanel({
  sentenceText,
  phoneticText,
  isOpen,
  onClose,
  onApply,
}: SentencePhoneticPanelProps) {
  const [editedText, setEditedText] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audio = usePhoneticAudio();

  useEffect(() => {
    if (!isOpen) {return;}
    if (phoneticText) { setEditedText(transformToUI(phoneticText) || ""); }
    else if (sentenceText) { setEditedText(sentenceText); }
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isOpen, phoneticText, sentenceText]);

  const insertMarkerAtCursor = (marker: string) => {
    const ta = inputRef.current;
    if (!ta) {return;}
    const s = ta.selectionStart || 0;
    const e = ta.selectionEnd || 0;
    setEditedText(editedText.substring(0, s) + marker + editedText.substring(e));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + marker.length, s + marker.length); }, 0);
  };

  const handleApply = () => {
    if (!editedText.trim()) {return;}
    onApply(transformToVabamorf(editedText) || "");
    onClose();
  };

  const handleClose = () => { audio.stopAudio(); onClose(); };

  if (!isOpen) {return null;}

  return (
    <div className="sentence-phonetic-panel">
      {!showGuide && (
        <div className="sentence-phonetic-panel__header">
          <div className="sentence-phonetic-panel__title-section">
            <h3 className="sentence-phonetic-panel__title">
              Muuda häälduskuju
            </h3>
          </div>
          <div className="sentence-phonetic-panel__header-actions">
            <button
              onClick={handleClose}
              className="sentence-phonetic-panel__close"
              aria-label="Sulge"
            >
              <CloseIcon size="2xl" />
            </button>
          </div>
        </div>
      )}
      <div className="sentence-phonetic-panel__content">
        {showGuide ? (
          <GuideView onBack={() => setShowGuide(false)} onClose={handleClose} />
        ) : (
          <div className="sentence-phonetic-panel__edit-section">
            <p className="sentence-phonetic-panel__description">
              Sisesta hääldusmärgid, et täpsustada lause hääldust.
            </p>
            <div className="sentence-phonetic-panel__input-container">
              <textarea
                ref={inputRef}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="sentence-phonetic-panel__textarea"
                aria-label="Häälduskuju"
                placeholder="Kirjuta oma hääldusvariant"
                rows={4}
                maxLength={100}
              />
            </div>
            <MarkersGuideBox
              onInsertMarker={insertMarkerAtCursor}
              onShowGuide={() => setShowGuide(true)}
              className="sentence-phonetic-panel__markers-guide-box"
            />
            <div className="sentence-phonetic-panel__actions">
              <button
                onClick={() => { void audio.play(editedText); }}
                disabled={!editedText.trim() || audio.isLoading}
                className={`button button--primary ${audio.isLoading ? "loading" : ""} ${audio.isPlaying ? "playing" : ""}`}
                title={audio.isLoading ? "Laen..." : audio.isPlaying ? "Mängib" : "Kuula"}
              >
                {audio.isLoading ? (
                  <div className="loader-spinner"></div>
                ) : audio.isPlaying ? (
                  <PauseIcon size="2xl" />
                ) : (
                  <PlayIcon size="2xl" />
                )}
                Kuula
              </button>
              <button
                onClick={handleApply}
                disabled={!editedText.trim()}
                className="button button--secondary"
              >
                Rakenda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
