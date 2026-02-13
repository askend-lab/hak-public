# TC-08: Custom Variant Creation

**User Story:** US-08  
**Feature:** F02 Pronunciation Variants  
**Priority:** High  
**Type:** Functional

## Description

Verify that users can create and use custom phonetic variants.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Variants panel open for any word
- [ ] Standard variants visible

## Test Steps

### Open Custom Form

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Scroll to bottom of variants | "Loo oma variant" link visible | ☐ |
| 2 | Click "Loo oma variant" | Form expands with title "Loo oma variant" | ☐ |
| 3 | Verify description | "Sisesta oma tekst hääldusmärkidega ja kuula tulemust." | ☐ |
| 4 | Verify form elements | Input field, marker guide box, play button, Helinda button | ☐ |
| 5 | Verify collapse link | "Eemalda loodud variant" visible at bottom | ☐ |

### Use Marker Guide Box

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Verify guide box title | "Hääldusmärgid" visible | ☐ |
| 2 | Verify guide box intro | "Kasuta märke häälduse täpsustamiseks..." | ☐ |
| 3 | Click in input field | Cursor appears | ☐ |
| 4 | Type "koo" | Text appears in input | ☐ |
| 5 | Click `` ` `` button in marker toolbar | `` ` `` inserted at cursor | ☐ |
| 6 | Type "li" | Result: `koo`li` | ☐ |
| 7 | Click `'` button | Peenendus marker `'` inserted | ☐ |

### Preview Custom Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter custom phonetic: `k`ool'i` | Text in input | ☐ |
| 2 | Click play button | Loading spinner | ☐ |
| 3 | Wait for audio | Pause icon, audio plays | ☐ |
| 4 | Listen | Custom pronunciation plays | ☐ |
| 5 | Audio ends | Play icon restored | ☐ |

### Apply Custom Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With custom variant in input | Ready to apply | ☐ |
| 2 | Click "Helinda" button | Custom variant applied to sentence | ☐ |
| 3 | Close panel | Returns to main view | ☐ |
| 4 | Synthesize sentence | Uses custom pronunciation | ☐ |

### Clear Custom Input

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type text in input | Text visible, X button appears | ☐ |
| 2 | Click X button in input | Input cleared | ☐ |
| 3 | Verify buttons | Play and Helinda buttons disabled | ☐ |

### Access Phonetic Guide

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Locate "siit" link in guide box | Link visible under markers | ☐ |
| 2 | Click "siit" link | View changes to full guide | ☐ |
| 3 | Verify guide title | "Hääldusmärkide juhend" in header | ☐ |
| 4 | Verify guide content | Marker explanations with examples | ☐ |
| 5 | Click back arrow | Returns to variants list | ☐ |

### Close Custom Form

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Eemalda loodud variant" | Form collapses | ☐ |
| 2 | Verify input cleared | Input is empty | ☐ |
| 3 | Verify link reverted | Shows "Loo oma variant" link | ☐ |

## Marker Toolbar Buttons

| Button | Marker | Name (tooltip) |
|--------|--------|----------------|
| ` | `` ` `` | kolmas välde |
| ´ | `´` | ebareeglipärase rõhu märk |
| ' | `'` | peenendus |
| + | `+` | liitsõnapiir |

## Button States

| Button | Empty Input | Has Input |
|--------|-------------|-----------|
| Play (▶) | Disabled | Enabled |
| Helinda | Disabled | Enabled |

## Notes

- Custom variant is transformed to Vabamorf format when applied
- UI markers (`` ` ´ ' +``) converted to Vabamorf format (`< ? ] _`)
- Invalid marker combinations may produce unexpected results
- "Helinda" button applies the custom variant (different label from standard "Kasuta")
