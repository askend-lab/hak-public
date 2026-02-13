# US-13: Play All Sequentially

**Feature:** F04 Playlist Management  
**Priority:** High

## User Story

As a **language learner**  
I want to **play all my sentences in sequence**  
So that **I can practice listening without manual interaction**

## Acceptance Criteria

- [x] **AC-1:** "Mängi kõik" button appears in page header when sentences have text
- [x] **AC-2:** Clicking button starts sequential playback
- [x] **AC-3:** Each sentence plays in order from top to bottom
- [x] **AC-4:** Empty sentences are skipped
- [x] **AC-5:** Current playing sentence shows pause icon on its row
- [x] **AC-6:** Button text changes to "Peata" (Stop) during playback
- [x] **AC-7:** Clicking "Peata" stops playback immediately
- [x] **AC-8:** Button shows "Laadimine" with spinner before first audio plays

## UI Behavior

### Button States

| State | Button Text | Icon |
|-------|-------------|------|
| Ready | Mängi kõik | ▶ Play |
| Loading | Laadimine | Spinner |
| Playing | Peata | ❚❚ Pause |

### Button Location

The "Mängi kõik" button is located in the page header, alongside the "Lisa ülesandesse" button.

### Play All Flow

1. User has sentences with text
2. User clicks "Mängi kõik"
3. Button shows "Laadimine" with spinner
4. First sentence synthesizes
5. Button changes to "Peata" with pause icon
6. First sentence plays (its row shows pause icon)
7. First sentence ends
8. Second sentence synthesizes and plays
9. Process continues through all sentences
10. After last sentence, button returns to "Mängi kõik"

### Stopping Playback

1. User clicks "Peata" during playback
2. Current audio stops immediately
3. Remaining sentences are not played
4. Button returns to "Mängi kõik"
5. All row states reset

### Empty Sentence Handling

```
Sentence 1: "Tere" ✓ Plays
Sentence 2: ""     ✗ Skipped (empty)
Sentence 3: "Aitäh" ✓ Plays
```

### Visual During Playback

- Playing sentence row: Play button shows pause icon
- Other rows: Play button shows play icon
- Global button: Shows "Peata"

## Technical Implementation

- Uses `AbortController` for cancellation
- Each sentence synthesis awaits completion before next
- On error for individual sentence, sequence continues to next
- On abort (user clicks Peata), loop breaks immediately

## Related Test Cases

- [TC-11: Sequential Playback](../../02-TEST-CASES/F04-playlist/TC-11-play-all.md)

## Notes

- Button always visible when there are sentences with text
- User can still click individual play buttons during sequence
- Clicking individual play during sequence may interfere with sequence playback
