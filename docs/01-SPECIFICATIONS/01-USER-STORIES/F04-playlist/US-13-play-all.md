# US-13: Play All Sequentially

**Feature:** F04 Playlist Management  
**Priority:** High

## User Story

As a **language learner**  
I want to **play all my sentences in sequence**  
So that **I can practice listening without manual interaction**

## Acceptance Criteria

- [ ] **AC-1:** "Mängi kõik" button appears when 2+ sentences have text
- [ ] **AC-2:** Button shows count of sentences with text (e.g., "Mängi kõik (3)")
- [ ] **AC-3:** Clicking button starts sequential playback
- [ ] **AC-4:** Each sentence plays in order from top to bottom
- [ ] **AC-5:** Empty sentences are skipped
- [ ] **AC-6:** Current playing sentence shows pause icon on its row
- [ ] **AC-7:** Button text changes to "Peata" (Stop) during playback
- [ ] **AC-8:** Clicking "Peata" stops playback immediately
- [ ] **AC-9:** Loading state shown before first audio plays

## UI Behavior

### Button States

| State | Button Text | Icon |
|-------|-------------|------|
| Ready | Mängi kõik (3) | ▶ Play |
| Loading | Laadimine | Spinner |
| Playing | Peata | ❚❚ Pause |

### Play All Flow

1. User has 3 sentences with text
2. User clicks "Mängi kõik (3)"
3. Button shows "Laadimine" with spinner
4. First sentence synthesizes
5. Button changes to "Peata" with pause icon
6. First sentence plays (its row shows pause icon)
7. First sentence ends
8. Second sentence synthesizes and plays
9. Process continues through all sentences
10. After last sentence, button returns to "Mängi kõik (3)"

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
- On error, sequence continues to next sentence
- On abort, loop breaks immediately

## Related Test Cases

- [TC-11: Sequential Playback](../../02-TEST-CASES/F04-playlist/TC-11-play-all.md)

## Notes

- Button only shows when 2+ sentences have text
- Single sentence uses individual play button
- User can still click individual play buttons during sequence (may interfere)
