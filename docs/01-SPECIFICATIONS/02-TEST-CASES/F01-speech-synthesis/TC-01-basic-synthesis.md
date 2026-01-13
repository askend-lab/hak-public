# TC-01: Basic Synthesis Flow

**User Story:** US-01, US-02  
**Feature:** F01 Speech Synthesis  
**Priority:** Critical  
**Type:** Happy Path

## Description

Verify that a user can enter Estonian text and hear synthesized audio playback.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Browser audio enabled
- [ ] Backend services running (Vabamorf, Merlin)

## Test Data

| Input | Voice Model Expected |
|-------|---------------------|
| `Tere` | `efm_s` |
| `Tere päevast` | `efm_l` |
| `Noormees läks kooli` | `efm_l` |

## Test Steps

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Navigate to application root | Synthesis page loads with empty input | ☐ |
| 2 | Click in text input field | Cursor appears, field is active | ☐ |
| 3 | Type "Tere" | Text "Tere" visible in input | ☐ |
| 4 | Press Enter | Loading spinner appears on play button | ☐ |
| 5 | Wait for audio | Audio plays, play button shows pause icon | ☐ |
| 6 | Wait for audio to complete | Play button returns to play icon | ☐ |
| 7 | Press Enter again | Audio replays from cache (no loading) | ☐ |

## Variations

### Variation A: Multi-word sentence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Clear input, type "Tere päevast" | Text visible in input | ☐ |
| 2 | Press Space | "Tere" becomes a tag | ☐ |
| 3 | Press Enter | Both words synthesized, uses efm_l model | ☐ |

### Variation B: Click play instead of Enter

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter text "Aitäh" | Text visible | ☐ |
| 2 | Click play button | Same synthesis flow as Enter | ☐ |

## Edge Cases

- [ ] Empty input: No synthesis, no error
- [ ] Only spaces: No synthesis, no error
- [ ] Very long text (>500 chars): Should synthesize successfully

## Notes

- First synthesis may be slower (cold start)
- Subsequent plays use cached audio
- Voice model determined by word count: 1 word = efm_s, 2+ words = efm_l
