# TC-10: Playlist Management

**User Story:** US-11, US-12, US-14  
**Feature:** F04 Playlist Management  
**Priority:** High  
**Type:** Functional

## Description

Verify adding, reordering, and managing multiple sentences.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] At least one sentence with text

## Test Steps

### Add Sentences

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Verify "Lisa lause" button | Button visible below sentences | ☐ |
| 2 | Click "Lisa lause" | New empty sentence row appears | ☐ |
| 3 | Enter text in new row | Text visible | ☐ |
| 4 | Click "Lisa lause" again | Third sentence row added | ☐ |

### Reorder via Drag and Drop

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Hover over drag handle (left of first sentence) | Cursor changes to grab | ☐ |
| 2 | Click and hold | Cursor changes to grabbing | ☐ |
| 3 | Drag to position of third sentence | Visual indicator shows drop target | ☐ |
| 4 | Release | Sentences reordered | ☐ |
| 5 | Verify new order | First sentence now in third position | ☐ |

### Clear Sentence Content

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter text in a sentence | Tags visible | ☐ |
| 2 | Locate clear button (X) | Button visible in input area | ☐ |
| 3 | Click clear button | All tags and input cleared | ☐ |
| 4 | Verify sentence row | Row remains (empty), ready for input | ☐ |

### Remove Sentence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Have multiple sentences | 2+ sentences visible | ☐ |
| 2 | Click ⋯ menu on a sentence | Menu opens | ☐ |
| 3 | Select "Eemalda" | Sentence row removed | ☐ |
| 4 | Verify sentence list | One fewer sentence | ☐ |

### Remove Last Sentence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Have only one sentence with text | Single sentence | ☐ |
| 2 | Click ⋯ menu, select "Eemalda" | Sentence cleared (not removed) | ☐ |
| 3 | Verify | Empty sentence row remains | ☐ |

### Session Persistence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter text in a sentence | Text/tags visible | ☐ |
| 2 | Refresh the page (F5) | Sentence content restored | ☐ |
| 3 | Close browser tab | Tab closed | ☐ |
| 4 | Reopen application | Sentence content restored | ☐ |
| 5 | Verify isPlaying/isLoading state | These reset to false on reload | ☐ |

## Notes

- Order and content persist in localStorage between page reloads and browser sessions
- Clear is quick action (no confirmation)
- Remove is in menu (slightly hidden)
