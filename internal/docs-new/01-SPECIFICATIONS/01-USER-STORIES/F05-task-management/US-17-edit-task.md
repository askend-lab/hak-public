# US-17: Edit Task Metadata

**Feature:** F05 Task Management  
**Priority:** High

## User Story

As a **language teacher**  
I want to **edit my task's name and description**  
So that **I can update the task information**

## Acceptance Criteria

- [x] **AC-1:** "Muuda" option is available in task menu
- [x] **AC-2:** Clicking opens edit modal with current values
- [x] **AC-3:** Name field is pre-filled with current name
- [x] **AC-4:** Description field is pre-filled with current description
- [x] **AC-5:** "Salvesta" button saves changes
- [x] **AC-6:** Changes are persisted to localStorage
- [x] **AC-7:** Task list reflects updated information
- [x] **AC-8:** Success notification is shown

## UI Behavior

### Accessing Edit

**From Task List:**
1. Click ⋯ menu on task
2. Select "Muuda"
3. Edit modal opens

**From Task Detail View:**
1. Click ⋯ menu in header
2. Select "Muuda"
3. Edit modal opens

### Edit Modal

```
┌─────────────────────────────────────┐
│ Muuda ülesannet                 [X]│
├─────────────────────────────────────┤
│                                     │
│ Pealkiri *                          │
│ ┌─────────────────────────────────┐ │
│ │ Hääldusharjutus 1               │ │ ← Pre-filled
│ └─────────────────────────────────┘ │
│                                     │
│ Kirjeldus                           │
│ ┌─────────────────────────────────┐ │
│ │ Selle ülesande eesmärk on...    │ │ ← Pre-filled
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│          [Tühista]      [Salvesta] │
└─────────────────────────────────────┘
```

### Validation

- Name is required
- Empty description clears existing description

### Save Flow

1. User modifies fields
2. User clicks "Salvesta"
3. DataService.updateTask() called
4. Modal closes
5. Task list/detail refreshes
6. Success notification shown

## Related Test Cases

- [TC-13: Task CRUD Operations](../../02-TEST-CASES/F05-task-management/TC-13-task-crud.md)

## Notes

- Editing does not affect task entries
- Share token remains unchanged
- updatedAt timestamp is updated
