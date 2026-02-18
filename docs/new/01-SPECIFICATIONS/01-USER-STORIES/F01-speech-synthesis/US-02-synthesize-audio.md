# US-02: Synthesize and Play Audio

**Feature:** F01 Speech Synthesis  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **synthesize my Estonian text into spoken audio**  
So that **I can hear the correct pronunciation**

## Acceptance Criteria

- [x] **AC-1:** Pressing Enter triggers synthesis when text is present
- [x] **AC-2:** Clicking the play button triggers synthesis when text is present
- [x] **AC-3:** During synthesis, the play button shows a loading spinner
- [x] **AC-4:** Text is analyzed by Vabamorf API to add stress markers (optional, based on caching)
- [x] **AC-5:** Phonetic text is sent to Merlin TTS for audio generation
- [x] **AC-6:** Single words use `efm_s` voice model, sentences (2+ words) use `efm_l` voice model
- [x] **AC-7:** Audio plays automatically after synthesis completes
- [x] **AC-8:** Play button shows pause icon while audio is playing
- [x] **AC-9:** Play button returns to play icon when audio ends
- [x] **AC-10:** Play button is disabled when no text is present

## UI Behavior

### Synthesis Flow

1. User has entered text (tags or pending input)
2. User presses Enter or clicks Play button
3. If pending input exists, it is converted to tags first
4. Play button immediately shows loading spinner
5. System calls `/api/analyze` to get phonetic text (if not cached)
6. System calls `/api/synthesize` to generate audio
7. Loading spinner transitions to pause icon
8. Audio plays automatically
9. When audio ends, button returns to play icon

### Voice Model Selection

| Input | Word Count | Voice Model |
|-------|------------|-------------|
| `Tere` | 1 | `efm_s` (single word) |
| `Tere päevast` | 2 | `efm_l` (sentence) |
| `Noormees läks kooli` | 3 | `efm_l` (sentence) |
| `` (empty) | 0 | `efm_l` (default) |
| `   ` (whitespace) | 0 | `efm_l` (default) |

### State Transitions

```
[Idle] → Press Enter/Play → [Loading] → Audio Ready → [Playing] → Audio Ends → [Idle]
         (spinner)                        (pause icon)               (play icon)
```

### Play Button States

| State | Icon | Enabled |
|-------|------|---------|
| Idle (no text) | Play triangle | Disabled |
| Idle (has text) | Play triangle | Enabled |
| Loading | Spinner | Disabled |
| Playing | Pause bars | Enabled |

## Error Handling

- If analysis fails: Show error notification, stop loading, return to idle
- If synthesis fails: Show error notification, stop loading, return to idle
- If audio playback fails: Log error, return to idle

## Related Test Cases

- [TC-01: Basic Synthesis Flow](../../02-TEST-CASES/F01-speech-synthesis/TC-01-basic-synthesis.md)
- [TC-03: Audio Playback States](../../02-TEST-CASES/F01-speech-synthesis/TC-03-audio-states.md)

## Notes

- Phonetic text is cached for reuse on repeated playback
- Audio URL is cached for instant replay of same text
- Cache is invalidated when text changes or variant is selected
- Pending input text is automatically converted to tags before synthesis
- Voice model selection is based on word count in the phonetic text
