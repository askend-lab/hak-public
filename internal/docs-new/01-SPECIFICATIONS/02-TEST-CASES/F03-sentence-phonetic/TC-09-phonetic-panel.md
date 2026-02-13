# TC-09: Phonetic Panel Operations

**User Story:** US-09, US-10  
**Feature:** F03 Sentence Phonetic Panel  
**Priority:** High  
**Type:** Functional

## Description

Verify viewing and editing the full sentence phonetic form.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Text synthesized: "Noormees läks kooli"
- [ ] Tags visible with phonetic forms cached

## Test Steps

### Open Phonetic Panel

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click ⋯ menu on sentence | Menu opens | ☐ |
| 2 | Verify menu options | "Uuri häälduskuju" option visible | ☐ |
| 3 | Select "Uuri häälduskuju" | Menu closes | ☐ |
| 4 | Observe panel | Panel slides in from right | ☐ |
| 5 | Verify header | "Muuda häälduskuju" title with X close button | ☐ |
| 6 | Verify description | "Sisesta hääldusmärgid, et täpsustada lause hääldust." | ☐ |
| 7 | Verify phonetic text | Phonetic form in editable textarea | ☐ |

### View Phonetic Content

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Examine phonetic text | UI markers visible (`` ` ``, `+`, etc.) | ☐ |
| 2 | Verify textarea | Multi-line editable text area | ☐ |
| 3 | Verify marker guide box | "Hääldusmärgid" section with four marker buttons | ☐ |
| 4 | Verify guide link | "siit" link present | ☐ |
| 5 | Verify action buttons | "Kuula" and "Rakenda" buttons visible | ☐ |

### Edit Phonetic Text

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click in phonetic textarea | Cursor appears | ☐ |
| 2 | Navigate to "kooli" | Cursor positioned | ☐ |
| 3 | Add `` ` `` before "o" | Text updated: `k`ooli` | ☐ |
| 4 | Verify changes | Modified text visible in textarea | ☐ |

### Use Marker Guide Box

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Position cursor in textarea | Cursor visible | ☐ |
| 2 | Click `` ` `` button in guide box | Marker inserted at cursor | ☐ |
| 3 | Verify cursor | Cursor moves after inserted marker | ☐ |
| 4 | Click `'` button | Palatalization marker inserted | ☐ |

### Preview Changes

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Edit phonetic text | Changes made | ☐ |
| 2 | Click "Kuula" button | Loading state (button shows spinner) | ☐ |
| 3 | Wait for audio | Button shows pause icon | ☐ |
| 4 | Listen | Modified pronunciation plays | ☐ |
| 5 | Audio ends | Button returns to play icon with "Kuula" text | ☐ |

### Apply Changes

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Make phonetic edits | Text modified | ☐ |
| 2 | Click "Rakenda" button | Panel closes automatically | ☐ |
| 3 | Synthesize sentence (press Enter) | Uses new phonetic form | ☐ |

### Access Phonetic Guide

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "siit" link in guide box | View changes to full guide | ☐ |
| 2 | Verify guide header | "Hääldusmärkide juhend" title | ☐ |
| 3 | Verify back button | Back arrow icon visible | ☐ |
| 4 | Verify guide content | Marker cards with symbol, name, rule, examples | ☐ |
| 5 | Click back arrow | Returns to edit form | ☐ |

### Close Without Saving

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Make changes in textarea | Edits made | ☐ |
| 2 | Click X button | Panel closes | ☐ |
| 3 | Open panel again | Shows original phonetic (changes discarded) | ☐ |

## Button States

| Button | Empty Textarea | Has Text | While Loading |
|--------|----------------|----------|---------------|
| Kuula | Disabled | Enabled | Disabled |
| Rakenda | Disabled | Enabled | Enabled |

## Edge Cases

- [ ] Empty phonetic text: Both buttons disabled
- [ ] Only markers (no letters): May produce empty or unexpected audio

## Notes

- Changes only persist after clicking "Rakenda"
- Closing with X button discards changes
- Audio cache invalidated after apply
- Voice model selection based on word count in phonetic text
