# TC-15: Share and Access Task

**User Story:** US-20, US-21  
**Feature:** F06 Task Sharing  
**Priority:** High  
**Type:** Functional

## Description

Verify sharing a task and accessing it via shared link.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] User logged in with task containing entries
- [ ] Second browser/incognito window available

## Test Steps

### Generate Share Link

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Navigate to task detail view | Task with entries visible | ☐ |
| 2 | Click "Jaga" button | Share modal opens | ☐ |
| 3 | Verify modal content | Task name and share URL displayed | ☐ |
| 4 | Verify URL format | Contains share token | ☐ |
| 5 | Click "Kopeeri" button | URL copied to clipboard | ☐ |
| 6 | Verify notification | "Link kopeeritud!" shown | ☐ |
| 7 | Close modal | Returns to task detail | ☐ |

### Share Link Persistence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Note the share URL | URL recorded | ☐ |
| 2 | Close share modal | Modal closed | ☐ |
| 3 | Reopen share modal | Same URL displayed | ☐ |

### Access Shared Task (Anonymous)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open incognito/private browser | Clean browser state | ☐ |
| 2 | Navigate to shared URL | Page loads | ☐ |
| 3 | Verify task name | Correct task name shown | ☐ |
| 4 | Verify entries | All entries visible | ☐ |
| 5 | Click play on entry | Audio synthesizes and plays | ☐ |

### Read-Only Restrictions

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | On shared task view | Viewing as anonymous | ☐ |
| 2 | Look for edit button | Not present | ☐ |
| 3 | Look for delete button | Not present | ☐ |
| 4 | Try drag and drop | Not functional or not available | ☐ |

### Copy to Playlist

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | On shared task view | Entries visible | ☐ |
| 2 | Click "Kopeeri kõnevooru" button | Action triggered | ☐ |
| 3 | Observe navigation | Redirects to synthesis view | ☐ |
| 4 | Verify playlist | All entries appear as sentences | ☐ |
| 5 | Play copied sentence | Audio works | ☐ |

### Invalid Share Token

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Navigate to invalid share URL | Page loads | ☐ |
| 2 | Verify error state | "Ülesannet ei leitud" message | ☐ |
| 3 | Verify CTA | Link to return home | ☐ |

## Notes

- Share token is generated at task creation
- Same token persists for task lifetime
- Deleted task: share link becomes invalid
- No authentication required to view shared task
