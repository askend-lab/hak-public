# US-03: Control Audio Playback

**Feature:** F01 Speech Synthesis  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **control the playback of synthesized audio**  
So that **I can listen repeatedly and at my own pace**

## Acceptance Criteria

- [x] **AC-1:** Play button is visible for each sentence row
- [x] **AC-2:** Clicking play on a new synthesis starts fresh audio
- [x] **AC-3:** Clicking play while already playing stops current and starts new playback
- [x] **AC-4:** Audio from cached data plays instantly without loading
- [x] **AC-5:** When audio completes, playback state resets to idle
- [x] **AC-6:** Only one sentence can play at a time (clicking another stops the current)
- [x] **AC-7:** Play button is disabled during loading state
- [x] **AC-8:** Play button is disabled when sentence has no text

## UI Behavior

### Play Button States

| State | Icon | Description |
|-------|------|-------------|
| Idle (no text) | Play triangle | Disabled, no text to play |
| Idle (has text) | Play triangle | Ready to play |
| Loading | Spinner | Synthesizing audio, button disabled |
| Playing | Pause bars | Audio is playing |

### Playback Control

**First Play (No Cache)**
1. Click play button
2. Button shows spinner (disabled)
3. Audio synthesizes
4. Button shows pause icon (enabled)
5. Audio plays
6. Audio ends → Button shows play icon

**Repeat Play (Cached)**
1. Click play button
2. Button immediately shows pause icon
3. Cached audio plays
4. Audio ends → Button shows play icon

**Play During Playback**
1. Audio is playing (pause icon visible)
2. Click play button again
3. Audio restarts from beginning (same sentence)

**Switch to Another Sentence**
1. Audio is playing for sentence A
2. Click play on sentence B
3. Sentence A stops, returns to idle state
4. Sentence B starts synthesis/playback

## Caching Behavior

- **Cached Data:** Both phonetic text and audio URL are stored per sentence
- **Cache Hit:** If text unchanged, play cached audio instantly (no loading)
- **Cache Miss:** If text changed, invalidate cache and re-synthesize
- **Cache Invalidation:** Occurs when:
  - Text is edited
  - Tags are added, removed, or modified
  - Pronunciation variant is applied

## Related Test Cases

- [TC-03: Audio Playback States](../../02-TEST-CASES/F01-speech-synthesis/TC-03-audio-states.md)
- [TC-04: Audio Caching](../../02-TEST-CASES/F01-speech-synthesis/TC-04-caching.md)

## Notes

- Multiple sentences can exist but only one plays at a time
- "Play All" is a separate feature (see F04 Playlist)
- Audio URLs are cached from API response
- Playback can be triggered by Enter key or play button click
