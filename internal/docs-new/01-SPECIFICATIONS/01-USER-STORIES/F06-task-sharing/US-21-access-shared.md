# US-21: Access Shared Task

**Feature:** F06 Task Sharing  
**Priority:** High

## User Story

As a **language learner**  
I want to **access a shared task via link**  
So that **I can practice the exercises my teacher created**

## Acceptance Criteria

- [x] **AC-1:** Shared link opens the task in read-only mode
- [x] **AC-2:** Task name and description are visible
- [x] **AC-3:** All task entries are displayed
- [x] **AC-4:** Each entry can be played
- [x] **AC-5:** "Play All" (Mängi kõik) is available
- [x] **AC-6:** No authentication required to view
- [x] **AC-7:** "Kopeeri" button copies entries to synthesis view
- [x] **AC-8:** User cannot edit or delete shared task entries

## UI Behavior

### Accessing Shared Task

1. User receives link: `https://haaldusabi.eki.ee/share/abc123`
2. User opens link in browser
3. Shared task view loads
4. Task content is displayed

### Shared Task View

```
┌─────────────────────────────────────────────┐
│ [Header with EKI logo and navigation]       │
├─────────────────────────────────────────────┤
│                                             │
│ Hääldusharjutus 1            [Mängi kõik]   │
│ Selle ülesande eesmärk on harjutada...      │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Jagatud ülesanne                        │ │
│ │ Kopeeri laused, et neid muuta...        │ │
│ │                           [Kopeeri]     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [Tere] [päevast]                  [▶]  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ [Kuidas] [läheb]                  [▶]  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Read-Only Restrictions

- No edit button on entries
- No delete button on entries
- No drag-and-drop reordering
- Entry menu has limited options (explore phonetic, copy text)

### Available Actions

| Action | Available |
|--------|-----------|
| Play entry | Yes |
| Play all | Yes |
| Click word for variants | Yes |
| Explore phonetic (Uuri häälduskuju) | Yes |
| Copy text | Yes |
| Copy (Kopeeri) | Yes |
| Edit entry | No |
| Delete entry | No |
| Reorder entries | No |

### Copy to Synthesis View

1. User clicks "Kopeeri" button in the info banner
2. All entries are copied to synthesis state
3. User is navigated to Synthesis view (/)
4. Entries appear as sentences in playlist
5. User can now edit/play/save to their own tasks

## Error Handling

### Invalid Share Token

If token is invalid or task not found:
```
┌─────────────────────────────────────────────┐
│                                             │
│     Ülesannet ei leitud                     │
│                                             │
│     See jagatud link võib olla aegunud      │
│     või vigane.                             │
│                                             │
│            [Tagasi avalehele]               │
│                                             │
└─────────────────────────────────────────────┘
```

## Related Test Cases

- [TC-15: Share and Access Task](../../02-TEST-CASES/F06-task-sharing/TC-15-share-task.md)

## Notes

- Shared view is completely unauthenticated
- Copy to synthesis allows offline practice
- Original task remains unaffected by recipient actions
