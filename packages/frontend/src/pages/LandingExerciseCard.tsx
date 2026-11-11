// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { useAudioPlaybackCore } from "@/hooks/useAudioPlaybackCore";
import SentenceSynthesisItem from "@/features/synthesis/components/SentenceSynthesisItem";
import { PlayAllButton } from "@/components/ui/PlayAllButton";
import type { TaskEntry } from "@/types/task";

interface ExerciseEntry {
  readonly id: string;
  readonly text: string;
  readonly stressedText: string;
}

interface LandingExerciseCardProps {
  title: string;
  subtitle: string;
  entries: readonly ExerciseEntry[];
}

function toTaskEntries(entries: readonly ExerciseEntry[]): TaskEntry[] {
  return entries.map((e) => ({
    id: e.id,
    text: e.text,
    taskId: "",
    stressedText: e.stressedText,
    audioUrl: null,
    audioBlob: null,
    order: 0,
    createdAt: new Date(),
  }));
}

export default function LandingExerciseCard({ title, subtitle, entries }: LandingExerciseCardProps) {
  const taskEntries = toTaskEntries(entries);
  const audio = useAudioPlaybackCore({ continueOnFailure: true, logPrefix: "Landing exercise" });

  const handlePlayEntry = useCallback(
    (id: string) => {
      audio.handlePlayEntry(id, taskEntries);
    },
    [audio.handlePlayEntry, taskEntries],
  );

  const handlePlayAll = useCallback(async () => {
    await audio.handlePlayAll(taskEntries);
  }, [audio.handlePlayAll, taskEntries]);

  return (
    <div className="landing-exercise-card">
      <div className="landing-exercise-card__header">
        <div className="landing-exercise-card__header-text">
          <h3 className="landing-exercise-card__title">{title}</h3>
          <p className="landing-exercise-card__subtitle">{subtitle}</p>
        </div>
        <PlayAllButton
          isPlaying={audio.isPlayingAll}
          isLoading={audio.isLoadingPlayAll}
          disabled={entries.length === 0}
          onClick={() => { void handlePlayAll(); }}
        />
      </div>
      <div className="landing-exercise-card__entries">
        {taskEntries.map((entry) => (
          <SentenceSynthesisItem
            key={entry.id}
            id={entry.id}
            text={entry.text}
            mode="readonly"
            isPlaying={audio.currentPlayingId === entry.id}
            isLoading={audio.currentLoadingId === entry.id}
            onPlay={handlePlayEntry}
          />
        ))}
      </div>
    </div>
  );
}
