# US-15: Create New Task

**Feature:** F05 Task Management  
**Priority:** Critical

## User Story

As a **language teacher**  
I want to **create a new task with a name and description**  
So that **I can organize my pronunciation exercises**

## Acceptance Criteria

- [x] **AC-1:** "Lisa" (Add) button is visible in Tasks view header
- [x] **AC-2:** Clicking the button opens task creation modal
- [x] **AC-3:** Modal has input field for task name (required)
- [x] **AC-4:** Modal has textarea for task description (optional)
- [x] **AC-5:** "Loo ülesanne" button creates the task
- [x] **AC-6:** Task is saved to backend database via DataService
- [x] **AC-7:** New task appears in task list after creation
- [x] **AC-8:** Success notification is shown
- [x] **AC-9:** User must be authenticated to create tasks

## UI Behavior

### Accessing Task Creation

**From Tasks View:**
1. Navigate to "Ülesanded" (Tasks) tab
2. Click "Lisa" button in header
3. Modal opens

**From Synthesis View:**
1. Click "Lisa ülesandesse" dropdown
2. Select "Loo uus ülesanne"
3. Modal opens

### Task Creation Modal

```
┌─────────────────────────────────────┐
│ Loo uus ülesanne                [X]│
├─────────────────────────────────────┤
│                                     │
│ Pealkiri *                          │
│ ┌─────────────────────────────────┐ │
│ │ Hääldusharjutus 1               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Kirjeldus                           │
│ ┌─────────────────────────────────┐ │
│ │ Selle ülesande eesmärk on...    │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [Tühista]    [Loo ülesanne] │
└─────────────────────────────────────┘
```

### Validation

- Name is required (button disabled if empty)
- Description is optional
- No duplicate name validation

### After Creation

1. Modal closes
2. Task list refreshes
3. New task appears in list
4. Success notification shown

## Authentication Requirement

If user is not authenticated:
1. "Lisa" button still visible
2. Clicking triggers login modal
3. After login, user can retry

## Data Structure

```typescript
{
  id: string,          // Generated UUID
  name: string,        // User-provided name
  description?: string, // Optional description
  entries: [],         // Empty initially
  shareToken: string,  // Generated for sharing
  createdAt: Date,
  updatedAt: Date
}
```

## Related Test Cases

- [TC-12: Create Task](../../02-TEST-CASES/F05-task-management/TC-12-create-task.md)

## Notes

- Tasks persist in backend database (per user)
- Share token is generated at creation time
- Empty tasks can exist (add entries later)
