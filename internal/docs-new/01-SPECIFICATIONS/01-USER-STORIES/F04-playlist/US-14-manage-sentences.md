# US-14: Manage Sentences (Delete, Clear)

**Feature:** F04 Playlist Management  
**Priority:** Medium

## User Story

As a **language learner**  
I want to **manage my sentences (delete, clear)**  
So that **I can organize my practice list efficiently**

## Acceptance Criteria

### Clear Sentence
- [x] **AC-1:** Clear button (X) appears when sentence has content (tags or input)
- [x] **AC-2:** Clicking clear removes all tags and input from that sentence
- [x] **AC-3:** Sentence row remains (empty), ready for new input
- [x] **AC-4:** Audio cache for that sentence is cleared

### Remove Sentence
- [x] **AC-5:** "Eemalda" option is available in sentence menu
- [x] **AC-6:** Clicking remove deletes the entire sentence row
- [x] **AC-7:** If only one sentence exists, it is cleared instead of removed
- [x] **AC-8:** Audio URL is revoked when sentence removed

## UI Behavior

### Clear Button

Located at the right of the tags/input area when content exists:
```
[Tere] [päevast] [input...] [X]   [▶] [⋯]
                             ↑
                        Clear button
```

**After Clear:**
```
[                input...         ]   [▶] [⋯]
```

### Sentence Menu

```
⋯ Menu
├── Lisa ülesandesse      (Add to task) - requires auth
├── Uuri häälduskuju      (Explore phonetic)
├── Lae alla .wav fail    (Download WAV)
├── Kopeeri tekst         (Copy text)
└── Eemalda               (Remove) - danger style
```

### Remove Behavior

**Multiple sentences (3):**
```
Before:              After removing #2:
1. Tere              1. Tere
2. Kuidas    ←       3. Aitäh
3. Aitäh
```

**Single sentence:**
```
Before:              After "remove":
1. Tere              1. [empty]   ← Cleared, not removed
```

## State Management

### Clear
```javascript
{
  tags: [],
  currentInput: '',
  text: '',
  stressedTags: undefined,
  phoneticText: undefined,
  audioUrl: undefined  // Cache cleared
}
```

### Remove
- Sentence removed from array
- If `sentences.length === 1`, reset to empty instead
- `URL.revokeObjectURL(audioUrl)` called if audioUrl exists

## Related Test Cases

- [TC-10: Playlist Management](../../02-TEST-CASES/F04-playlist/TC-10-playlist-management.md)

## Notes

- Clear is quick action (X button), remove is in menu
- All actions are immediate (no confirmation dialog)
- Menu items are disabled when sentence has no text (except Eemalda)
