# US-16: View Task List

**Feature:** F05 Task Management  
**Priority:** Critical

## User Story

As a **language teacher**  
I want to **view all my tasks in a list**  
So that **I can manage and access my exercises**

## Acceptance Criteria

- [ ] **AC-1:** "Ülesanded" (Tasks) navigation link is visible in header
- [ ] **AC-2:** Clicking the link shows the Tasks view
- [ ] **AC-3:** Task list displays all user's tasks
- [ ] **AC-4:** Each task shows name and entry count
- [ ] **AC-5:** Tasks are clickable to view details
- [ ] **AC-6:** Each task has action menu (edit, delete, share)
- [ ] **AC-7:** Empty state is shown when no tasks exist
- [ ] **AC-8:** User must be authenticated to view tasks

## UI Behavior

### Navigation

1. User clicks "Ülesanded" in header nav
2. If not authenticated: Login modal appears
3. If authenticated: Tasks view loads

### Task List Layout

```
┌─────────────────────────────────────────────┐
│ Ülesanded                           [Lisa]  │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Hääldusharjutus 1                   [⋯]│ │
│ │ 5 lausungit                             │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Välted ja palatalisatsioon          [⋯]│ │
│ │ 12 lausungit                            │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Tervitused                          [⋯]│ │
│ │ 0 lausungit                             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Task Item Actions

Clicking on task name/row → Opens task details (US-17)

Menu (⋯) options:
- Muuda (Edit) → Opens edit modal
- Jaga (Share) → Opens share modal
- Kustuta (Delete) → Opens confirmation

### Empty State

When user has no tasks:
```
┌─────────────────────────────────────────────┐
│ Ülesanded                           [Lisa]  │
├─────────────────────────────────────────────┤
│                                             │
│     [Empty state illustration]              │
│                                             │
│     Sul pole veel ülesandeid.               │
│     Loo esimene ülesanne!                   │
│                                             │
│          [Loo ülesanne]                     │
│                                             │
└─────────────────────────────────────────────┘
```

### Loading State

While fetching tasks:
- Loading spinner shown
- "Laen ülesandeid..." text

## Protected Route Behavior

1. Unauthenticated user clicks "Ülesanded"
2. Login modal appears with message: "Sisene, et luua ja hallata ülesandeid"
3. After successful login, Tasks view opens
4. If login cancelled, user stays on Synthesis view

## Related Test Cases

- [TC-13: Task CRUD Operations](../../02-TEST-CASES/F05-task-management/TC-13-task-crud.md)

## Notes

- Task list is fetched from DataService (localStorage)
- List refreshes when returning from detail view
- Sorting is by creation date (newest first)
