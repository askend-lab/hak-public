# US-19: Add Sentences to Task

**Feature:** F05 Task Management  
**Priority:** Critical

## User Story

As a **language teacher**  
I want to **add my synthesized sentences to a task**  
So that **I can build exercises from my practice content**

## Acceptance Criteria

### From Synthesis View Header
- [x] **AC-1:** "Lisa ülesandesse" button appears in page header when sentences have text
- [x] **AC-2:** Clicking opens dropdown with task list and search
- [x] **AC-3:** Selecting a task adds all sentences with text to it
- [x] **AC-4:** "Loo uus ülesanne" option creates new task with sentences

### From Individual Sentence Menu
- [x] **AC-5:** Each sentence menu has "Lisa ülesandesse" option
- [x] **AC-6:** For unauthenticated users, clicking triggers login flow
- [x] **AC-7:** For authenticated users, shows task list dropdown
- [x] **AC-8:** Selecting a task adds that single sentence

### General
- [x] **AC-9:** Success notification shows task name
- [x] **AC-10:** User must be authenticated

## UI Behavior

### Add All Button (Header)

```
[Lisa ülesandesse (3)]  ← Shows sentence count
         ↓
┌─────────────────────┐
│ 🔍 Otsi             │
├─────────────────────┤
│ Hääldusharjutus 1   │
│ Välted ja palatal...│
│ Tervitused          │
├─────────────────────┤
│ + Loo uus ülesanne  │
└─────────────────────┘
```

### Individual Sentence Menu

```
⋯ Menu
├── Lisa ülesandesse      (shows task dropdown if authenticated)
├── Uuri häälduskuju      (Explore phonetic)
├── Lae alla .wav fail
├── Kopeeri tekst
└── Eemalda
```

### Add Flow (Existing Task)

1. User clicks "Lisa ülesandesse"
2. Dropdown appears with task list
3. User types to filter (optional)
4. User clicks on task name
5. All sentences with text are added as entries
6. Dropdown closes
7. Success notification shown

### Add Flow (New Task)

1. User clicks "Loo uus ülesanne" in dropdown
2. Task creation modal opens
3. User enters name and description
4. User clicks "Loo ülesanne"
5. Task created with sentences as entries
6. Modal closes
7. Notification shown

### Entry Data

Each sentence becomes an entry:
```typescript
{
  id: string,
  text: sentence.text,           // Display text
  stressedText: sentence.phoneticText || sentence.text,  // Phonetic
  audioUrl: null,                // Not transferred
  audioBlob: null
}
```

### Authentication Required

If not authenticated:
1. Clicking "Lisa ülesandesse" triggers login modal
2. After login, user can retry

## Related Test Cases

- [TC-14: Add Entries to Task](../../02-TEST-CASES/F05-task-management/TC-14-add-entries.md)

## Notes

- Audio is not transferred (regenerated on playback)
- Phonetic text is preserved if available
- Same sentence can be added to multiple tasks
- Entries can be added to task multiple times (duplicates allowed)
