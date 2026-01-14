# US-19: Add Sentences to Task

**Feature:** F05 Task Management  
**Priority:** Critical

## User Story

As a **language teacher**  
I want to **add my synthesized sentences to a task**  
So that **I can build exercises from my practice content**

## Acceptance Criteria

### From Synthesis View
- [ ] **AC-1:** "Lisa ülesandesse" button appears when sentences have content
- [ ] **AC-2:** Button shows count of sentences with text
- [ ] **AC-3:** Clicking opens dropdown with task list
- [ ] **AC-4:** Dropdown has search filter for tasks
- [ ] **AC-5:** Selecting a task adds all sentences to it
- [ ] **AC-6:** "Loo uus ülesanne" option creates new task with sentences

### From Individual Sentence Menu
- [ ] **AC-7:** Each sentence menu has "Lisa ülesandesse" submenu
- [ ] **AC-8:** Submenu shows list of existing tasks
- [ ] **AC-9:** Selecting a task adds that single sentence
- [ ] **AC-10:** "Loo uus ülesanne" option available

### General
- [ ] **AC-11:** Success notification shows task name and count
- [ ] **AC-12:** Notification has "Vaata ülesannet" action button
- [ ] **AC-13:** User must be authenticated

## UI Behavior

### Add All Button

```
[Lisa ülesandesse (3)]  ← Shows when sentences have text
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
├── Lisa ülesandesse  →  ┌─────────────────────┐
│                        │ 🔍 Otsi             │
│                        ├─────────────────────┤
│                        │ Hääldusharjutus 1   │
│                        │ Välted ja palatal...│
│                        ├─────────────────────┤
│                        │ + Loo uus ülesanne  │
│                        └─────────────────────┘
├── Uuri foneetilist kuju
├── Lae alla .wav fail
└── Eemalda
```

### Add Flow (Existing Task)

1. User clicks "Lisa ülesandesse (3)"
2. Dropdown appears with task list
3. User types to filter (optional)
4. User clicks on task name
5. All sentences with text are added as entries
6. Dropdown closes
7. Notification: "3 lauset lisatud ülesandesse Hääldusharjutus 1!"
8. Notification has "Vaata ülesannet" button

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
