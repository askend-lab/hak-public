# TC-07: Preview and Select Variant

**User Story:** US-06, US-07  
**Feature:** F02 Pronunciation Variants  
**Priority:** Critical  
**Type:** Functional

## Description

Verify that variants can be previewed and selected for use in synthesis.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Text synthesized: "Noormees läks kooli"
- [ ] Variants panel open for "kooli"

## Test Steps

### Preview Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Locate first variant (e.g., "kooli") | Variant row visible | ☐ |
| 2 | Click play button on variant | Button shows loading spinner | ☐ |
| 3 | Wait for audio | Spinner changes to pause icon | ☐ |
| 4 | Listen | Audio of that specific variant plays | ☐ |
| 5 | Audio ends | Button returns to play icon | ☐ |

### Preview Different Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click play on second variant | First audio stops (if playing) | ☐ |
| 2 | Second variant synthesizes | Loading then playing | ☐ |
| 3 | Listen | Different pronunciation heard | ☐ |

### Select Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Kasuta" on variant `k`ooli` | Variant row shows selected state | ☐ |
| 2 | Panel remains open | Can continue exploring | ☐ |
| 3 | Close panel | Returns to main view | ☐ |
| 4 | Verify tag display | Tag still shows "kooli" (unchanged) | ☐ |
| 5 | Press Enter to synthesize | Audio uses selected variant pronunciation | ☐ |

### Verify Pronunciation Change

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Note original pronunciation | Without variant | ☐ |
| 2 | Apply "kolmas välde" variant | Selection made | ☐ |
| 3 | Synthesize sentence | Audio has different "kooli" pronunciation | ☐ |

## Pronunciation Explanation

Each variant displays an explanation below it:

| Variant | Explanation |
|---------|-------------|
| `k`ooli` | "O" on pikk |
| `kooli` | Häälda nii, nagu on kirjutatud |

## Notes

- Variant preview uses `efm_s` (single word) model
- Selected variant persists until text changed
- Original display word never changes (only phonetic form)
