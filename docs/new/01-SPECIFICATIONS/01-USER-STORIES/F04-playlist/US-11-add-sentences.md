# US-11: Add Multiple Sentences

**Feature:** F04 Playlist Management  
**Priority:** High

## User Story

As a **language learner**  
I want to **add multiple sentences to my list**  
So that **I can practice multiple phrases in sequence**

## Acceptance Criteria

- [x] **AC-1:** "Lisa lause" (Add sentence) button is visible below sentence list
- [x] **AC-2:** Clicking the button adds a new empty sentence row
- [x] **AC-3:** New sentence has empty input field ready for typing
- [x] **AC-4:** Multiple sentences can be added without limit
- [x] **AC-5:** Each sentence row has its own play button and menu
- [x] **AC-6:** Sentences are displayed in order of creation/arrangement
- [x] **AC-7:** First sentence starts with no tags (plain text input mode)

## UI Behavior

### Initial State

```
┌─────────────────────────────────────────┐
│ [    Kirjuta sõna või lause...       ]  │ ← Single empty sentence
│                              [▶]  [⋯]   │
└─────────────────────────────────────────┘
         [Lisa lause]
```

### After Adding Sentences

```
┌─────────────────────────────────────────┐
│ ⋮⋮ [Tere] [päevast]  [input...]  [▶] [⋯]│ ← Sentence 1 (with drag handle)
├─────────────────────────────────────────┤
│ ⋮⋮ [Noormees] [läks] [kooli]     [▶] [⋯]│ ← Sentence 2
├─────────────────────────────────────────┤
│ ⋮⋮ [       Type here...       ]  [▶] [⋯]│ ← Sentence 3 (empty)
└─────────────────────────────────────────┘
         [Lisa lause]
```

### Adding Flow

1. User clicks "Lisa lause" button
2. New empty sentence row appears at bottom
3. New row has:
   - Drag handle on left
   - Empty input field (no tags yet)
   - Play button (disabled until text entered)
   - Menu button (⋯)

### Sentence Row Components

| Element | Purpose |
|---------|---------|
| Drag handle (⋮⋮) | Reorder via drag-and-drop |
| Word tags | Clickable words for variants |
| Input field | Current text being typed |
| Clear button (X) | Clear all content (appears when content exists) |
| Play button | Synthesize and play |
| Menu button (⋯) | Actions (download, delete, etc.) |

## Related Test Cases

- [TC-10: Playlist Management](../../02-TEST-CASES/F04-playlist/TC-10-playlist-management.md)

## Notes

- There's no explicit limit on number of sentences
- Empty sentences are skipped during "Play All"
- Each sentence maintains its own state (tags, cache, etc.)
- Button uses `data-onboarding-target="add-sentence-button"` for onboarding guidance
