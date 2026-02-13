# TC-19: Notification Display

**User Story:** US-28  
**Feature:** F10 Notifications  
**Priority:** Medium  
**Type:** Functional

## Description

Verify notification system displays and auto-dismisses correctly.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] User logged in (for task-related notifications)

## Test Steps

### Success Notification

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Create a new task | Task created | ☐ |
| 2 | Observe notification area (top-right) | Green success notification appears | ☐ |
| 3 | Verify content | Title visible | ☐ |
| 4 | Wait ~5 seconds | Notification auto-dismisses | ☐ |

### Notification with Action Button

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Add sentences to task | Entries added | ☐ |
| 2 | Observe notification | Shows "Vaata ülesannet" button | ☐ |
| 3 | Click action button | Navigates to task | ☐ |

### Manual Dismiss

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Trigger any notification | Notification appears | ☐ |
| 2 | Click X button on notification | Notification immediately disappears | ☐ |

### Multiple Notifications

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Quickly perform multiple actions | E.g., create task, add entries | ☐ |
| 2 | Observe notification area | Multiple notifications stack | ☐ |
| 3 | Verify order | Latest on top | ☐ |
| 4 | Each dismisses | Auto-dismiss works independently | ☐ |

### Error Notification

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Trigger an error (e.g., network error) | Error occurs | ☐ |
| 2 | Observe notification | Red error notification appears | ☐ |
| 3 | Verify content | Error message visible | ☐ |

### Info Notification

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Copy share link | Click "Kopeeri" button | ☐ |
| 2 | Observe notification | Blue info notification appears | ☐ |
| 3 | Verify content | "Link kopeeritud!" visible | ☐ |

### Warning Notification

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Search variants for non-Estonian word | Click "Vali sõna häälduskuju" on "hello" | ☐ |
| 2 | Wait for response | No variants found | ☐ |
| 3 | Observe notification | Yellow warning notification appears | ☐ |
| 4 | Verify content | Warning message visible | ☐ |

## Notification Triggers

| Action | Expected Notification |
|--------|----------------------|
| Task created | Success: "Ülesanne loodud!" |
| Task updated | Success: Update message |
| Task deleted | Success: Delete message |
| Entries added | Success: "X lauset lisatud ülesandesse" |
| Link copied | Info: "Link kopeeritud!" |
| No variants found | Warning: "Variante ei leitud" |
| Phonetic applied | Success: "Lause uus häälduskuju rakendatud" |
| Error | Error: Relevant error message |

## Notes

- Notifications are not persisted (lost on refresh)
- Auto-dismiss timeout is approximately 5 seconds
- Action buttons navigate when clicked
