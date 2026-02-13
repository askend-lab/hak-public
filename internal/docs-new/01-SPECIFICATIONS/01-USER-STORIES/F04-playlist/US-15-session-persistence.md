# US-15: Session Persistence

**Feature:** F04 Playlist Management  
**Priority:** High

## User Story

As a **language learner**  
I want my **entered sentences to persist across page refreshes and browser sessions**  
So that **I don't lose my work when I accidentally refresh or close the browser**

## Acceptance Criteria

- [x] **AC-1:** Sentence content (text, tags, currentInput) persists to localStorage
- [x] **AC-2:** On page refresh, sentences are restored from localStorage
- [x] **AC-3:** On browser close and reopen, sentences are restored
- [x] **AC-4:** Transient UI state (isPlaying, isLoading) resets to false on reload
- [x] **AC-5:** Cached audio URLs are preserved for replay
- [x] **AC-6:** Sentence order is preserved across sessions
- [x] **AC-7:** Phonetic text and stressed tags are preserved

## Technical Implementation

### Storage Key
```
eki_synthesis_state
```

### Data Stored
```javascript
[
  {
    id: string,
    text: string,
    tags: string[],
    currentInput: string,
    phoneticText: string | null,
    audioUrl: string | null,
    stressedTags: string[] | null
    // isPlaying, isLoading intentionally NOT stored
  }
]
```

### Load on Mount
- Uses lazy initialization: `useState(loadInitialState)`
- Restores from localStorage if valid data exists
- Falls back to initial empty sentence otherwise

### Save on Change
- useEffect watches sentences array
- Skips initial mount to avoid overwriting just-loaded data
- Sanitizes transient state (isPlaying, isLoading) before saving

### Sanitization for Storage

Before saving, transient UI state is stripped:
```javascript
const sanitizeForStorage = (sentences) => sentences.map(s => ({
  id: s.id,
  text: s.text,
  tags: s.tags,
  currentInput: s.currentInput,
  phoneticText: s.phoneticText,
  audioUrl: s.audioUrl,
  stressedTags: s.stressedTags
  // isPlaying and isLoading NOT included
}));
```

## Related Test Cases

- [TC-10: Playlist Management](../../02-TEST-CASES/F04-playlist/TC-10-playlist-management.md)

## Notes

- Legacy migration from `eki_playlist_entries` is preserved for backward compatibility
- Audio blob URLs may become invalid across sessions (depends on browser)
- On restore, isPlaying and isLoading are set to false
