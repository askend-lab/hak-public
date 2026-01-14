# TC-12: Create Task

**User Story:** US-15  
**Feature:** F05 Task Management  
**Priority:** Critical  
**Type:** Happy Path

## Description

Verify that an authenticated user can create a new task.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] User logged in (test user: isikukood `39901010011`)
- [ ] On Tasks view ("Ülesanded" tab)

## Test Data

| Field | Value |
|-------|-------|
| Name | `Hääldusharjutus 1` |
| Description | `Tervituste harjutamine` |

## Test Steps

### Create Empty Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click "Lisa" button in header | Modal opens | ☐ |
| 2 | Verify modal title | "Loo uus ülesanne" or similar | ☐ |
| 3 | Enter name: "Hääldusharjutus 1" | Name field populated | ☐ |
| 4 | Enter description: "Tervituste harjutamine" | Description field populated | ☐ |
| 5 | Click "Loo ülesanne" button | Modal closes | ☐ |
| 6 | Verify notification | Success notification appears | ☐ |
| 7 | Verify task list | New task appears in list | ☐ |

### Create Task with Entries

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Navigate to Synthesis view | Synthesis page loads | ☐ |
| 2 | Enter and synthesize: "Tere päevast" | Audio plays | ☐ |
| 3 | Add sentence: "Kuidas läheb" | Second sentence added | ☐ |
| 4 | Click "Lisa ülesandesse" dropdown | Task list dropdown opens | ☐ |
| 5 | Click "Loo uus ülesanne" | Task creation modal opens | ☐ |
| 6 | Enter name and create | Task created with 2 entries | ☐ |
| 7 | Navigate to Tasks, open new task | Entries visible in task | ☐ |

### Validation

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open create modal | Modal open | ☐ |
| 2 | Leave name empty | "Loo ülesanne" button disabled | ☐ |
| 3 | Enter only spaces | Button remains disabled | ☐ |
| 4 | Enter valid name | Button becomes enabled | ☐ |

## Edge Cases

- [ ] Very long name: Accepted, may truncate in display
- [ ] Special characters in name: Accepted
- [ ] Empty description: Allowed (optional field)

## Notes

- Task is created with share token for later sharing
- Empty tasks can be created (entries added later)
- Tasks persist in localStorage per user
