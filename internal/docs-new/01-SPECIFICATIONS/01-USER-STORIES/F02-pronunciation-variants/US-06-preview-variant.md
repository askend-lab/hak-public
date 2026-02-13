# US-06: Preview Variant Audio

**Feature:** F02 Pronunciation Variants  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **preview how each pronunciation variant sounds**  
So that **I can choose the correct pronunciation for my context**

## Acceptance Criteria

- [x] **AC-1:** Each variant has a play button
- [x] **AC-2:** Clicking play synthesizes and plays the variant audio
- [x] **AC-3:** Variant audio uses `efm_s` (single word) voice model
- [x] **AC-4:** Play button shows loading spinner during synthesis
- [x] **AC-5:** Play button shows pause icon while playing
- [x] **AC-6:** Play button returns to play icon when audio ends
- [x] **AC-7:** Playing a new variant stops any currently playing audio
- [x] **AC-8:** Each variant includes a pronunciation explanation with speaker icon

## UI Behavior

### Play Button States

| State | Visual | Description |
|-------|--------|-------------|
| Ready | ▶ (blue circle) | Ready to play |
| Loading | Spinner | Synthesizing |
| Playing | ❚❚ (pause) | Audio playing |

### Playback Flow

1. User clicks play button on variant
2. Button shows loading spinner (button disabled)
3. Audio synthesizes via `/api/synthesize` with `efm_s` model
4. Spinner changes to pause icon
5. Audio plays
6. When finished, button returns to play icon

### Pronunciation Explanation

Below each variant header, a pronunciation explanation appears with a speaker icon:

| Phonetic Form | Explanation |
|---------------|-------------|
| `k`ooli` | "O" on pikk |
| `p`eet'i` | "E" on pikk. "T" on pehme hääldusega |
| `maja+uks` | Põhirõhk esimesel osal |
| `kooli` | Häälda nii, nagu on kirjutatud |

### Variant Item Structure

```
┌─────────────────────────────────────┐
│ k`ooli                              │ ← Phonetic text
│ [kolmas välde]                      │ ← Tags
│                                     │
│ 🔊 "O" on pikk                      │ ← Explanation with speaker icon
│                                     │
│                    [▶]    [Kasuta]  │ ← Play and Use buttons
└─────────────────────────────────────┘
```

## Audio Generation

- **Endpoint:** `/api/synthesize`
- **Voice Model:** `efm_s` (single word model)
- **Input:** Variant phonetic text (in Vabamorf format)

## Related Test Cases

- [TC-07: Preview and Select Variant](../../02-TEST-CASES/F02-pronunciation-variants/TC-07-preview-select.md)

## Notes

- Multiple variants can be previewed sequentially
- Audio is generated on-demand, not pre-cached
- Same variant can be replayed multiple times
- Playing another variant stops the current one
