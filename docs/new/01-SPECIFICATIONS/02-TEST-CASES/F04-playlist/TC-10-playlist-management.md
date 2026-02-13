# TC-10: Playlist Management

**User Story:** US-11, US-12, US-14, US-15  
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
| 3 | Verify new row | Has drag handle, empty input, play button, menu button | ☐ |
| 4 | Enter text in new row | Text visible, tags created on Enter | ☐ |
| 5 | Click "Lisa lause" again | Third sentence row added | ☐ |

### Reorder via Drag and Drop

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Hover over drag handle (⋮⋮ on left of first sentence) | Cursor changes to grab | ☐ |
| 2 | Click and hold | Cursor changes to grabbing | ☐ |
| 3 | Drag to position of third sentence | Dragged row shows reduced opacity | ☐ |
| 4 | Observe drop target | Visual indicator shows drop position | ☐ |
| 5 | Release | Sentences reordered | ☐ |
| 6 | Verify new order | First sentence now in new position | ☐ |

### Clear Sentence Content

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter text in a sentence | Tags visible | ☐ |
| 2 | Locate clear button (X) | Button visible at right of tags/input | ☐ |
| 3 | Click clear button | All tags and input cleared | ☐ |
| 4 | Verify sentence row | Row remains (empty), ready for input | ☐ |

### Remove Sentence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Have multiple sentences | 2+ sentences visible | ☐ |
| 2 | Click ⋯ menu on a sentence | Menu opens | ☐ |
| 3 | Verify menu options | "Lisa ülesandesse", "Uuri häälduskuju", "Lae alla .wav fail", "Kopeeri tekst", "Eemalda" | ☐ |
| 4 | Select "Eemalda" | Sentence row removed | ☐ |
| 5 | Verify sentence list | One fewer sentence | ☐ |

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
| 3 | Verify order | Same order as before refresh | ☐ |
| 4 | Close browser tab | Tab closed | ☐ |
| 5 | Reopen application | Sentence content restored | ☐ |
| 6 | Verify isPlaying/isLoading state | These reset to false on reload | ☐ |

### Verify localStorage

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open browser DevTools | Console available | ☐ |
| 2 | Check localStorage.getItem('eki_synthesis_state') | Returns JSON array of sentences | ☐ |
| 3 | Verify data structure | Contains id, text, tags, currentInput, phoneticText, audioUrl, stressedTags | ☐ |
| 4 | Verify no transient state | isPlaying and isLoading NOT present | ☐ |

## Notes

- Order and content persist in localStorage with key `eki_synthesis_state`
- Clear is quick action (no confirmation)
- Remove is in menu (slightly hidden, danger style)
- Legacy migration from `eki_playlist_entries` supported for backward compatibility
