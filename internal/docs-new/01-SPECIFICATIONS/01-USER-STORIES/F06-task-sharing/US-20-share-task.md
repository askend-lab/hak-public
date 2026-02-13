# US-20: Generate Shareable Link

**Feature:** F06 Task Sharing  
**Priority:** High

## User Story

As a **language teacher**  
I want to **generate a shareable link for my task**  
So that **I can distribute exercises to my students**

## Acceptance Criteria

- [x] **AC-1:** "Jaga" (Share) option is available in task menu
- [x] **AC-2:** Clicking opens Share Task modal
- [x] **AC-3:** Modal displays the shareable URL
- [x] **AC-4:** "Kopeeri" button copies URL to clipboard
- [x] **AC-5:** Success notification on copy
- [x] **AC-6:** URL includes share token parameter
- [x] **AC-7:** Same share token persists for task

## UI Behavior

### Accessing Share

**From Task List:**
1. Click ⋯ menu on task
2. Select "Jaga"
3. Share modal opens

**From Task Detail View:**
1. Click ⋯ menu in header
2. Select "Jaga"
3. Share modal opens

### Share Modal

```
┌─────────────────────────────────────────┐
│ Jaga ülesannet                      [X]│
├─────────────────────────────────────────┤
│                                         │
│ Hääldusharjutus 1                       │
│                                         │
│ Kopeeri see link, et jagada ülesannet:  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ https://haaldusabi.eki.ee/share/   │ │
│ │ abc123def456                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│                           [Kopeeri]     │
│                                         │
└─────────────────────────────────────────┘
```

### Copy to Clipboard

1. User clicks "Kopeeri" button
2. URL copied to system clipboard
3. Notification: "Link kopeeritud!"

### URL Format

```
https://{domain}/share/{shareToken}

Example:
https://haaldusabi.eki.ee/share/abc123def456
```

### Share Token

- Generated at task creation time
- Unique per task
- Does not change when task is edited
- Enables read-only access without authentication

## Related Test Cases

- [TC-15: Share and Access Task](../../02-TEST-CASES/F06-task-sharing/TC-15-share-task.md)

## Notes

- Share link works for anyone with the link
- Recipients have read-only access
- No authentication required to view shared task
- Task owner retains full control
