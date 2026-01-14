# UJ-03: Shared Task Flow

**Type:** End-to-End User Journey  
**Priority:** High  
**Duration:** 5 minutes

## Overview

A student receives a shared task link from their teacher, views the exercise, practices pronunciation, and copies entries for personal practice.

## Persona

**Anna** - Student  
- Received exercise link from teacher
- Wants to practice pronunciation
- May want to continue practice offline

## Journey Map

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Receive     │ ──► │Access Shared│ ──► │Practice     │ ──► │Copy to      │
│ Link        │     │Task         │     │Entries      │     │Playlist     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Pre-conditions

- [ ] Shared task link received (from UJ-01 or test setup)
- [ ] Browser with audio enabled
- [ ] NOT logged in (simulating student without account)

## Test Data

Share URL format: `https://[domain]/share/[token]`

## Journey Steps

### Phase 1: Access Shared Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open shared link in browser | Page loads | ☐ |
| 2 | Verify task name displayed | "Tervituste harjutus" (or test name) | ☐ |
| 3 | Verify task description | Description visible | ☐ |
| 4 | Verify entries listed | All entries from task | ☐ |

### Phase 2: Practice Entries

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 5 | Click play on first entry | Audio synthesizes and plays | ☐ |
| 6 | Listen and repeat | Hear pronunciation | ☐ |
| 7 | Click play on second entry | Next entry plays | ☐ |
| 8 | Click play on third entry | All entries accessible | ☐ |

### Phase 3: Explore Variants

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 9 | Click on a word tag in an entry | Variants panel opens | ☐ |
| 10 | Preview variant pronunciations | Audio plays | ☐ |
| 11 | Close panel | Returns to task view | ☐ |

### Phase 4: Play All Entries

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 12 | Click "Mängi kõik" button | Sequential playback starts | ☐ |
| 13 | Listen to full sequence | All entries play in order | ☐ |
| 14 | Observe completion | Playback ends, button resets | ☐ |

### Phase 5: Verify Read-Only

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 15 | Look for edit options | No edit button visible | ☐ |
| 16 | Look for delete options | No delete button visible | ☐ |
| 17 | Try to drag entries | Drag not functional | ☐ |

### Phase 6: Copy to Playlist

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 18 | Click "Kopeeri kõnevooru" button | Action triggered | ☐ |
| 19 | Observe navigation | Redirected to synthesis view | ☐ |
| 20 | Verify entries in playlist | All entries appear as sentences | ☐ |
| 21 | Play a copied sentence | Audio works | ☐ |

### Phase 7: Continue Personal Practice

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 22 | Edit a copied sentence | Text modified | ☐ |
| 23 | Add new sentence | Own content added | ☐ |
| 24 | Play modified playlist | All entries play | ☐ |

## Success Criteria

- [ ] Shared task loaded without authentication
- [ ] All entries visible and playable
- [ ] Variants accessible for exploration
- [ ] Sequential playback works
- [ ] Successfully copied entries to personal playlist
- [ ] Personal modifications possible after copy

## Features Covered

| Feature | User Stories |
|---------|-------------|
| F01 Speech Synthesis | US-02, US-03 |
| F02 Pronunciation Variants | US-05, US-06 |
| F04 Playlist | US-11, US-13 |
| F06 Task Sharing | US-21 |

## Error Scenarios

### Invalid Share Link

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Navigate to invalid share URL | Error page loads | ☐ |
| 2 | Verify error message | "Ülesannet ei leitud" shown | ☐ |
| 3 | Verify navigation option | Link to return home | ☐ |

### Deleted Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Access link of deleted task | Error page loads | ☐ |
| 2 | Verify error message | Task not found | ☐ |

## Notes

- No authentication required to view shared task
- Copy to playlist works for anonymous users
- Copied entries persist in localStorage
- Original task is unaffected by student's actions
