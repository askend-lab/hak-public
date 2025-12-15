# US-012: Remove sentence

**Feature:** F-003
**Status:** [x] ✅ Implemented in prototype
**Implementation:** `app/page.tsx` (lines 434-450: handleRemoveSentence, lines 1279-1286: menu item)

## User Story

As a **language learner**
I want to **remove a sentence from my list**
So that **I can focus only on the phrases I need to practice**

## Acceptance Criteria

[x] **AC-1:** Remove option availability
GIVEN I have one or more sentence rows
WHEN I click the three-dots menu button on a sentence row
THEN I see an "Eemalda" (Remove) option in the dropdown menu
_Verified by:_ Menu item in dropdown (page.tsx:1279-1286), available for all sentences

[x] **AC-2:** Sentence removal
GIVEN I click "Eemalda" on a sentence
WHEN the action executes
THEN the sentence is immediately removed from the list
AND the sentences array is updated
_Verified by:_ handleRemoveSentence filters out the sentence by ID (page.tsx:434-450)

[x] **AC-3:** Last sentence behavior
GIVEN I have only one sentence row remaining
WHEN I click "Eemalda" on that sentence
THEN the sentence is cleared (reset to empty) instead of being removed
AND at least one input row always remains visible
_Verified by:_ Special handling for last sentence (page.tsx:442-446), resets to empty state instead of filtering out

## Screenshot

![Remove Sentence](../screenshots/US-012-delete-playlist-entry.png)

## Notes

**No confirmation:** Deletion is immediate without a confirmation dialog for simpler UX
**No undo:** There is no undo functionality - deleted sentences cannot be recovered
**Always one row:** The UI maintains at least one sentence row at all times, even if empty
**Playback handling:** If a currently playing sentence is deleted, playback continues (no special interruption)
**Edge cases:** Deleting during playback continues playback, no undo functionality, last sentence gets cleared instead of removed
