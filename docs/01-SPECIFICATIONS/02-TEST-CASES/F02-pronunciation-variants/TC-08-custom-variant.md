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
| 2 | Click "Loo oma variant" | Form expands below | ☐ |
| 3 | Verify form elements | Input field, marker toolbar, guide link | ☐ |
| 4 | Verify link text changes | Now shows "Eemalda loodud variant" | ☐ |

### Use Marker Toolbar

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click in input field | Cursor appears | ☐ |
| 2 | Type "koo" | Text appears in input | ☐ |
| 3 | Click `` ` `` button | `` ` `` inserted at cursor | ☐ |
| 4 | Type "li" | Result: `koo`li` | ☐ |
| 5 | Click `'` button | Palatalization marker inserted | ☐ |

### Preview Custom Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter custom phonetic: `k`ool'i` | Text in input | ☐ |
| 2 | Click play button | Loading spinner | ☐ |
| 3 | Listen | Custom pronunciation plays | ☐ |

### Apply Custom Variant

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With custom variant in input | Ready to apply | ☐ |
| 2 | Click "Kasuta" | Custom variant applied | ☐ |
| 3 | Close panel | Returns to main view | ☐ |
| 4 | Synthesize sentence | Uses custom pronunciation | ☐ |

### Access Phonetic Guide

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "siit" link in form description | View changes to guide | ☐ |
| 2 | Verify guide content | Marker explanations with examples | ☐ |
| 3 | Click "Tagasi" button | Returns to variants list | ☐ |

### Close Custom Form

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Eemalda loodud variant" | Form collapses | ☐ |
| 2 | Input is cleared | Empty input | ☐ |
| 3 | Link text reverts | Shows "Loo oma variant" | ☐ |

## Marker Toolbar Buttons

| Button | Marker | Name |
|--------|--------|------|
| ` | `` ` `` | Kolmas välde |
| ´ | `´` | Rõhuline silp |
| ' | `'` | Palatalisatsioon |
| + | `+` | Liitsõna piir |

## Notes

- Custom variant is transformed to Vabamorf format when applied
- UI markers (`` ` ´ ' +``) converted to Vabamorf format (`< ? ] _`)
- Invalid marker combinations may produce unexpected results
