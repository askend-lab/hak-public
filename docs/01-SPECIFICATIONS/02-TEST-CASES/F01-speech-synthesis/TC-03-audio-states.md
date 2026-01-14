# TC-03: Audio Playback States

**User Story:** US-02, US-03  
**Feature:** F01 Speech Synthesis  
**Priority:** Critical  
**Type:** Functional

## Description

Verify correct visual states of play button during synthesis and playback.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Text entered: "Tere päevast"

## Test Steps

### State: Idle → Loading → Playing → Idle

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Observe play button | Shows play icon (▶) | ☐ |
| 2 | Click play button | Button shows loading spinner | ☐ |
| 3 | Wait for synthesis complete | Spinner changes to pause icon (❚❚) | ☐ |
| 4 | Observe during playback | Pause icon remains visible | ☐ |
| 5 | Wait for audio to end | Button returns to play icon (▶) | ☐ |

### Interrupt Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Start playback (audio playing) | Pause icon visible | ☐ |
| 2 | Click play button during playback | Current audio stops | ☐ |
| 3 | Observe | New synthesis starts (loading state) | ☐ |

### Cached Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Play text first time | Loading → Playing → Idle | ☐ |
| 2 | Play same text again (unchanged) | Immediately shows pause icon (no loading) | ☐ |
| 3 | Audio plays | From cached audio | ☐ |

### Multiple Sentences

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Add second sentence with text | Two sentence rows visible | ☐ |
| 2 | Play first sentence | First row shows pause, second shows play | ☐ |
| 3 | Click play on second sentence | First stops, second starts loading | ☐ |

## Expected Button States

| State | Icon | Description |
|-------|------|-------------|
| Idle | ▶ | Ready to play |
| Loading | ⟳ (spinner) | Synthesizing audio |
| Playing | ❚❚ | Audio actively playing |

## Notes

- Only one sentence can play at a time
- Clicking play on different sentence stops the current
- Cache hit skips loading state entirely
