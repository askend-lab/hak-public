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
| 2 | Select "Uuri foneetilist kuju" | Menu closes | ☐ |
| 3 | Observe panel | Panel slides in from right | ☐ |
| 4 | Verify header | "Lause foneetiline kuju" title | ☐ |
| 5 | Verify original text | "Noormees läks kooli" displayed | ☐ |
| 6 | Verify phonetic text | Phonetic form in editable input | ☐ |

### View Phonetic Content

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Examine phonetic text | UI markers visible (`` ` `` etc.) | ☐ |
| 2 | Verify word separation | Words separated by spaces | ☐ |
| 3 | Verify marker toolbar | Four marker buttons present | ☐ |

### Edit Phonetic Text

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click in phonetic input | Cursor appears | ☐ |
| 2 | Navigate to "kooli" | Cursor positioned | ☐ |
| 3 | Add `` ` `` before "o" | Text updated: `k`ooli` | ☐ |
| 4 | Verify changes | Modified text visible | ☐ |

### Use Marker Toolbar

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Position cursor in text | Cursor visible | ☐ |
| 2 | Click `` ` `` button | Marker inserted at cursor | ☐ |
| 3 | Click `'` button | Palatalization marker inserted | ☐ |

### Preview Changes

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Edit phonetic text | Changes made | ☐ |
| 2 | Click play button | Loading state | ☐ |
| 3 | Listen | Modified pronunciation plays | ☐ |

### Apply Changes

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Make phonetic edits | Text modified | ☐ |
| 2 | Click "Rakenda" button | Panel closes | ☐ |
| 3 | Verify notification | "Lause foneetiline kuju rakendatud" | ☐ |
| 4 | Synthesize sentence | Uses new phonetic form | ☐ |

### Close Without Saving

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Make changes in panel | Edits made | ☐ |
| 2 | Click X button | Panel closes | ☐ |
| 3 | Synthesize sentence | Uses original phonetic (unchanged) | ☐ |

## Edge Cases

- [ ] Empty phonetic text: Should not allow apply
- [ ] Only markers: May produce empty audio

## Notes

- Changes only persist after clicking "Rakenda"
- Original display text may change to match edited phonetic
- Audio cache invalidated after apply
