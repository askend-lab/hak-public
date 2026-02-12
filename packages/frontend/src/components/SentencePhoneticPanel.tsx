// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { useState, useEffect, useRef } from "react";
import { transformToUI, transformToVabamorf } from "@/utils/phoneticMarkers";
import { synthesizeWithPolling } from "@/utils/synthesize";
import { createAudioPlayer } from "@/utils/audioPlayer";
import { getVoiceModel } from "@/types/synthesis";
import { BackIcon, PlayIcon, PauseIcon, CloseIcon } from "./ui/Icons";
import MarkersGuideBox from "./ui/MarkersGuideBox";
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
    <div className="sentence-phonetic-panel__marker-rule">{m.rule}</div>
    <div className="sentence-phonetic-panel__marker-examples">
      {m.examples.map((ex, i) => (
        <span key={i} className="sentence-phonetic-panel__marker-tag">
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
      {markers.map((m, i) => (
        <MarkerItem key={i} m={m} />
      ))}
    </div>
  </div>
);

export default function SentencePhoneticPanel({
  sentenceText,
  phoneticText,
  isOpen,
  onClose,
  onApply,
}: SentencePhoneticPanelProps) {
  const [editedText, setEditedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen && phoneticText) {
      setEditedText(transformToUI(phoneticText) || "");
    } else if (isOpen && sentenceText && !phoneticText) {
      setEditedText(sentenceText);
    }
  }, [isOpen, phoneticText, sentenceText]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      );
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const insertMarkerAtCursor = (marker: string) => {
    const ta = inputRef.current;
    if (!ta) return;
    const s = ta.selectionStart || 0;
    const e = ta.selectionEnd || 0;
    setEditedText(
      editedText.substring(0, s) + marker + editedText.substring(e),
    );
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + marker.length, s + marker.length);
    }, 0);
  };

  const handlePlay = async () => {
    if (!editedText.trim()) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsLoading(true);
    setIsPlaying(false);
    try {
      const vt = transformToVabamorf(editedText);
      const url = await synthesizeWithPolling(
        vt || "",
        getVoiceModel(vt || ""),
      );
      const { audio } = createAudioPlayer(url, {
        onLoaded: () => {
          setIsLoading(false);
          setIsPlaying(true);
        },
        onEnded: () => {
          setIsPlaying(false);
          setIsLoading(false);
          audioRef.current = null;
        },
        onError: () => {
          setIsPlaying(false);
          setIsLoading(false);
          audioRef.current = null;
        },
      });
      audioRef.current = audio;
      await audio.play();
    } catch (e) {
      console.error("Failed to play:", e);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!editedText.trim()) return;
    onApply(transformToVabamorf(editedText) || "");
    onClose();
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

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
                placeholder="Kirjuta oma hääldusvariant"
                rows={4}
              />
            </div>
            <MarkersGuideBox
              onInsertMarker={insertMarkerAtCursor}
              onShowGuide={() => setShowGuide(true)}
              className="sentence-phonetic-panel__markers-guide-box"
            />
            <div className="sentence-phonetic-panel__actions">
              <button
                onClick={handlePlay}
                disabled={!editedText.trim() || isLoading}
                className={`button button--primary ${isLoading ? "loading" : ""} ${isPlaying ? "playing" : ""}`}
                title={isLoading ? "Laen..." : isPlaying ? "Mängib" : "Kuula"}
              >
                {isLoading ? (
                  <div className="loader-spinner"></div>
                ) : isPlaying ? (
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
