// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import React from "react";

import { PlayIcon, PauseIcon } from "../ui/Icons";

interface PlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
  "data-onboarding-target"?: string;
}

export function PlayButton({
  isPlaying,
  isLoading,
  disabled,
  onClick,
  "data-onboarding-target": onboardingTarget,
}: PlayButtonProps): React.ReactElement {
  const getAriaLabel = (): string => {
    if (isLoading) return "Loading";
    if (isPlaying) return "Playing";
    return "Play";
  };

  return (
    <button
      className={`sentence-synthesis-item__play button button--primary button--icon-only button--circular ${isLoading ? "loading" : ""} ${isPlaying ? "playing" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={getAriaLabel()}
      data-onboarding-target={onboardingTarget}
    >
      {isLoading ? (
        <div className="loader-spinner"></div>
      ) : isPlaying ? (
        <PauseIcon size="2xl" />
      ) : (
        <PlayIcon size="2xl" />
      )}
    </button>
  );
}
