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
| 1 | Locate first variant (e.g., "kooli") | Variant row visible with play button | ☐ |
| 2 | Verify explanation | Speaker icon with explanation text visible | ☐ |
| 3 | Click play button on variant | Button shows loading spinner | ☐ |
| 4 | Wait for audio | Spinner changes to pause icon | ☐ |
| 5 | Listen | Audio of that specific variant plays | ☐ |
| 6 | Audio ends | Button returns to play icon | ☐ |

### Preview Different Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | While first variant plays, click play on second variant | First audio stops | ☐ |
| 2 | Second variant synthesizes | Loading spinner, then pause icon | ☐ |
| 3 | Listen | Different pronunciation heard | ☐ |

### Select Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Kasuta" on variant `k`ooli` | Variant row shows selected state (highlighted) | ☐ |
| 2 | Panel remains open | Can continue exploring other variants | ☐ |
| 3 | Close panel (X button) | Returns to main view | ☐ |
| 4 | Verify tag display | Tag still shows "kooli" (display unchanged) | ☐ |
| 5 | Press Enter to synthesize | Audio uses selected variant pronunciation | ☐ |

### Change Selection

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open variants panel again | Previously selected variant is highlighted | ☐ |
| 2 | Click "Kasuta" on different variant | New variant highlighted, old one not | ☐ |
| 3 | Synthesize | Uses new variant pronunciation | ☐ |

### Verify Pronunciation Change

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Note original pronunciation (play without variant) | Baseline audio | ☐ |
| 2 | Apply "kolmas välde" variant | Selection made and highlighted | ☐ |
| 3 | Synthesize sentence | Audio has different "kooli" pronunciation | ☐ |

## Pronunciation Explanation Examples

Each variant displays an explanation below the tags:

| Variant | Explanation |
|---------|-------------|
| `k`ooli` | "O" on pikk |
| `kooli` | Häälda nii, nagu on kirjutatud |

## Notes

- Variant preview uses `efm_s` (single word) model
- Selected variant persists until text is changed
- Original display word never changes (only internal phonetic form)
- Playing one variant stops any other currently playing
