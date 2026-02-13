# TC-03: Audio Playback States

**User Story:** US-02, US-03  
**Feature:** F01 Speech Synthesis  
**Priority:** Critical  
**Type:** Functional

## Description

Verify correct visual states of play button during synthesis and playback.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Text entered: "Tere päevast" (as tags)

## Test Steps

### State: Idle → Loading → Playing → Idle

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Observe play button | Shows play icon (▶), enabled | ☐ |
| 2 | Click play button | Button shows loading spinner, disabled | ☐ |
| 3 | Wait for synthesis complete | Spinner changes to pause icon (❚❚) | ☐ |
| 4 | Observe during playback | Pause icon remains visible | ☐ |
| 5 | Wait for audio to end | Button returns to play icon (▶) | ☐ |

### Play During Playback (Same Sentence)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Start playback (audio playing) | Pause icon visible | ☐ |
| 2 | Click play button during playback | Audio restarts from beginning | ☐ |
| 3 | Observe | No loading state (cached), plays immediately | ☐ |

### Cached Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Play text first time | Loading → Playing → Idle | ☐ |
| 2 | Play same text again (unchanged) | Immediately shows pause icon (no loading spinner) | ☐ |
| 3 | Audio plays | From cached audio | ☐ |

### Multiple Sentences - Exclusive Playback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Lisa lause" to add second sentence | Two sentence rows visible | ☐ |
| 2 | Enter text in second sentence | Both sentences have text | ☐ |
| 3 | Play first sentence | First row shows pause icon, second shows play icon | ☐ |
| 4 | Click play on second sentence | First stops (returns to play icon), second starts loading | ☐ |
| 5 | Wait for second to play | Second shows pause, first shows play | ☐ |

### Disabled State (No Text)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Clear all text from sentence | No tags, empty input | ☐ |
| 2 | Observe play button | Play icon visible but button disabled | ☐ |
| 3 | Click play button | Nothing happens | ☐ |

## Expected Button States

| State | Icon | Enabled | Condition |
|-------|------|---------|-----------|
| Idle (no text) | ▶ | No | No text in sentence |
| Idle (has text) | ▶ | Yes | Text present, not playing |
| Loading | ⟳ (spinner) | No | Synthesizing audio |
| Playing | ❚❚ | Yes | Audio actively playing |

## Notes

- Only one sentence can play at a time
- Clicking play on different sentence stops the current
- Cache hit skips loading state entirely
- Button disabled during loading prevents double-clicks
