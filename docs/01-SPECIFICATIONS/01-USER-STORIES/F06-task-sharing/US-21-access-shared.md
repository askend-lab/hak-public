# US-21: Access Shared Task

**Feature:** F06 Task Sharing  
**Priority:** High

## User Story

As a **language learner**  
I want to **access a shared task via link**  
So that **I can practice the exercises my teacher created**

## Acceptance Criteria

- [ ] **AC-1:** Shared link opens the task in read-only mode
- [ ] **AC-2:** Task name and description are visible
- [ ] **AC-3:** All task entries are displayed
- [ ] **AC-4:** Each entry can be played
- [ ] **AC-5:** No authentication required to view
- [ ] **AC-6:** "Kopeeri kõnevooru" option copies entries to playlist
- [ ] **AC-7:** Copied entries persist in localStorage
- [ ] **AC-8:** User cannot edit or delete shared task entries

## UI Behavior

### Accessing Shared Task

1. User receives link: `https://haaldusabi.eki.ee/share/abc123`
2. User opens link in browser
3. Shared task view loads
4. Task content is displayed

### Shared Task View

```
┌─────────────────────────────────────────────┐
│ ← Tagasi                                    │
├─────────────────────────────────────────────┤
│                                             │
│ Hääldusharjutus 1                           │
│ Selle ülesande eesmärk on harjutada...      │
│                                             │
│           [Kopeeri kõnevooru]               │
│                                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Tere päevast                       [▶] │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Kuidas läheb                       [▶] │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Aitäh, hästi                       [▶] │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Read-Only Restrictions

- No edit button on entries
- No delete button on entries
- No add entry button
- No drag-and-drop reordering
- No menu for modifying entries

### Available Actions

| Action | Available |
|--------|-----------|
| Play entry | Yes |
| Play all | Yes |
| Click word for variants | Yes |
| Copy to playlist | Yes |
| Edit entry | No |
| Delete entry | No |
| Reorder entries | No |

### Copy to Playlist

1. User clicks "Kopeeri kõnevooru"
2. All entries are saved to localStorage
3. User is navigated to Synthesis view
4. Entries appear as sentences in playlist
5. User can now edit/play/save to their own tasks

### LocalStorage Structure

```javascript
localStorage.setItem('eki_playlist_entries', JSON.stringify([
  { id: 'entry1', text: 'Tere päevast', stressedText: 'Tere päevast' },
  { id: 'entry2', text: 'Kuidas läheb', stressedText: 'Kuidas läheb' },
  // ...
]));
```

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
- Copy to playlist allows offline practice
- Original task remains unaffected by recipient actions
- No analytics on who accessed the link
