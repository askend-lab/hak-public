# TC-13: Task CRUD Operations

**User Story:** US-16, US-17, US-18  
**Feature:** F05 Task Management  
**Priority:** High  
**Type:** Functional

## Description

Verify task list viewing, editing, and deletion operations.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] User logged in
- [ ] At least one task exists

## Test Steps

### View Task List

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Ülesanded" in header | Tasks view loads | ☐ |
| 2 | Verify task list | All user tasks displayed | ☐ |
| 3 | Verify task item | Shows name and entry count | ☐ |
| 4 | Click on task name/row | Task detail view opens | ☐ |

### View Task Details

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open a task with entries | Task detail view loads | ☐ |
| 2 | Verify header | Task name and description visible | ☐ |
| 3 | Verify entries | All entries displayed | ☐ |
| 4 | Click play on entry | Audio synthesizes and plays | ☐ |
| 5 | Click "← Tagasi" | Returns to task list | ☐ |

### Edit Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click ⋯ menu on task | Menu opens | ☐ |
| 2 | Select "Muuda" | Edit modal opens | ☐ |
| 3 | Verify pre-filled values | Current name and description shown | ☐ |
| 4 | Change name to "Uuendatud nimi" | Name updated in input | ☐ |
| 5 | Click "Salvesta" | Modal closes | ☐ |
| 6 | Verify notification | "Ülesanne uuendatud" shown | ☐ |
| 7 | Verify task list | New name reflected | ☐ |

### Delete Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click ⋯ menu on task | Menu opens | ☐ |
| 2 | Select "Kustuta" | Confirmation modal opens | ☐ |
| 3 | Verify message | Shows task name in confirmation | ☐ |
| 4 | Click "Tühista" | Modal closes, task remains | ☐ |
| 5 | Repeat and click "Kustuta" | Task deleted | ☐ |
| 6 | Verify notification | "Ülesanne kustutatud" shown | ☐ |
| 7 | Verify task list | Task no longer visible | ☐ |

### Delete While Viewing

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open task detail view | Viewing task | ☐ |
| 2 | Click ⋯ menu in header | Menu opens | ☐ |
| 3 | Select "Kustuta" and confirm | Task deleted | ☐ |
| 4 | Verify navigation | Returns to task list | ☐ |

## Empty State

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Delete all tasks | No tasks remain | ☐ |
| 2 | Verify empty state | Empty state illustration and message | ☐ |
| 3 | Verify CTA | "Loo ülesanne" button present | ☐ |

## Notes

- Delete is permanent (no undo)
- Entries are deleted with task
- Share links become invalid after deletion
