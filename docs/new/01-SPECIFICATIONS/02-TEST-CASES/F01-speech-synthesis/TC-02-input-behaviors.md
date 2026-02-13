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

### First Tag Creation (Requires Enter)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type "Tere" (no existing tags) | Text appears in input | ☐ |
| 2 | Press Space | Nothing happens (Space doesn't work without existing tags) | ☐ |
| 3 | Press Enter | Tag [Tere] created AND synthesis starts | ☐ |

### Space Key Creates Tags (When Tags Exist)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tag [Tere] existing, type "Kuidas" | Word appears in input after tag | ☐ |
| 2 | Press Space | "Kuidas" becomes a tag chip [Kuidas] | ☐ |
| 3 | Type "läheb" | New word in input after tags | ☐ |
| 4 | Press Space | "läheb" becomes tag [läheb] | ☐ |

### Backspace Moves Tag to Input

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tags [Kuidas] [läheb] and empty input | Two tags visible, input empty | ☐ |
| 2 | Press Backspace | "läheb" moves back to input field, tag removed | ☐ |
| 3 | Press Backspace (on text) | Character deleted from "läheb" | ☐ |
| 4 | Clear input completely, press Backspace | "Kuidas" moves to input | ☐ |

### Multi-word Input (Paste or Type)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With existing tag [Tere] | One tag exists | ☐ |
| 2 | Paste "kuidas sul läheb" | Text appears in input field (NOT as tags yet) | ☐ |
| 3 | Press Enter | All words become tags [Tere] [kuidas] [sul] [läheb], synthesis starts | ☐ |

### Tag Menu Opens on Click

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tag [koer] visible | Tag displayed with chevron icon | ☐ |
| 2 | Click on [koer] tag | Dropdown menu opens | ☐ |
| 3 | Verify menu options | "Vali sõna häälduskuju", "Muuda sõna kirjakuju", "Kustuta sõna" visible | ☐ |
| 4 | Click outside menu | Menu closes | ☐ |

### Edit Tag via Menu (Muuda sõna kirjakuju)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tag [koer] visible | Tag displayed | ☐ |
| 2 | Click on [koer] tag | Menu opens | ☐ |
| 3 | Select "Muuda sõna kirjakuju" | Tag transforms to editable input with "koer" | ☐ |
| 4 | Delete "r" to make "koe" | Input shows "koe" | ☐ |
| 5 | Press Enter | Tag shows [koe] AND audio synthesizes | ☐ |
| 6 | Verify tag value persisted | Tag displays "koe" (not reverted) | ☐ |

### Edit Tag - Confirm with Space (No Synthesis)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click tag and select "Muuda sõna kirjakuju" | Tag becomes editable | ☐ |
| 2 | Change "koer" to "kass" | Input shows "kass" | ☐ |
| 3 | Press Space | Tag shows [kass], NO synthesis triggered | ☐ |

### Edit Tag - Cancel with Escape

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click tag and select "Muuda sõna kirjakuju" | Tag becomes editable | ☐ |
| 2 | Change "koer" to "kass" | Input shows "kass" | ☐ |
| 3 | Press Escape | Tag reverts to "koer" | ☐ |

### Delete Tag via Menu (Kustuta sõna)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tags [Tere] [koer] visible | Two tags displayed | ☐ |
| 2 | Click on [koer] tag | Menu opens | ☐ |
| 3 | Select "Kustuta sõna" | [koer] tag removed | ☐ |
| 4 | Verify remaining tags | Only [Tere] visible | ☐ |

### Clear All Button

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With tags [Tere] [koer] and text in input | Tags and input visible, X button visible | ☐ |
| 2 | Click X (clear) button | All tags and input cleared | ☐ |
| 3 | Verify state | Empty input, no tags, X button hidden | ☐ |

## Edge Cases

- [ ] Space in empty input (no tags): No action
- [ ] Backspace in empty input (no tags): No action
- [ ] Pasting text with multiple spaces: Words split normally, extra spaces ignored
- [ ] Editing tag with Space key: Confirms edit without synthesis
- [ ] Editing tag to empty value: Tag is deleted
- [ ] Editing tag with multiple words (add spaces): Creates multiple tags from single tag
- [ ] Blur (click outside) while editing tag: Confirms edit without synthesis

## Notes

- Space only creates tags when at least one tag already exists
- First word requires Enter to create both tag and trigger synthesis
- Tags are displayed as word chips with chevron, input follows after tags
- Tag menu has three options with Estonian labels matching implementation
