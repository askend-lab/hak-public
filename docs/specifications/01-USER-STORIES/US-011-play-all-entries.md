# US-011: Play all sentences sequentially

**Feature:** F-003
**Status:** [x] ✅ Implemented in prototype
**Implementation:** `app/page.tsx` (lines 609-645: handlePlayAll, lines 1146-1162: "Mängi kõik" button in hero section)

## User Story

As a **language learner**
I want to **play all my sentences in sequence**
So that **I can practice listening to multiple phrases without interruption**

## Acceptance Criteria

[x] **AC-1:** Play all button availability
GIVEN I have one or more sentences with text
WHEN I view the synthesis page
THEN I see a "Mängi kõik" button in the hero section
AND the button shows the count of sentences with text (e.g., "Mängi kõik (3)")
_Verified by:_ Button in hero-actions (page.tsx:1146-1162), displays sentence count

[x] **AC-2:** Sequential playback
GIVEN I click the "Mängi kõik" button
WHEN playback starts
THEN each sentence with text is synthesized and played in order
AND the next sentence begins automatically after the current one finishes
AND empty sentences are skipped
_Verified by:_ handlePlayAll iterates through sentences with text (page.tsx:635-640), calls playSingleSentence for each

[x] **AC-3:** Visual playback indicator
GIVEN sequential playback is active
WHEN I view the sentences
THEN the currently playing sentence's play button shows a pause icon
AND previously played sentences return to play icon state
_Verified by:_ isPlaying state tracks current sentence (page.tsx:544-545), play button updates based on state

[x] **AC-4:** Stop playback control
GIVEN sequential playback is in progress
WHEN I click the button (now showing "Peata")
THEN playback stops immediately at the current sentence
AND the button changes back to "Mängi kõik"
_Verified by:_ Button toggles based on isPlayingAll state (page.tsx:1161), AbortController stops sequence (page.tsx:610-623)

## Screenshot

![Play All Sentences](../screenshots/US-011-play-all-entries.png)

## Technical Implementation

**AbortController pattern for cancellation:**
- Creates AbortController when starting playback (page.tsx:631-633)
- Passes abort signal to each sentence's playback function (page.tsx:638)
- Clicking "Peata" aborts the controller, cleanly stopping the sequence (page.tsx:612)
- Cleans up state after completion or abort (page.tsx:642-644)

**Playback flow:**
1. Filters sentences to those with text (page.tsx:627)
2. Iterates through filtered list with for...of loop (page.tsx:635-640)
3. Each iteration calls playSingleSentence with abort signal
4. If any sentence fails, sequence continues to next sentence
5. If abort signal is triggered, loop breaks immediately

## Notes

**Smart filtering:** Only sentences containing text are played, empty rows are automatically skipped
**Error handling:** If one sentence fails synthesis, the sequence continues with the next sentence
**Concurrent operations:** User can still interact with UI during playback, though modifying sentences is not prevented
**Edge cases:** Network interruptions affect individual sentences but don't stop the sequence, user modifications during playback are allowed
