# TC-14: Add Entries to Task

**User Story:** US-19  
**Feature:** F05 Task Management  
**Priority:** Critical  
**Type:** Functional

## Description

Verify adding sentences from synthesis view to existing or new tasks.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] User logged in
- [ ] At least one task exists
- [ ] Sentences with text in synthesis view

## Test Data

Sentences to add:
1. "Tere päevast"
2. "Kuidas läheb"
3. "Aitäh, hästi"

## Test Steps

### Add All to Existing Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | On synthesis view with 3 sentences | Sentences visible | ☐ |
| 2 | Click "Lisa ülesandesse" in header | Dropdown opens | ☐ |
| 3 | Verify task list in dropdown | Existing tasks shown | ☐ |
| 4 | Type to filter (optional) | Tasks filter by name | ☐ |
| 5 | Click on task name | Dropdown closes | ☐ |
| 6 | Verify notification | Success notification shown | ☐ |
| 7 | Open task | New entries appear in task | ☐ |

### Add All to New Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Lisa ülesandesse" dropdown | Dropdown opens | ☐ |
| 2 | Click "Loo uus ülesanne" | Task creation modal opens | ☐ |
| 3 | Enter task name | Name entered | ☐ |
| 4 | Click create | Modal closes | ☐ |
| 5 | Verify notification | Task created with entries | ☐ |
| 6 | Open new task | All sentences as entries | ☐ |

### Add Single Sentence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click ⋯ menu on one sentence | Menu opens | ☐ |
| 2 | Click "Lisa ülesandesse" | Task dropdown appears | ☐ |
| 3 | Select existing task | Menu closes | ☐ |
| 4 | Verify notification | Success notification shown | ☐ |
| 5 | Check task | Only that sentence added | ☐ |

### Add Without Authentication

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Log out | Not authenticated | ☐ |
| 2 | Enter sentences | Sentences visible | ☐ |
| 3 | Click "Lisa ülesandesse" in sentence menu | Login modal appears | ☐ |
| 4 | Login | Returns to synthesis | ☐ |
| 5 | Retry add | Works normally | ☐ |

## Entry Data Transferred

| Field | Source | Notes |
|-------|--------|-------|
| text | sentence.text | Display text |
| stressedText | sentence.phoneticText | Phonetic form if available |
| audioUrl | null | Not transferred |
| audioBlob | null | Not transferred |

## Notes

- Audio is not transferred (regenerated on playback)
- Phonetic text is preserved for variants
- Same sentence can be added multiple times
