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
- [ ] Backend services running (Vabamorf API, Merlin TTS)

## Test Data

| Input | Voice Model Expected |
|-------|---------------------|
| `Tere` | `efm_s` |
| `Tere päevast` | `efm_l` |
| `Noormees läks kooli` | `efm_l` |
| `` (empty) | `efm_l` (default, but no synthesis occurs) |

## Test Steps

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Navigate to application root | Synthesis page loads with empty input, placeholder "Kirjuta sõna või lause ja vajuta Enter" | ☐ |
| 2 | Click in text input field | Cursor appears, field is active | ☐ |
| 3 | Type "Tere" | Text "Tere" visible in input | ☐ |
| 4 | Press Enter | Tag [Tere] created, loading spinner appears on play button | ☐ |
| 5 | Wait for audio | Audio plays, play button shows pause icon | ☐ |
| 6 | Wait for audio to complete | Play button returns to play icon | ☐ |
| 7 | Press Enter again | Audio replays from cache (no loading spinner, immediate pause icon) | ☐ |

## Variations

### Variation A: Multi-word sentence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Clear input, type "Tere päevast" | Text visible in input | ☐ |
| 2 | Press Enter | Both words become tags [Tere] [päevast] | ☐ |
| 3 | Observe playback | Uses efm_l model, synthesis starts | ☐ |

### Variation B: Space key creates tags (when tags exist)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tags [Tere] visible, type "kuidas" | Text visible in input after tag | ☐ |
| 2 | Press Space | "kuidas" becomes a tag, no synthesis triggered | ☐ |
| 3 | Type "läheb" and press Enter | Tag created AND synthesis starts | ☐ |

### Variation C: Click play instead of Enter

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter text "Aitäh" | Text visible in input | ☐ |
| 2 | Click play button | Tag created, same synthesis flow as Enter | ☐ |

## Edge Cases

- [ ] Empty input: Play button disabled, no synthesis on Enter
- [ ] Only spaces: Treated as empty, no synthesis
- [ ] Very long text (>500 chars): Should synthesize successfully (may take longer)

## Notes

- First synthesis may be slower (cold start)
- Subsequent plays use cached audio (no loading spinner)
- Voice model determined by word count: 1 word = efm_s, 2+ words = efm_l
- Space key only creates tags when at least one tag already exists
