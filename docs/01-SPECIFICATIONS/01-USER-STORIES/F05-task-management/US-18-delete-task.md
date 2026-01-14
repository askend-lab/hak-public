# US-18: Delete Task

**Feature:** F05 Task Management  
**Priority:** High

## User Story

As a **language teacher**  
I want to **delete a task I no longer need**  
So that **I can keep my task list organized**

## Acceptance Criteria

- [ ] **AC-1:** "Kustuta" option is available in task menu
- [ ] **AC-2:** Clicking opens confirmation dialog
- [ ] **AC-3:** Confirmation shows task name
- [ ] **AC-4:** "Kustuta" button confirms deletion
- [ ] **AC-5:** "Tühista" button cancels deletion
- [ ] **AC-6:** Confirmed deletion removes task from localStorage
- [ ] **AC-7:** Task list refreshes after deletion
- [ ] **AC-8:** Success notification is shown
- [ ] **AC-9:** If viewing deleted task detail, navigate back to list

## UI Behavior

### Accessing Delete

**From Task List:**
1. Click ⋯ menu on task
2. Select "Kustuta"
3. Confirmation modal opens

**From Task Detail View:**
1. Click ⋯ menu in header
2. Select "Kustuta"
3. Confirmation modal opens

### Confirmation Modal

```
┌─────────────────────────────────────┐
│ Kustuta ülesanne                    │
├─────────────────────────────────────┤
│                                     │
│ Kas oled kindel, et soovid         │
│ ülesande "Hääldusharjutus 1"       │
│ kustutada?                          │
│                                     │
│          [Tühista]     [Kustuta]   │
│                          ↑          │
│                    Danger style     │
└─────────────────────────────────────┘
```

### Delete Button Styling

- "Kustuta" button uses danger variant (red)
- Clearly indicates destructive action

### Confirm Delete Flow

1. User clicks "Kustuta" in confirmation
2. DataService.deleteTask() called
3. Modal closes
4. If in detail view: Navigate to task list
5. Task list refreshes
6. Notification: `Ülesanne "${name}" kustutatud!`

### Cancel Flow

1. User clicks "Tühista" or closes modal
2. Modal closes
3. No deletion occurs
4. No navigation

## Warning

- Deletion is permanent
- All task entries are deleted with the task
- Share links become invalid

## Related Test Cases

- [TC-13: Task CRUD Operations](../../02-TEST-CASES/F05-task-management/TC-13-task-crud.md)

## Notes

- No undo functionality
- Associated entries are deleted
- Share token becomes orphaned (link won't work)
