# TC-11: Sequential Playback

**User Story:** US-13  
**Feature:** F04 Playlist Management  
**Priority:** High  
**Type:** Functional

## Description

Verify "Play All" sequential playback of multiple sentences.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Multiple sentences with text (3+ recommended)
- [ ] Audio enabled

## Test Data

Sentences:
1. "Tere päevast"
2. "Kuidas läheb"
3. "Aitäh, hästi"

## Test Steps

### Button Visibility

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Have only 1 sentence | "Mängi kõik" button NOT visible | ☐ |
| 2 | Add second sentence with text | "Mängi kõik (2)" appears | ☐ |
| 3 | Add third sentence | Button shows "(3)" | ☐ |
| 4 | Clear one sentence | Count updates | ☐ |

### Sequential Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Mängi kõik" button | Button shows loading spinner | ☐ |
| 2 | Wait for first audio | First sentence plays, its row shows pause icon | ☐ |
| 3 | Button changes | Shows "Peata" with pause icon | ☐ |
| 4 | First audio ends | Second sentence starts | ☐ |
| 5 | Observe row indicators | Second row shows pause, first shows play | ☐ |
| 6 | All sentences play | Sequence completes | ☐ |
| 7 | After last sentence | Button returns to "Mängi kõik" | ☐ |

### Stop Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Start "Mängi kõik" | Sequence begins | ☐ |
| 2 | During second sentence, click "Peata" | Audio stops immediately | ☐ |
| 3 | Observe | Third sentence does NOT play | ☐ |
| 4 | Button returns | Shows "Mängi kõik" again | ☐ |

### Empty Sentences Skipped

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Have: "Tere", empty, "Aitäh" | Three rows, one empty | ☐ |
| 2 | Click "Mängi kõik (2)" | Starts playing | ☐ |
| 3 | Observe | "Tere" plays, empty skipped, "Aitäh" plays | ☐ |

### Loading State Before First Audio

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Mängi kõik" | Loading spinner appears | ☐ |
| 2 | Observe button | Shows "Laadimine" text | ☐ |
| 3 | First audio starts | Transitions to "Peata" | ☐ |

## Notes

- Empty sentences don't count toward total
- Playback can be stopped at any time
- User can interact with UI during playback
