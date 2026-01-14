# US-03: Control Audio Playback

**Feature:** F01 Speech Synthesis  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **control the playback of synthesized audio**  
So that **I can listen repeatedly and at my own pace**

## Acceptance Criteria

- [ ] **AC-1:** Play button is visible for each sentence row
- [ ] **AC-2:** Clicking play on a new synthesis starts fresh audio
- [ ] **AC-3:** Clicking play while already playing stops current and starts new synthesis
- [ ] **AC-4:** Audio from cached data plays instantly without loading
- [ ] **AC-5:** When audio completes, playback state resets to idle
- [ ] **AC-6:** Only one sentence can play at a time (clicking another stops the current)

## UI Behavior

### Play Button States

| State | Icon | Description |
|-------|------|-------------|
| Idle | Play triangle | Ready to play |
| Loading | Spinner | Synthesizing audio |
| Playing | Pause bars | Audio is playing |

### Playback Control

**First Play (No Cache)**
1. Click play button
2. Button shows spinner
3. Audio synthesizes
4. Button shows pause icon
5. Audio plays
6. Audio ends → Button shows play icon

**Repeat Play (Cached)**
1. Click play button
2. Button immediately shows pause icon
3. Cached audio plays
4. Audio ends → Button shows play icon

**Interrupt Playback**
1. Audio is playing (pause icon visible)
2. Click play button again
3. Current audio stops
4. New synthesis starts (if text changed) or cached audio replays

## Caching Behavior

- **Cached:** Both phonetic text and audio blob URL are stored
- **Cache Hit:** If text unchanged, play cached audio instantly
- **Cache Miss:** If text changed, invalidate cache and re-synthesize

## Related Test Cases

- [TC-03: Audio Playback States](../../02-TEST-CASES/F01-speech-synthesis/TC-03-audio-states.md)
- [TC-04: Audio Caching](../../02-TEST-CASES/F01-speech-synthesis/TC-04-caching.md)

## Notes

- Multiple sentences can exist but only one plays at a time
- "Play All" is a separate feature (see F04 Playlist)
- Audio URLs are blob URLs created from API response
