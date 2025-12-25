# US-014: Edit sentence inline

**Feature:** F-003
**Status:** [x] ✅ Implemented in prototype
**Implementation:** `app/page.tsx` (lines 1188-1217: tag-based input, lines 339-416: text change and keyboard handlers)

## User Story

As a **language learner**
I want to **edit my sentence text directly in the input field**
So that **I can quickly make changes without needing a separate edit mode**

## Acceptance Criteria

[x] **AC-1:** Always-editable sentences
GIVEN I have a sentence row
WHEN I view the sentence
THEN I can always type new words in the input field to add them
AND existing words appear as clickable tags
_Verified by:_ Tag-based input always active (page.tsx:1188-1217), input field always present (page.tsx:1209-1216)

[x] **AC-2:** Add words via Space key
GIVEN I am typing in the input field
WHEN I press Space
THEN the current word becomes a tag
AND the input field clears for the next word
_Verified by:_ handleKeyDown on Space creates tag (page.tsx:345-380), currentInput cleared

[x] **AC-3:** Edit existing words via Backspace
GIVEN I have an empty input field and existing tags
WHEN I press Backspace
THEN the last tag is removed and its text appears in the input field for editing
_Verified by:_ Backspace handler pops last tag to currentInput (page.tsx:381-398)

[x] **AC-4:** Automatic cache invalidation on edit
GIVEN I have modified a sentence's text
WHEN the text changes
THEN any cached audio and phonetic data for that sentence is cleared
AND the next playback will trigger fresh synthesis
_Verified by:_ Cache clearing on text change (page.tsx:365, 408), phoneticText and audioUrl set to undefined

[x] **AC-5:** Phonetic customization
GIVEN I have a sentence with synthesized text
WHEN I click on a word tag
THEN the pronunciation variants panel opens
AND I can select a custom phonetic form without changing the visible word
_Verified by:_ handleTagClick opens variants panel (page.tsx:886-896), stressedTags store phonetic forms separately

## Screenshot

![Edit Sentence Inline](../screenshots/US-014-edit-playlist-entry.png)

## Notes

**No separate edit mode:** Sentences are always in an editable state - no mode switching required
**Tag-based input:** Words are represented as tags, making it easy to see sentence structure
**Fast editing:** Backspace to edit last word, Space to add new word - efficient keyboard workflow
**Phonetic vs. visible text:** Users can customize pronunciation (via US-005, US-034) without changing the displayed words
**Cache management:** Text changes automatically invalidate audio cache to prevent stale synthesis
**Playback:** Editing is allowed during playback and does not interrupt active audio
**Edge cases:** No undo/redo (browser-level only), editing during playback allowed, no text validation before synthesis
