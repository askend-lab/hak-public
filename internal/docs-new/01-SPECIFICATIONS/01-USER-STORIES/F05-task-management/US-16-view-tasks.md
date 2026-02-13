# US-16: View Task List

**Feature:** F05 Task Management  
**Priority:** Critical

## User Story

As a **language teacher**  
I want to **view all my tasks in a list**  
So that **I can manage and access my exercises**

## Acceptance Criteria

- [x] **AC-1:** "Ülesanded" (Tasks) navigation link is visible in header
- [x] **AC-2:** Clicking the link shows the Tasks view
- [x] **AC-3:** Task list displays all user's tasks
- [x] **AC-4:** Each task shows name and entry count
- [x] **AC-5:** Tasks are clickable to view details
- [x] **AC-6:** Each task has action menu (edit, delete, share)
- [x] **AC-7:** Empty state is shown when no tasks exist
- [x] **AC-8:** User must be authenticated to view tasks

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
│ │ Välted ja peenendus                 [⋯]│ │
│ │ 12 lausungit                            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Task Item Actions

Clicking on task name/row → Opens task details

Menu (⋯) options:
- Muuda (Edit) → Opens edit modal
- Jaga (Share) → Opens share modal
- Kustuta (Delete) → Opens confirmation

### Empty State

When user has no tasks, empty state message shown with CTA button.

### Loading State

While fetching tasks:
- Loading spinner shown

## Protected Route Behavior

1. Unauthenticated user clicks "Ülesanded"
2. Login modal appears
3. After successful login, Tasks view opens
4. If login cancelled, user stays on previous view

## Related Test Cases

- [TC-13: Task CRUD Operations](../../02-TEST-CASES/F05-task-management/TC-13-task-crud.md)

## Notes

- Task list is fetched from DataService (backend API)
- List refreshes when returning from detail view
