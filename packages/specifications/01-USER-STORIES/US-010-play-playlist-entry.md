# US-010: Play individual sentence

**Feature:** F-003
**Status:** [x] ✅ Implemented in prototype
**Implementation:** `app/page.tsx` (lines 859-884: handlePlay, lines 1220-1238: play button per row)

## User Story

As a **language learner**
I want to **play a specific sentence from my list**
So that **I can focus on practicing individual phrases**

## Acceptance Criteria

[x] **AC-1:** Play button per sentence
GIVEN I have one or more sentence rows with text
WHEN I view the sentences section
THEN each sentence row displays its own play button
_Verified by:_ Play button rendered for each sentence (page.tsx:1220-1238)

[x] **AC-2:** Play specific sentence
GIVEN I click a sentence's play button
WHEN the button is clicked
THEN only that sentence is synthesized and played
AND other sentences are not affected
_Verified by:_ handlePlay triggers synthesizeAndPlay for specific sentence ID (page.tsx:859-884, 708-857)

[x] **AC-3:** Visual playback states
GIVEN I have triggered playback for a sentence
WHEN the synthesis and playback progress
THEN the play button shows three states:
  - Play icon (default/stopped)
  - Loading spinner (synthesizing)
  - Pause icon (playing)
_Verified by:_ Button icon changes based on isLoading and isPlaying states (page.tsx:1220-1238, 544-545, 742-748)

[x] **AC-4:** Stop current playback when switching
GIVEN a sentence is currently playing
WHEN I click play on a different sentence
THEN the current playback stops
AND the new sentence starts synthesizing and playing
_Verified by:_ synthesizeAndPlay stops currentAudio before starting new (page.tsx:712-717)

## Screenshot

![Play Individual Sentence](../screenshots/US-010-play-playlist-entry.png)

## Notes

**Related:** See US-001 for complete synthesis and playback flow documentation
**Audio caching:** If the same sentence is played again without changes, cached audio is reused
**Error handling:** Failed playback automatically retries once with cache invalidation
**Edge cases:** Switching between sentences stops current playback immediately, audio loading failures trigger retry logic
