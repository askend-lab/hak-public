# TC-02: Input Behaviors

**User Story:** US-01  
**Feature:** F01 Speech Synthesis  
**Priority:** Critical  
**Type:** Functional

## Description

Verify tag-based input system behavior including Space, Backspace, paste operations, and inline tag editing via menu.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Empty sentence row visible

## Test Steps

### Space Key Creates Tags

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type "Tere" and press Enter (creates first synthesis) | Text synthesizes normally | ☐ |
| 2 | Type "Kuidas" | Word appears in input | ☐ |
| 3 | Press Space | "Kuidas" becomes a tag chip | ☐ |
| 4 | Type "läheb" | New word in input after tag | ☐ |
| 5 | Press Space | "läheb" becomes second tag | ☐ |

### Backspace Edits Last Tag

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tags [Kuidas] [läheb] and empty input | Two tags visible | ☐ |
| 2 | Press Backspace | "läheb" moves back to input field | ☐ |
| 3 | Press Backspace again | "läheb" becomes "läheb" (character deleted) | ☐ |
| 4 | Clear input, press Backspace | "Kuidas" moves to input | ☐ |

### Paste Multi-word Text

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With existing tag [Tere] | One tag exists | ☐ |
| 2 | Paste "kuidas sul läheb" | Three new tags created | ☐ |
| 3 | Verify tags | [Tere] [kuidas] [sul] [läheb] visible | ☐ |

### Enter Creates Tag and Synthesizes

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type "Tervitused" (no existing tags) | Text in input | ☐ |
| 2 | Press Enter | Tag created AND synthesis starts | ☐ |

### Tag Menu Opens on Click

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tag [koer] visible | Tag displayed | ☐ |
| 2 | Click on [koer] tag | Dropdown menu opens | ☐ |
| 3 | Verify menu options | "Uuri variandid", "Muuda", "Kustuta" visible | ☐ |
| 4 | Click outside menu | Menu closes | ☐ |

### Edit Tag via Menu (Muuda)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tag [koer] visible | Tag displayed | ☐ |
| 2 | Click on [koer] tag | Menu opens | ☐ |
| 3 | Select "Muuda" | Tag transforms to editable input with "koer" | ☐ |
| 4 | Delete "r" to make "koe" | Input shows "koe" | ☐ |
| 5 | Press Enter | Tag shows "koe" AND audio synthesizes | ☐ |
| 6 | Verify tag value persisted | Tag displays "koe" (not reverted) | ☐ |

### Edit Tag - Cancel with Escape

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click tag and select "Muuda" | Tag becomes editable | ☐ |
| 2 | Change "koer" to "kass" | Input shows "kass" | ☐ |
| 3 | Press Escape | Tag reverts to "koer" | ☐ |

### Delete Tag via Menu (Kustuta)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tags [Tere] [koer] visible | Two tags displayed | ☐ |
| 2 | Click on [koer] tag | Menu opens | ☐ |
| 3 | Select "Kustuta" | [koer] tag removed | ☐ |
| 4 | Verify remaining tags | Only [Tere] visible | ☐ |

## Edge Cases

- [ ] Space in empty input (no tags): No action
- [ ] Backspace in empty input (no tags): No action
- [ ] Pasting text with multiple spaces: Single tags created (spaces normalized)
- [ ] Editing tag with Space key: Confirms edit without synthesis
- [ ] Editing tag to empty value: Tag is deleted
- [ ] Editing tag with multiple words (add space): Creates multiple tags from edit

## Notes

- Space only creates tags when at least one tag already exists
- First word requires Enter to create both tag and trigger synthesis
- Tags are displayed as word chips, input follows after tags
