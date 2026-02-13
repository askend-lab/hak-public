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

### Button Visibility and Location

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Have sentences with text | "Mängi kõik" button visible in page header | ☐ |
| 2 | Verify button location | Next to "Lisa ülesandesse" button | ☐ |
| 3 | Clear all sentences | Button still visible (for any with text) | ☐ |

### Sequential Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Mängi kõik" button | Button shows "Laadimine" with spinner | ☐ |
| 2 | Wait for first audio | First sentence plays, its row shows pause icon | ☐ |
| 3 | Button changes | Shows "Peata" with pause icon | ☐ |
| 4 | First audio ends | Second sentence starts synthesizing | ☐ |
| 5 | Observe row indicators | Second row shows pause, first shows play | ☐ |
| 6 | All sentences play | Sequence completes in order | ☐ |
| 7 | After last sentence | Button returns to "Mängi kõik" | ☐ |

### Stop Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Start "Mängi kõik" | Sequence begins | ☐ |
| 2 | During second sentence, click "Peata" | Audio stops immediately | ☐ |
| 3 | Observe | Third sentence does NOT play | ☐ |
| 4 | Button returns | Shows "Mängi kõik" again | ☐ |
| 5 | Row states reset | All rows show play icon | ☐ |

### Empty Sentences Skipped

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Have: "Tere", empty, "Aitäh" | Three rows, one empty | ☐ |
| 2 | Click "Mängi kõik" | Starts playing | ☐ |
| 3 | Observe | "Tere" plays, empty skipped, "Aitäh" plays | ☐ |
| 4 | Verify sequence | No pause or error on empty sentence | ☐ |

### Button State Transitions

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Mängi kõik" | Button text: "Laadimine", icon: spinner | ☐ |
| 2 | First audio ready | Button text: "Peata", icon: pause | ☐ |
| 3 | Sequence ends | Button text: "Mängi kõik", icon: play | ☐ |

### Interaction During Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Start "Mängi kõik" | Sequence begins | ☐ |
| 2 | Click play on individual sentence | May interrupt sequence | ☐ |

## Notes

- Empty sentences don't block sequence
- Playback can be stopped at any time with "Peata"
- User can interact with UI during playback
- On error for one sentence, sequence continues to next
