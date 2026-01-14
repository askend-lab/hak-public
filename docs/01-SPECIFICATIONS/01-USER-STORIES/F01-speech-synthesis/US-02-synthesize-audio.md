# US-02: Synthesize and Play Audio

**Feature:** F01 Speech Synthesis  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **synthesize my Estonian text into spoken audio**  
So that **I can hear the correct pronunciation**

## Acceptance Criteria

- [ ] **AC-1:** Pressing Enter triggers synthesis when text is present
- [ ] **AC-2:** Clicking the play button triggers synthesis when text is present
- [ ] **AC-3:** During synthesis, the play button shows a loading spinner
- [ ] **AC-4:** Text is first analyzed by Vabamorf to add stress markers
- [ ] **AC-5:** Phonetic text is sent to Merlin TTS for audio generation
- [ ] **AC-6:** Single words use `efm_s` voice model, sentences (2+ words) use `efm_l` voice model
- [ ] **AC-7:** Audio plays automatically after synthesis completes
- [ ] **AC-8:** Play button shows pause icon while audio is playing
- [ ] **AC-9:** Play button returns to play icon when audio ends

## UI Behavior

### Synthesis Flow

1. User has entered text (tags or plain text)
2. User presses Enter or clicks Play button
3. Play button immediately shows loading spinner
4. System calls `/api/analyze` to get phonetic text
5. System calls `/api/synthesize` to generate audio
6. Loading spinner transitions to pause icon
7. Audio plays automatically
8. When audio ends, button returns to play icon

### Voice Model Selection

| Input | Word Count | Voice Model |
|-------|------------|-------------|
| `Tere` | 1 | `efm_s` (single word) |
| `Tere päevast` | 2 | `efm_l` (sentence) |
| `Noormees läks kooli` | 3 | `efm_l` (sentence) |

### State Transitions

```
[Idle] → Press Enter → [Loading] → Audio Ready → [Playing] → Audio Ends → [Idle]
         (spinner)                    (pause icon)              (play icon)
```

## Error Handling

- If analysis fails: Show error notification, stop loading
- If synthesis fails: Show error notification, stop loading
- If audio playback fails: Invalidate cache, retry once

## Related Test Cases

- [TC-01: Basic Synthesis Flow](../../02-TEST-CASES/F01-speech-synthesis/TC-01-basic-synthesis.md)
- [TC-03: Audio Playback States](../../02-TEST-CASES/F01-speech-synthesis/TC-03-audio-states.md)

## Notes

- Phonetic text is cached for reuse on repeated playback
- Audio URL (blob) is cached for instant replay of same text
- Cache is invalidated when text changes or variant is selected
