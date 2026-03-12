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
  const reset = () => { audioRef.current = null; setIsPlaying(false); setIsLoading(false); };

  useEffect(() => () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }, []);

  const startPlayback = async (text: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsLoading(true); setIsPlaying(false);
    const { audioUrl: url } = await synthesizeAuto(transformToVabamorf(text) || "");
    const { audio } = createAudioPlayer(url, { onLoaded: () => { setIsLoading(false); setIsPlaying(true); }, onEnded: reset, onError: reset });
    audioRef.current = audio; // eslint-disable-line require-atomic-updates -- ref is only accessed from UI thread
    await audio.play();
  };

  const play = async (text: string) => {
    if (!text.trim()) {return;}
    if (isPlaying) { reset(); return; }
    try { await startPlayback(text); }
    catch (e) { logger.error("Failed to play:", e); reset(); }
  };

  return { isPlaying, isLoading, play, stopAudio: reset };
}

function PlayButton({ audio, text }: { audio: ReturnType<typeof usePhoneticAudio>; text: string }) {
  const icon = audio.isLoading ? <div className="loader-spinner"></div> : audio.isPlaying ? <PauseIcon size="2xl" /> : <PlayIcon size="2xl" />;
  return (
    <button
      onClick={() => { void audio.play(text); }}
      disabled={!text.trim() || audio.isLoading}
      className={`button button--primary ${audio.isLoading ? "loading" : ""} ${audio.isPlaying ? "playing" : ""}`}
      title={audio.isLoading ? "Laen..." : audio.isPlaying ? "Mängib" : "Kuula"}
    >
      {icon} Kuula
    </button>
  );
}

function EditSection({ editedText, setEditedText, inputRef, audio, onApply, onShowGuide }: {
  editedText: string; setEditedText: (v: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  audio: ReturnType<typeof usePhoneticAudio>;
  onApply: () => void; onShowGuide: () => void;
}) {
  const insertMarker = (marker: string) => {
    const ta = inputRef.current;
    if (!ta) {return;}
    const s = ta.selectionStart || 0;
    const e = ta.selectionEnd || 0;
    setEditedText(editedText.substring(0, s) + marker + editedText.substring(e));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + marker.length, s + marker.length); }, 0);
  };

  return (
    <div className="sentence-phonetic-panel__edit-section">
      <p className="sentence-phonetic-panel__description">Sisesta hääldusmärgid, et täpsustada lause hääldust.</p>
      <div className="sentence-phonetic-panel__input-container">
        <textarea ref={inputRef} value={editedText} onChange={(e) => setEditedText(e.target.value)}
          className="sentence-phonetic-panel__textarea" aria-label="Häälduskuju" placeholder="Kirjuta oma hääldusvariant" rows={4} maxLength={100} />
      </div>
      <MarkersGuideBox onInsertMarker={insertMarker} onShowGuide={onShowGuide} className="sentence-phonetic-panel__markers-guide-box" />
      <div className="sentence-phonetic-panel__actions">
        <PlayButton audio={audio} text={editedText} />
        <button onClick={onApply} disabled={!editedText.trim()} className="button button--secondary">Rakenda</button>
      </div>
    </div>
  );
}

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="sentence-phonetic-panel__header">
      <div className="sentence-phonetic-panel__title-section">
        <h3 className="sentence-phonetic-panel__title">Muuda häälduskuju</h3>
      </div>
      <div className="sentence-phonetic-panel__header-actions">
        <button onClick={onClose} className="sentence-phonetic-panel__close" aria-label="Sulge"><CloseIcon size="2xl" /></button>
      </div>
    </div>
  );
}

export default function SentencePhoneticPanel({ sentenceText, phoneticText, isOpen, onClose, onApply }: SentencePhoneticPanelProps) {
  const [editedText, setEditedText] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audio = usePhoneticAudio();

  useEffect(() => {
    if (!isOpen) {return;}
    setEditedText(phoneticText ? (transformToUI(phoneticText) || "") : sentenceText || "");
    if (inputRef.current) { inputRef.current.focus(); inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length); }
  }, [isOpen, phoneticText, sentenceText]);

  const handleClose = () => { audio.stopAudio(); onClose(); };
  const handleApply = () => { if (editedText.trim()) { onApply(transformToVabamorf(editedText) || ""); onClose(); } };

  if (!isOpen) {return null;}

  return (
    <div className="sentence-phonetic-panel">
      {!showGuide && <PanelHeader onClose={handleClose} />}
      <div className="sentence-phonetic-panel__content">
        {showGuide
          ? <GuideView onBack={() => setShowGuide(false)} onClose={handleClose} />
          : <EditSection editedText={editedText} setEditedText={setEditedText} inputRef={inputRef} audio={audio} onApply={handleApply} onShowGuide={() => setShowGuide(true)} />}
      </div>
    </div>
  );
}
