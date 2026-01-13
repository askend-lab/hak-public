# TC-02: Input Behaviors

**User Story:** US-01  
**Feature:** F01 Speech Synthesis  
**Priority:** Critical  
**Type:** Functional

## Description

Verify tag-based input system behavior including Space, Backspace, and paste operations.

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

## Edge Cases

- [ ] Space in empty input (no tags): No action
- [ ] Backspace in empty input (no tags): No action
- [ ] Pasting text with multiple spaces: Single tags created (spaces normalized)

## Notes

- Space only creates tags when at least one tag already exists
- First word requires Enter to create both tag and trigger synthesis
- Tags are displayed as word chips, input follows after tags
